/**
 * Session Document API
 * Serves session documents (transcripts, clinical notes) from GCS
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await context.params

  try {
    // Validate GCS configuration
    const bucketName = process.env.GCS_BUCKET_NAME
    if (!bucketName) {
      console.error('[Session Document API] GCS_BUCKET_NAME not configured')
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

    // Only therapists can access session documents
    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the document
    const document = await prisma.sessionDocument.findUnique({
      where: { id: documentId },
      include: {
        appointment: {
          select: { therapistId: true },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Verify therapist owns this document
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!therapist || document.appointment.therapistId !== therapist.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the document from GCS
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(document.gcsPath)

    // Check if file exists
    const [exists] = await file.exists()
    if (!exists) {
      console.error(`[Session Document API] File not found: ${document.gcsPath}`)
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
    }

    // Get file metadata
    const [metadata] = await file.getMetadata()

    // Download file content
    const [fileContent] = await file.download()

    // Return the file with appropriate content type
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': metadata.contentType || 'application/json',
        'Content-Disposition': `inline; filename="${document.title}.json"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('[Session Document API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve document', details: error.message },
      { status: 500 }
    )
  }
}
