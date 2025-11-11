/**
 * Recording Management API
 * DELETE /api/recordings/[recordingId]
 *
 * Allows therapist to manually delete recording before 30-day expiration
 * Preserves SessionDocuments (7-year retention)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.startsWith('{')
      ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) }
      : { keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY }
    : {}),
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
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

    // Only therapists can delete recordings
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

    console.log(`[Delete Recording] Therapist ${therapist.id} deleting recording: ${recordingId}`)

    // Fetch recording with appointment data to verify ownership
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

    // Check if already deleted
    if (recording.status === 'EXPIRED') {
      return NextResponse.json({
        message: 'Recording already deleted',
        recordingId,
      })
    }

    const bucket = storage.bucket(bucketName)
    const deletedFiles: string[] = []
    const errors: string[] = []

    // Delete video file from GCS
    if (recording.gcsPath) {
      try {
        const videoFile = bucket.file(recording.gcsPath)
        const [exists] = await videoFile.exists()
        if (exists) {
          await videoFile.delete()
          deletedFiles.push(recording.gcsPath)
          console.log(`[Delete Recording] Deleted video: ${recording.gcsPath}`)
        }
      } catch (err) {
        const error = `Failed to delete video file: ${err instanceof Error ? err.message : 'Unknown'}`
        errors.push(error)
        console.error(`[Delete Recording] ${error}`)
      }
    }

    // Delete transcript file (if exists)
    if (recording.transcriptGcsPath) {
      try {
        const transcriptFile = bucket.file(recording.transcriptGcsPath)
        const [exists] = await transcriptFile.exists()
        if (exists) {
          await transcriptFile.delete()
          deletedFiles.push(recording.transcriptGcsPath)
          console.log(`[Delete Recording] Deleted transcript: ${recording.transcriptGcsPath}`)
        }
      } catch (err) {
        const error = `Failed to delete transcript file: ${err instanceof Error ? err.message : 'Unknown'}`
        errors.push(error)
        console.error(`[Delete Recording] ${error}`)
      }
    }

    // Delete caption file (if exists)
    if (recording.captionGcsPath) {
      try {
        const captionFile = bucket.file(recording.captionGcsPath)
        const [exists] = await captionFile.exists()
        if (exists) {
          await captionFile.delete()
          deletedFiles.push(recording.captionGcsPath)
          console.log(`[Delete Recording] Deleted caption: ${recording.captionGcsPath}`)
        }
      } catch (err) {
        const error = `Failed to delete caption file: ${err instanceof Error ? err.message : 'Unknown'}`
        errors.push(error)
        console.error(`[Delete Recording] ${error}`)
      }
    }

    // Mark recording as EXPIRED in database
    // DON'T actually delete the database record - keep for audit trail
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'EXPIRED' },
    })

    console.log(`[Delete Recording] Recording ${recordingId} marked as EXPIRED`)

    // Note: SessionDocuments are preserved (7-year retention)
    // They will automatically have recordingId set to null (onDelete: SetNull in schema)

    return NextResponse.json({
      success: true,
      message: 'Recording deleted successfully',
      recordingId,
      deletedFiles,
      errors: errors.length > 0 ? errors : undefined,
      note: 'Clinical documents preserved per FL law (7-year retention)',
    })
  } catch (error: any) {
    console.error('[Delete Recording] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete recording', message: error.message },
      { status: 500 }
    )
  }
}
