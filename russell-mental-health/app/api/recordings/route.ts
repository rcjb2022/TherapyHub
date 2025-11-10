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

const bucketName = process.env.GCS_BUCKET_NAME || ''

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can access recordings
    if (session.user.role === 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('[Recordings API] Fetching recordings for therapist:', session.user.id)

    // Fetch recordings with related data
    const recordings = await prisma.recording.findMany({
      where: {
        // Only show recordings for this therapist's patients
        appointment: {
          therapistId: session.user.id,
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
        try {
          const blob = bucket.file(recording.gcsPath)

          // Generate signed URL with 1-hour expiration
          const [signedUrl] = await blob.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          })

          return {
            id: recording.id,
            appointmentId: recording.appointmentId,
            patientId: recording.patientId,
            patientName: `${recording.appointment.patient.firstName} ${recording.appointment.patient.lastName}`,
            startedAt: recording.startedAt,
            endedAt: recording.endedAt,
            duration: recording.duration,
            fileSize: recording.fileSize,
            status: recording.status,
            expiresAt: recording.expiresAt,
            videoUrl: signedUrl,
          }
        } catch (error) {
          console.error(`[Recordings API] Failed to generate URL for ${recording.id}:`, error)
          return {
            id: recording.id,
            appointmentId: recording.appointmentId,
            patientId: recording.patientId,
            patientName: `${recording.appointment.patient.firstName} ${recording.appointment.patient.lastName}`,
            startedAt: recording.startedAt,
            endedAt: recording.endedAt,
            duration: recording.duration,
            fileSize: recording.fileSize,
            status: recording.status,
            expiresAt: recording.expiresAt,
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
