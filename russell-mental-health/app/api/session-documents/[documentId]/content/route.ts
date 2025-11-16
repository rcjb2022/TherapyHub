// API route for fetching session document content securely
// This keeps GCS credentials server-side only
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Storage } from '@google-cloud/storage'

// Initialize GCS ONLY on server-side
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
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can access session documents
    if (session.user.role !== 'THERAPIST' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - therapist role required' }, { status: 403 })
    }

    // Fetch document and verify ownership
    const document = await prisma.sessionDocument.findFirst({
      where: {
        id: documentId,
        appointment: {
          therapist: {
            userId: session.user.id,
          },
        },
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 })
    }

    // Audit log - PHI access
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VIEW',
        entityType: 'SESSION_DOCUMENT',
        entityId: document.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        phi: true,
      },
    })

    const isPlainText = ['SUMMARY', 'TRANSLATION'].includes(document.documentType)

    // For plain text documents stored in content field, return directly
    if (isPlainText && document.content && typeof document.content === 'string') {
      return NextResponse.json({
        success: true,
        content: document.content,
        contentType: 'plain_text',
        document: {
          id: document.id,
          title: document.title,
          documentType: document.documentType,
          language: document.language,
          createdAt: document.createdAt,
          aiGenerated: document.aiGenerated,
          aiProvider: document.aiProvider,
          patientName: document.appointment.patient.user.name,
          patientId: document.appointment.patient.id,
        },
      })
    }

    // For documents stored in GCS, fetch and return content
    if (document.gcsPath) {
      const bucketName = process.env.GCS_BUCKET_NAME
      if (!bucketName) {
        return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
      }

      const bucket = storage.bucket(bucketName)
      const file = bucket.file(document.gcsPath)

      const [exists] = await file.exists()
      if (!exists) {
        return NextResponse.json({ error: 'Document file not found in storage' }, { status: 404 })
      }

      const [fileContent] = await file.download()
      const fileString = fileContent.toString('utf-8')

      // Parse JSON for transcripts and clinical notes
      const isTranscript = document.documentType === 'TRANSCRIPT'
      const isClinicalNotes = ['SOAP_NOTES', 'DAP_NOTES', 'BIRP_NOTES'].includes(document.documentType)

      let content
      let contentType

      if (isPlainText) {
        content = fileString
        contentType = 'plain_text'
      } else if (isTranscript || isClinicalNotes) {
        content = JSON.parse(fileString)
        contentType = isTranscript ? 'transcript' : 'clinical_notes'
      } else {
        content = fileString
        contentType = 'unknown'
      }

      return NextResponse.json({
        success: true,
        content,
        contentType,
        document: {
          id: document.id,
          title: document.title,
          documentType: document.documentType,
          language: document.language,
          createdAt: document.createdAt,
          aiGenerated: document.aiGenerated,
          aiProvider: document.aiProvider,
          patientName: document.appointment.patient.user.name,
          patientId: document.appointment.patient.id,
        },
      })
    }

    return NextResponse.json({ error: 'Document has no content or file path' }, { status: 404 })
  } catch (error: any) {
    console.error('[Session Document Content API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document content' },
      { status: 500 }
    )
  }
}
