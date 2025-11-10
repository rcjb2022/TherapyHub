/**
 * Translation API
 * Translates transcript or summary to target language
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GeminiProvider } from '@/lib/ai/gemini'
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.startsWith('{')
      ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) }
      : { keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY }
    : {}),
})

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ja: 'Japanese',
  zh: 'Chinese',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  // Await params in Next.js 15+
  const { recordingId } = await params

  try {
    // Validate GCS configuration
    const bucketName = process.env.GCS_BUCKET_NAME
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      )
    }

    // Authenticate
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can translate documents
    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get therapist record
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist record not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const targetLanguage: string = body.targetLanguage || 'es'
    const sourceType: 'transcript' | 'summary' = body.sourceType || 'summary'

    if (!Object.keys(LANGUAGE_NAMES).includes(targetLanguage)) {
      return NextResponse.json(
        { error: 'Invalid target language' },
        { status: 400 }
      )
    }

    console.log(`[Translate] Translating ${sourceType} to ${targetLanguage} for recording:`, recordingId)

    // Fetch recording with appointment data
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        appointment: {
          include: {
            therapist: {
              select: { id: true },
            },
          },
        },
      },
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    // Verify therapist owns this recording
    if (recording.appointment.therapist.id !== therapist.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the source document (transcript or summary)
    const sourceDocType = sourceType === 'transcript' ? 'TRANSCRIPT' : 'SUMMARY'
    const sourceDoc = await prisma.sessionDocument.findFirst({
      where: {
        appointmentId: recording.appointmentId,
        documentType: sourceDocType,
      },
    })

    if (!sourceDoc) {
      return NextResponse.json(
        { error: `No ${sourceType} found. Please generate ${sourceType} first.` },
        { status: 404 }
      )
    }

    // Get text to translate
    let textToTranslate: string | undefined
    let sourceLanguage: string = sourceDoc.language || 'en' // Set a default

    if (typeof sourceDoc.content === 'string' && sourceDoc.content) {
      // Content is directly in the DB (likely a summary)
      textToTranslate = sourceDoc.content
    } else if (sourceDoc.gcsPath) {
      // Content is in GCS (likely a transcript)
      console.log(`[Translate] Fetching ${sourceType} from GCS: ${sourceDoc.gcsPath}`)

      const bucket = storage.bucket(bucketName)
      const file = bucket.file(sourceDoc.gcsPath)
      const [fileContent] = await file.download()
      const fileString = fileContent.toString('utf-8')

      // Parse JSON with specific error handling
      let parsed: any
      try {
        parsed = JSON.parse(fileString)
      } catch (jsonError) {
        console.error(`[Translate] Failed to parse JSON from GCS file ${sourceDoc.gcsPath}:`, jsonError)
        return NextResponse.json(
          { error: 'Source document in storage is malformed or corrupted.' },
          { status: 500 }
        )
      }

      // Explicitly check for known text properties
      if (typeof parsed.fullText === 'string' && parsed.fullText) {
        textToTranslate = parsed.fullText
      } else if (typeof parsed.text === 'string' && parsed.text) {
        textToTranslate = parsed.text
      }

      // Override source language if detected in transcript
      if (parsed.language) {
        sourceLanguage = parsed.language
      }
    }

    if (!textToTranslate) {
      return NextResponse.json(
        { error: 'Source document has no translatable content or content is empty.' },
        { status: 404 }
      )
    }

    // Don't translate if already in target language
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json(
        { error: `Document is already in ${LANGUAGE_NAMES[targetLanguage]}` },
        { status: 400 }
      )
    }

    // Translate using Gemini
    const gemini = new GeminiProvider(process.env.GEMINI_API_KEY)

    console.log(`[Translate] Translating from ${sourceLanguage} to ${targetLanguage}...`)

    const translationResult = await gemini.translate(textToTranslate, targetLanguage, {
      sourceLanguage,
      preserveFormatting: true,
    })

    console.log(`[Translate] Translation completed successfully`)

    // Upload translation to GCS
    const timestamp = Date.now()
    const gcsPath = `translations/${recording.appointment.patientId}/${recording.appointmentId}-${sourceType}-${targetLanguage}-${timestamp}.txt`

    console.log(`[Translate] Uploading to GCS: ${gcsPath}`)

    const translationFile = bucket.file(gcsPath)
    await translationFile.save(translationResult.translatedText, {
      contentType: 'text/plain',
      metadata: {
        appointmentId: recording.appointmentId,
        patientId: recording.appointment.patientId,
        sourceType,
        sourceLanguage: translationResult.sourceLanguage,
        targetLanguage: translationResult.targetLanguage,
        generatedAt: new Date().toISOString(),
      },
    })

    // Format session date
    const sessionDate = new Date(recording.appointment.startTime)
    const formattedDate = `${sessionDate.getMonth() + 1}/${sessionDate.getDate()}/${sessionDate.getFullYear()}`

    // Save to database
    const sessionDocument = await prisma.sessionDocument.create({
      data: {
        recordingId: recording.id,
        appointmentId: recording.appointmentId,
        patientId: recording.appointment.patientId,
        documentType: 'TRANSLATION',
        title: `${LANGUAGE_NAMES[targetLanguage]} Translation - ${formattedDate}`,
        content: translationResult.translatedText, // Store in content field for easy copying
        gcsPath,
        aiGenerated: true,
        aiProvider: 'gemini',
        aiModel: gemini.getModel(),
        language: targetLanguage,
        translatedFrom: sourceLanguage,
      },
    })

    console.log(`[Translate] SessionDocument created: ${sessionDocument.id}`)

    return NextResponse.json({
      success: true,
      documentId: sessionDocument.id,
      sourceLanguage: translationResult.sourceLanguage,
      targetLanguage: translationResult.targetLanguage,
      message: `Translated to ${LANGUAGE_NAMES[targetLanguage]} successfully`,
    })
  } catch (error: any) {
    console.error('[Translate API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to translate document' },
      { status: 500 }
    )
  }
}
