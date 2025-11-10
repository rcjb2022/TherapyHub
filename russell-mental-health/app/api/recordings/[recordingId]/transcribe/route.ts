/**
 * Recording Transcription API
 * Generates AI transcript and captions from video recording
 * Uses Gemini 2.5 Flash (primary) with GROK fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Storage } from '@google-cloud/storage'
import { AIService } from '@/lib/ai/provider'
import { transcriptToWebVTT, getCaptionFilename, detectLanguage } from '@/lib/captions'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

// Initialize Google Cloud Storage
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
  { params }: { params: { recordingId: string } }
) {
  try {
    const { recordingId } = params

    // Validate GCS configuration
    const bucketName = process.env.GCS_BUCKET_NAME
    if (!bucketName) {
      console.error('[Transcribe API] GCS_BUCKET_NAME not configured')
      return NextResponse.json(
        { error: 'Storage not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Authenticate and authorize
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can transcribe recordings
    if (session.user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log(`[Transcribe API] Starting transcription for recording: ${recordingId}`)

    // Get the therapist record
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist record not found' }, { status: 404 })
    }

    // Fetch the recording
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        appointment: {
          select: { therapistId: true },
        },
      },
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    // Verify therapist owns this recording
    if (recording.appointment.therapistId !== therapist.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if already transcribed
    if (recording.transcriptionStatus === 'COMPLETED') {
      return NextResponse.json({
        message: 'Recording already transcribed',
        transcriptUrl: recording.transcriptGcsPath,
        captionUrl: recording.captionGcsPath,
      })
    }

    // Update status to PROCESSING
    await prisma.recording.update({
      where: { id: recordingId },
      data: { transcriptionStatus: 'PROCESSING' },
    })

    // Stream video from GCS to temporary file (avoids loading entire file into memory)
    console.log(`[Transcribe API] Streaming video from GCS: ${recording.gcsPath}`)
    const bucket = storage.bucket(bucketName)
    const videoFile = bucket.file(recording.gcsPath)

    // Create temporary file for streaming
    const tempFilePath = path.join(os.tmpdir(), `recording-${recordingId}-${Date.now()}.webm`)

    try {
      // Stream download to temp file instead of loading into memory
      await new Promise<void>((resolve, reject) => {
        const writeStream = require('fs').createWriteStream(tempFilePath)
        videoFile.createReadStream()
          .pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject)
      })

      console.log(`[Transcribe API] Video streamed to temp file: ${tempFilePath}`)

      // Transcribe using AI Service (Gemini with GROK fallback)
      console.log('[Transcribe API] Sending to AI for transcription...')
      const aiService = new AIService()

      const transcript = await aiService.transcribeFromFile(tempFilePath, {
        language: recording.language || undefined,
        includeTimestamps: true,
        speakerLabels: ['Therapist', 'Patient'],
        mimeType: 'video/webm',
      })

      console.log(`[Transcribe API] Transcription complete: ${transcript.segments.length} segments`)
    } finally {
      // Always clean up temp file
      try {
        await fs.unlink(tempFilePath)
        console.log(`[Transcribe API] Cleaned up temp file`)
      } catch (cleanupError) {
        console.warn(`[Transcribe API] Failed to delete temp file:`, cleanupError)
      }
    }

    // Detect language if not already set
    const detectedLanguage = recording.language || detectLanguage(transcript.fullText)

    // Convert transcript to WebVTT for captions
    const vttContent = transcriptToWebVTT(transcript)

    // Generate filenames
    const timestamp = Date.now()
    const baseFilename = recording.gcsPath.split('/').pop()?.replace('.webm', '') || 'recording'

    const transcriptPath = `recordings/${recording.patientId}/${baseFilename}-transcript.json`
    const captionPath = `recordings/${recording.patientId}/${getCaptionFilename(
      recording.appointmentId,
      timestamp,
      detectedLanguage
    )}`

    // Upload transcript JSON to GCS
    console.log(`[Transcribe API] Uploading transcript to GCS: ${transcriptPath}`)
    await bucket.file(transcriptPath).save(JSON.stringify(transcript, null, 2), {
      contentType: 'application/json',
      metadata: {
        uploadedAt: new Date().toISOString(),
        recordingId,
        language: detectedLanguage,
      },
    })

    // Upload caption VTT file to GCS
    console.log(`[Transcribe API] Uploading captions to GCS: ${captionPath}`)
    await bucket.file(captionPath).save(vttContent, {
      contentType: 'text/vtt',
      metadata: {
        uploadedAt: new Date().toISOString(),
        recordingId,
        language: detectedLanguage,
      },
    })

    // Update Recording with transcript/caption paths
    await prisma.recording.update({
      where: { id: recordingId },
      data: {
        transcriptGcsPath: transcriptPath,
        captionGcsPath: captionPath,
        transcriptionStatus: 'COMPLETED',
        language: detectedLanguage,
      },
    })

    // Create SessionDocument for the transcript
    await prisma.sessionDocument.create({
      data: {
        recordingId: recording.id,
        appointmentId: recording.appointmentId,
        patientId: recording.patientId,
        documentType: 'TRANSCRIPT',
        title: `Session Transcript - ${new Date(recording.startedAt).toLocaleDateString()}`,
        content: transcript,
        gcsPath: transcriptPath,
        aiGenerated: true,
        aiProvider: transcript.generatedBy,
        language: detectedLanguage,
      },
    })

    console.log(`[Transcribe API] ✅ Transcription complete for ${recordingId}`)

    return NextResponse.json({
      success: true,
      transcript: {
        path: transcriptPath,
        segments: transcript.segments.length,
        duration: transcript.duration,
        language: detectedLanguage,
      },
      captions: {
        path: captionPath,
        language: detectedLanguage,
      },
      provider: transcript.generatedBy,
    })
  } catch (error: any) {
    console.error('[Transcribe API] Error:', error)

    // Update recording status to FAILED
    try {
      await prisma.recording.update({
        where: { id: params.recordingId },
        data: { transcriptionStatus: 'FAILED' },
      })
    } catch (updateError) {
      console.error('[Transcribe API] Failed to update recording status:', updateError)
    }

    return NextResponse.json(
      { error: 'Transcription failed', details: error.message },
      { status: 500 }
    )
  }
}
