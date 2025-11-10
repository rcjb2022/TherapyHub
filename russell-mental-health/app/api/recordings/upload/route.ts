/**
 * Recording Upload API
 * Handles video recording uploads to Google Cloud Storage
 * Organizes by patient: recordings/{patientId}/{appointmentId}-{timestamp}.webm
 * Sets 30-day expiration for automatic cleanup
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Storage } from '@google-cloud/storage'

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.startsWith('{')
      ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) }
      : { keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY }
    : {}),
})

const bucketName = process.env.GCS_BUCKET_NAME || ''

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload API] Receiving recording upload request...')

    // Validate GCS configuration
    if (!bucketName) {
      console.error('[Upload API] GCS_BUCKET_NAME not configured')
      return NextResponse.json(
        { error: 'Storage not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Parse multipart form data with robust validation
    const formData = await request.formData()
    const videoBlob = formData.get('video')
    const appointmentId = formData.get('appointmentId')
    const durationStr = formData.get('duration')
    const duration = typeof durationStr === 'string' ? parseInt(durationStr, 10) : NaN

    // Validate all required fields with proper type checking
    if (
      !(videoBlob instanceof Blob) ||
      typeof appointmentId !== 'string' ||
      !appointmentId ||
      isNaN(duration)
    ) {
      console.error('[Upload API] Missing or invalid required fields')
      return NextResponse.json(
        { error: 'Missing or invalid fields: video, appointmentId, duration' },
        { status: 400 }
      )
    }

    console.log(`[Upload API] Appointment ID: ${appointmentId}`)
    console.log(`[Upload API] Video size: ${videoBlob.size} bytes`)
    console.log(`[Upload API] Duration: ${duration} seconds`)

    // Look up appointment to get patientId
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { patientId: true },
    })

    if (!appointment) {
      console.error(`[Upload API] Appointment not found: ${appointmentId}`)
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const { patientId } = appointment
    console.log(`[Upload API] Patient ID: ${patientId}`)

    // Convert blob to buffer
    const arrayBuffer = await videoBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to GCS at recordings/{patientId}/{appointmentId}-{timestamp}.webm
    const timestamp = Date.now()
    const gcsPath = `recordings/${patientId}/${appointmentId}-${timestamp}.webm`

    console.log(`[Upload API] Uploading to GCS: ${gcsPath}`)

    const bucket = storage.bucket(bucketName)
    const blob = bucket.file(gcsPath)

    await blob.save(buffer, {
      contentType: 'video/webm',
      metadata: {
        uploadedAt: new Date().toISOString(),
        appointmentId,
        patientId,
        duration: duration.toString(),
      },
    })

    console.log('[Upload API] ✅ Upload to GCS successful')

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create Recording entry in database
    const recording = await prisma.recording.create({
      data: {
        appointmentId,
        patientId,
        gcsPath,
        fileSize: buffer.length,
        duration,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - duration * 1000), // Approximate start time
        endedAt: new Date(),
        expiresAt,
      },
    })

    console.log(`[Upload API] ✅ Recording saved to database: ${recording.id}`)

    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      gcsPath,
      expiresAt,
      message: 'Recording uploaded successfully',
    })
  } catch (error: any) {
    console.error('[Upload API] ❌ Upload failed:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    )
  }
}
