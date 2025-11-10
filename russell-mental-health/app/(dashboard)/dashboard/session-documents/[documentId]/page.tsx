import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.startsWith('{')
      ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) }
      : { keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY }
    : {}),
})

interface TranscriptSegment {
  speaker?: string
  text: string
  start: number
  end: number
}

interface TranscriptData {
  segments: TranscriptSegment[]
  language: string
  duration: number
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins} min ${secs} sec`
}

function getSpeakerInfo(speaker?: string): { label: string; color: string } {
  if (!speaker) {
    return { label: 'Unknown Speaker', color: 'text-gray-600 bg-gray-100' }
  }

  const normalized = speaker.toLowerCase()
  if (normalized.includes('therapist')) {
    return { label: 'Therapist', color: 'text-blue-700 bg-blue-100' }
  }
  if (normalized.includes('patient')) {
    return { label: 'Patient', color: 'text-green-700 bg-green-100' }
  }

  return { label: 'Speaker Unclear', color: 'text-gray-600 bg-gray-100' }
}

export default async function SessionDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Only therapists can access
  if (session.user.role !== 'THERAPIST') {
    redirect('/dashboard')
  }

  // Fetch document and verify ownership in a single query
  // This ensures we only fetch documents the current user is authorized to view
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-800">Document Not Found</h3>
          <p className="text-sm text-red-600">
            The requested document could not be found or you do not have permission to view it.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Fetch transcript content from GCS
  let transcriptData: TranscriptData | null = null
  let error: string | null = null

  try {
    const bucketName = process.env.GCS_BUCKET_NAME
    if (!bucketName) {
      throw new Error('Storage not configured')
    }

    if (!document.gcsPath) {
      throw new Error('Document record is missing the file path to storage.')
    }

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(document.gcsPath)

    const [exists] = await file.exists()
    if (!exists) {
      throw new Error('Transcript file not found in storage')
    }

    const [fileContent] = await file.download()
    transcriptData = JSON.parse(fileContent.toString('utf-8'))
  } catch (err) {
    console.error('[Session Document Page] Error fetching transcript:', err)
    error = err instanceof Error ? err.message : 'Failed to load transcript'
  }

  const patientName = document.appointment.patient.user.name || 'Unknown Patient'
  const patientId = document.appointment.patient.id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/patients/${patientId}/documents`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Patient Documents
          </Link>
        </div>

        {/* Document Info Card */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{document.title}</h1>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/90">
                  <span>Patient: {patientName}</span>
                  <span>•</span>
                  <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                  {document.language && (
                    <>
                      <span>•</span>
                      <span>Language: {document.language.toUpperCase()}</span>
                    </>
                  )}
                  {transcriptData?.duration && (
                    <>
                      <span>•</span>
                      <span>Duration: {formatDuration(transcriptData.duration)}</span>
                    </>
                  )}
                </div>
                {document.aiGenerated && document.aiProvider && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                      🤖 AI Generated ({document.aiProvider})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Type Badge */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Document Type: <span className="text-gray-900">{document.documentType}</span>
              </span>
              {transcriptData?.segments && (
                <span className="text-sm text-gray-600">
                  {transcriptData.segments.length} segment{transcriptData.segments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-1 font-semibold text-red-800">Error Loading Transcript</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Transcript Content */}
        {transcriptData && transcriptData.segments && transcriptData.segments.length > 0 && (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
              <p className="mt-1 text-sm text-gray-600">
                AI-generated transcript of the therapy session
              </p>
            </div>

            <div className="divide-y divide-gray-100 px-6 py-4">
              {transcriptData.segments.map((segment, index) => {
                const speakerInfo = getSpeakerInfo(segment.speaker)
                return (
                  <div key={index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    {/* Timestamp */}
                    <div className="flex-shrink-0 pt-1">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {formatTimestamp(segment.start)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Speaker Label */}
                      <div className="mb-2">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${speakerInfo.color}`}>
                          {speakerInfo.label}
                        </span>
                      </div>
                      {/* Transcript Text */}
                      <p className="text-gray-800 leading-relaxed">{segment.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {transcriptData && (!transcriptData.segments || transcriptData.segments.length === 0) && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Transcript Content</h3>
            <p className="mt-2 text-sm text-gray-600">
              This document appears to be empty or has no segments.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Link
            href={`/dashboard/patients/${patientId}/sessions`}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            View Session Vault
          </Link>
          <Link
            href={`/dashboard/patients/${patientId}/documents`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View All Documents
          </Link>
        </div>
      </div>
    </div>
  )
}
