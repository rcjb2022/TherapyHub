/**
 * Cleanup Cron Endpoint
 * Auto-deletes recordings older than 30 days from GCS
 * Keeps SessionDocuments (7-year retention per FL law)
 *
 * Security: Protected by cron secret key
 * Schedule: Run daily via Vercel Cron or external scheduler
 */

import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    // Security: Verify cron secret (prevents unauthorized cleanup)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'development-secret'

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cleanup Cron] Unauthorized attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cleanup Cron] Starting recording cleanup...')

    // Get GCS bucket
    const bucketName = process.env.GCS_BUCKET_NAME
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      )
    }
    const bucket = storage.bucket(bucketName)

    // Find all recordings that have expired (expiresAt < now)
    const expiredRecordings = await prisma.recording.findMany({
      where: {
        expiresAt: {
          lt: new Date(), // Less than current date
        },
        status: {
          not: 'EXPIRED', // Don't re-process already expired
        },
      },
      select: {
        id: true,
        gcsPath: true,
        transcriptGcsPath: true,
        captionGcsPath: true,
        patientId: true,
        appointmentId: true,
      },
    })

    console.log(`[Cleanup Cron] Found ${expiredRecordings.length} expired recordings`)

    let deletedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Delete each expired recording from GCS
    for (const recording of expiredRecordings) {
      try {
        console.log(`[Cleanup Cron] Deleting recording: ${recording.id}`)

        // Delete video file from GCS
        if (recording.gcsPath) {
          const videoFile = bucket.file(recording.gcsPath)
          const [exists] = await videoFile.exists()
          if (exists) {
            await videoFile.delete()
            console.log(`[Cleanup Cron] Deleted video: ${recording.gcsPath}`)
          }
        }

        // Delete transcript file (if exists)
        if (recording.transcriptGcsPath) {
          const transcriptFile = bucket.file(recording.transcriptGcsPath)
          const [exists] = await transcriptFile.exists()
          if (exists) {
            await transcriptFile.delete()
            console.log(`[Cleanup Cron] Deleted transcript: ${recording.transcriptGcsPath}`)
          }
        }

        // Delete caption file (if exists)
        if (recording.captionGcsPath) {
          const captionFile = bucket.file(recording.captionGcsPath)
          const [exists] = await captionFile.exists()
          if (exists) {
            await captionFile.delete()
            console.log(`[Cleanup Cron] Deleted caption: ${recording.captionGcsPath}`)
          }
        }

        // Mark recording as EXPIRED in database
        // DON'T delete the database record - we need it for audit trail
        await prisma.recording.update({
          where: { id: recording.id },
          data: { status: 'EXPIRED' },
        })

        deletedCount++
        console.log(`[Cleanup Cron] Recording ${recording.id} marked as EXPIRED`)
      } catch (err) {
        errorCount++
        const errorMsg = `Failed to cleanup recording ${recording.id}: ${err instanceof Error ? err.message : 'Unknown error'}`
        console.error(`[Cleanup Cron] ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    // Note: SessionDocuments are NOT deleted - they have 7-year retention
    // They will automatically have recordingId set to null (onDelete: SetNull)

    const result = {
      success: true,
      message: `Cleanup completed: ${deletedCount} recordings deleted, ${errorCount} errors`,
      deletedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    }

    console.log('[Cleanup Cron] Cleanup completed:', result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Cleanup Cron] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
