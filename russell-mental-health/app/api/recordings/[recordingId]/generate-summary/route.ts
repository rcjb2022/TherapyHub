/**
 * Generate Session Summary API
 * Generates a brief/detailed/clinical summary from existing transcript
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

    // Only therapists can generate summaries
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

    // Parse request body (optional style parameter)
    const body = await request.json().catch(() => ({}))
    const style: 'brief' | 'detailed' | 'clinical' = body.style || 'clinical'

    console.log(`[Generate Summary] Generating ${style} summary for recording:`, recordingId)

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

    // Check if summary already exists
    const existingSummary = await prisma.sessionDocument.findFirst({
      where: {
        appointmentId: recording.appointmentId,
        documentType: 'SUMMARY',
      },
    })

    if (existingSummary) {
      return NextResponse.json(
        {
          message: 'Summary already exists for this session',
          documentId: existingSummary.id,
          existing: true,
        },
        { status: 200 }
      )
    }

    // Fetch the transcript document
    const transcriptDoc = await prisma.sessionDocument.findFirst({
      where: {
        appointmentId: recording.appointmentId,
        documentType: 'TRANSCRIPT',
      },
    })

    if (!transcriptDoc) {
      return NextResponse.json(
        { error: 'No transcript found. Please generate transcript first.' },
        { status: 404 }
      )
    }

    // Fetch transcript content from GCS
    if (!transcriptDoc.gcsPath) {
      return NextResponse.json(
        { error: 'Transcript file path missing' },
        { status: 500 }
      )
    }

    console.log(`[Generate Summary] Fetching transcript from GCS: ${transcriptDoc.gcsPath}`)

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(transcriptDoc.gcsPath)
    const [fileContent] = await file.download()
    const transcript = JSON.parse(fileContent.toString('utf-8'))

    // Generate summary using Gemini
    const gemini = new GeminiProvider(process.env.GEMINI_API_KEY)

    console.log(`[Generate Summary] Generating ${style} summary using Gemini...`)

    const summaryText = await gemini.summarize(transcript, {
      style,
      language: transcript.language || 'en',
    })

    console.log(`[Generate Summary] Summary generated successfully`)

    // Upload summary to GCS
    const timestamp = Date.now()
    const gcsPath = `summaries/${recording.appointment.patientId}/${recording.appointmentId}-summary-${timestamp}.txt`

    console.log(`[Generate Summary] Uploading to GCS: ${gcsPath}`)

    const summaryFile = bucket.file(gcsPath)
    await summaryFile.save(summaryText, {
      contentType: 'text/plain',
      metadata: {
        appointmentId: recording.appointmentId,
        patientId: recording.appointment.patientId,
        style,
        generatedAt: new Date().toISOString(),
      },
    })

    // Format session date to match transcript naming convention
    const sessionDate = new Date(recording.appointment.startTime)
    const formattedDate = `${sessionDate.getMonth() + 1}/${sessionDate.getDate()}/${sessionDate.getFullYear()}`

    // Save to database
    const sessionDocument = await prisma.sessionDocument.create({
      data: {
        recordingId: recording.id,
        appointmentId: recording.appointmentId,
        patientId: recording.appointment.patientId,
        documentType: 'SUMMARY',
        title: `Session Summary - ${formattedDate}`,
        content: summaryText, // Store in content field for easy copying
        gcsPath,
        aiGenerated: true,
        aiProvider: 'gemini',
        aiModel: gemini.getModel(),
        language: transcript.language || 'en',
      },
    })

    console.log(`[Generate Summary] SessionDocument created: ${sessionDocument.id}`)

    return NextResponse.json({
      success: true,
      documentId: sessionDocument.id,
      style,
      message: `${style} summary generated successfully`,
    })
  } catch (error: any) {
    console.error('[Generate Summary API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
