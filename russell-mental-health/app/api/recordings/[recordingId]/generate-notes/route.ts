/**
 * Generate Clinical Notes API
 * Generates SOAP/DAP/BIRP format clinical notes from existing transcript
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GeminiProvider } from '@/lib/ai/gemini'
import { Storage } from '@google-cloud/storage'
import { SessionDocumentType } from '@prisma/client'

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.startsWith('{')
      ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) }
      : { keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY }
    : {}),
})

type NoteFormat = 'SOAP' | 'DAP' | 'BIRP'

/**
 * Type-safe helper to map note format to SessionDocumentType enum
 */
function getNoteDocumentType(format: NoteFormat): SessionDocumentType {
  const typeMap: Record<NoteFormat, SessionDocumentType> = {
    SOAP: 'SOAP_NOTES',
    DAP: 'DAP_NOTES',
    BIRP: 'BIRP_NOTES',
  }
  return typeMap[format]
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

    // Only therapists can generate notes
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
    const body = await request.json()
    const format: NoteFormat = body.format || 'SOAP'

    // Validate format
    if (!['SOAP', 'DAP', 'BIRP'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid note format. Must be SOAP, DAP, or BIRP' },
        { status: 400 }
      )
    }

    console.log(`[Generate Notes] Generating ${format} notes for recording:`, recordingId)

    // Fetch recording with appointment data
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
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

    // Check if notes already exist for this format
    const documentType = getNoteDocumentType(format)
    const existingNotes = await prisma.sessionDocument.findFirst({
      where: {
        appointmentId: recording.appointmentId,
        documentType,
      },
    })

    if (existingNotes) {
      return NextResponse.json(
        {
          message: `${format} notes already exist for this session`,
          documentId: existingNotes.id,
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

    console.log(`[Generate Notes] Fetching transcript from GCS: ${transcriptDoc.gcsPath}`)

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(transcriptDoc.gcsPath)
    const [fileContent] = await file.download()
    const transcript = JSON.parse(fileContent.toString('utf-8'))

    // Generate notes using Gemini
    const gemini = new GeminiProvider(process.env.GEMINI_API_KEY)

    console.log(`[Generate Notes] Generating ${format} notes using Gemini...`)

    // Use a map of generator functions for better extensibility
    // Pass sessionDate from appointment (not generation date)
    const noteGenerators = {
      SOAP: () => gemini.generateSOAPNotes(transcript, { sessionDate: recording.appointment.startTime }),
      DAP: () => gemini.generateDAPNotes(transcript, { sessionDate: recording.appointment.startTime }),
      BIRP: () => gemini.generateBIRPNotes(transcript, { sessionDate: recording.appointment.startTime }),
    }
    const notes = await noteGenerators[format]()

    console.log(`[Generate Notes] ${format} notes generated successfully`)

    // Upload notes to GCS
    const timestamp = Date.now()
    const gcsPath = `clinical-notes/${recording.appointment.patientId}/${recording.appointmentId}-${format.toLowerCase()}-${timestamp}.json`

    console.log(`[Generate Notes] Uploading to GCS: ${gcsPath}`)

    const notesFile = bucket.file(gcsPath)
    await notesFile.save(JSON.stringify(notes, null, 2), {
      contentType: 'application/json',
      metadata: {
        appointmentId: recording.appointmentId,
        patientId: recording.appointment.patientId,
        format,
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
        documentType,
        title: `${format} Clinical Notes - ${formattedDate} Session`,
        gcsPath,
        aiGenerated: true,
        aiProvider: 'gemini',
        aiModel: gemini.getModel(),
        language: transcript.language || 'en',
      },
    })

    console.log(`[Generate Notes] SessionDocument created: ${sessionDocument.id}`)

    return NextResponse.json({
      success: true,
      documentId: sessionDocument.id,
      format,
      message: `${format} notes generated successfully`,
    })
  } catch (error: any) {
    console.error('[Generate Notes API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate clinical notes' },
      { status: 500 }
    )
  }
}
