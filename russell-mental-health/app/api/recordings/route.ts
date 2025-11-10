/**
 * Recordings API
 * Fetches all session recordings for therapist (with signed URLs)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

export async function GET(request: NextRequest) {
  try {
    // Validate GCS configuration
    const bucketName = process.env.GCS_BUCKET_NAME
    if (!bucketName) {
      console.error('[Recordings API] GCS_BUCKET_NAME environment variable not set.')
      return NextResponse.json(
        { error: 'Server configuration error: Storage bucket not configured.' },
        { status: 500 }
      )
    }

    // Authenticate and authorize
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can access recordings
    if (session.user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('[Recordings API] Fetching recordings for user:', session.user.id)

    // Get the therapist record for this user
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!therapist) {
      console.error('[Recordings API] Therapist record not found for user:', session.user.id)
      return NextResponse.json({ error: 'Therapist record not found' }, { status: 404 })
    }

    console.log('[Recordings API] Fetching recordings for therapist:', therapist.id)

    // Fetch recordings with related data
    const recordings = await prisma.recording.findMany({
      where: {
        // Only show recordings for this therapist's patients
        appointment: {
          therapistId: therapist.id,
        },
      },
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
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    })

    console.log(`[Recordings API] Found ${recordings.length} recordings`)

    // Generate signed URLs for each recording
    const bucket = storage.bucket(bucketName)
    const recordingsWithUrls = await Promise.all(
      recordings.map(async (recording) => {
        // Explicit allow-list for API response (more secure than deny-list)
        // This prevents accidental exposure of sensitive fields if model changes
        const {
          id,
          appointmentId,
          patientId,
          startedAt,
          endedAt,
          duration,
          fileSize,
          status,
          expiresAt,
          appointment,
          gcsPath,
        } = recording
        const baseRecordingData = {
          id,
          appointmentId,
          patientId,
          startedAt,
          endedAt,
          duration,
          fileSize,
          status,
          expiresAt,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        }

        try {
          const blob = bucket.file(gcsPath)

          // Generate signed URL with 1-hour expiration
          const [signedUrl] = await blob.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          })

          return {
            ...baseRecordingData,
            videoUrl: signedUrl,
          }
        } catch (error) {
          console.error(`[Recordings API] Failed to generate URL for ${recording.id}:`, error)
          return {
            ...baseRecordingData,
            videoUrl: null,
            error: 'Failed to generate video URL',
          }
        }
      })
    )

    return NextResponse.json({ recordings: recordingsWithUrls })
  } catch (error: any) {
    console.error('[Recordings API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recordings', details: error.message },
      { status: 500 }
    )
  }
}
