'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { CopyButton } from './CopyButton'

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

interface ClinicalNotesData {
  format: 'SOAP' | 'DAP' | 'BIRP'
  // SOAP fields
  subjective?: string
  objective?: string
  // DAP fields
  data?: string
  // BIRP fields
  behavior?: string
  intervention?: string
  response?: string
  // Common fields
  assessment: string
  plan: string
  chiefComplaints: string[]
  keyTopics: string[]
  interventionsUsed: string[]
  actionItems: string[]
  riskAssessment?: string
  progressNotes: string
  sessionDate?: string
  generatedBy?: string
}

interface DocumentMetadata {
  id: string
  title: string
  documentType: string
  language?: string
  createdAt: string
  aiGenerated?: boolean
  aiProvider?: string
  patientName: string
  patientId: string
}

interface APIResponse {
  success: boolean
  content?: any
  contentType?: string
  document?: DocumentMetadata
  error?: string
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

const SPEAKER_STYLES = {
  THERAPIST: { label: 'Therapist', color: 'text-blue-700 bg-blue-100' },
  PATIENT: { label: 'Patient', color: 'text-green-700 bg-green-100' },
  UNKNOWN: { label: 'Unknown Speaker', color: 'text-gray-600 bg-gray-100' },
  UNCLEAR: { label: 'Speaker Unclear', color: 'text-gray-600 bg-gray-100' },
} as const

function getSpeakerInfo(speaker?: string): { label: string; color: string } {
  if (!speaker) {
    return SPEAKER_STYLES.UNKNOWN
  }

  const normalized = speaker.toLowerCase()
  if (normalized.includes('therapist')) {
    return SPEAKER_STYLES.THERAPIST
  }
  if (normalized.includes('patient')) {
    return SPEAKER_STYLES.PATIENT
  }

  return SPEAKER_STYLES.UNCLEAR
}

// Clinical Notes Viewer Component
function ClinicalNotesViewer({ notes }: { notes: ClinicalNotesData }) {
  const formatColors = {
    SOAP: 'from-emerald-600 to-teal-600',
    DAP: 'from-teal-600 to-cyan-600',
    BIRP: 'from-cyan-600 to-blue-600',
  }

  // Get the main sections based on format
  const getMainSections = () => {
    switch (notes.format) {
      case 'SOAP':
        return [
          { title: 'Subjective', content: notes.subjective, icon: '💬' },
          { title: 'Objective', content: notes.objective, icon: '👁️' },
          { title: 'Assessment', content: notes.assessment, icon: '📊' },
          { title: 'Plan', content: notes.plan, icon: '📋' },
        ]
      case 'DAP':
        return [
          { title: 'Data', content: notes.data, icon: '📝' },
          { title: 'Assessment', content: notes.assessment, icon: '📊' },
          { title: 'Plan', content: notes.plan, icon: '📋' },
        ]
      case 'BIRP':
        return [
          { title: 'Behavior', content: notes.behavior, icon: '🎭' },
          { title: 'Intervention', content: notes.intervention, icon: '🔧' },
          { title: 'Response', content: notes.response, icon: '↩️' },
          { title: 'Plan', content: notes.plan, icon: '📋' },
        ]
    }
  }

  // Format notes for copying
  const formatNotesForCopy = () => {
    const sections = getMainSections()
    let text = `${notes.format} Clinical Notes\n${'='.repeat(50)}\n\n`

    sections.forEach(section => {
      text += `${section.title.toUpperCase()}\n${'-'.repeat(30)}\n${section.content || 'No content available'}\n\n`
    })

    if (notes.chiefComplaints?.length) {
      text += `CHIEF COMPLAINTS\n${'-'.repeat(30)}\n${notes.chiefComplaints.map(c => `• ${c}`).join('\n')}\n\n`
    }

    if (notes.keyTopics?.length) {
      text += `KEY TOPICS\n${'-'.repeat(30)}\n${notes.keyTopics.join(', ')}\n\n`
    }

    if (notes.interventionsUsed?.length) {
      text += `INTERVENTIONS USED\n${'-'.repeat(30)}\n${notes.interventionsUsed.map(i => `• ${i}`).join('\n')}\n\n`
    }

    if (notes.actionItems?.length) {
      text += `ACTION ITEMS\n${'-'.repeat(30)}\n${notes.actionItems.map(a => `• ${a}`).join('\n')}\n\n`
    }

    if (notes.riskAssessment) {
      text += `RISK ASSESSMENT\n${'-'.repeat(30)}\n${notes.riskAssessment}\n\n`
    }

    if (notes.progressNotes) {
      text += `PROGRESS NOTES\n${'-'.repeat(30)}\n${notes.progressNotes}\n`
    }

    return text
  }

  return (
    <div className="space-y-6">
      {/* Copy Button Header */}
      <div className="flex justify-end">
        <CopyButton content={formatNotesForCopy()} label="Copy Clinical Notes" />
      </div>
      {/* Main Sections */}
      {getMainSections().map((section) => (
        <div key={section.title} className="rounded-lg bg-white shadow">
          <div className={`border-b border-gray-200 bg-gradient-to-r ${formatColors[notes.format]} px-6 py-4`}>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <span>{section.icon}</span>
              {section.title}
            </h3>
          </div>
          <div className="px-6 py-4">
            <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{section.content}</p>
          </div>
        </div>
      ))}

      {/* Additional Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chief Complaints */}
        {notes.chiefComplaints && notes.chiefComplaints.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h4 className="mb-3 font-semibold text-gray-900">Chief Complaints</h4>
            <ul className="space-y-2">
              {notes.chiefComplaints.map((complaint, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1 flex-shrink-0 text-red-500">•</span>
                  <span>{complaint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Topics */}
        {notes.keyTopics && notes.keyTopics.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h4 className="mb-3 font-semibold text-gray-900">Key Topics</h4>
            <div className="flex flex-wrap gap-2">
              {notes.keyTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interventions Used */}
        {notes.interventionsUsed && notes.interventionsUsed.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h4 className="mb-3 font-semibold text-gray-900">Interventions Used</h4>
            <ul className="space-y-2">
              {notes.interventionsUsed.map((intervention, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1 flex-shrink-0 text-purple-500">✓</span>
                  <span>{intervention}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items */}
        {notes.actionItems && notes.actionItems.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h4 className="mb-3 font-semibold text-gray-900">Action Items</h4>
            <ul className="space-y-2">
              {notes.actionItems.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1 flex-shrink-0 text-green-500">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Risk Assessment (if present) */}
      {notes.riskAssessment && (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6 shadow">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-orange-900">
            <span>⚠️</span>
            Risk Assessment
          </h4>
          <p className="whitespace-pre-wrap leading-relaxed text-orange-800">{notes.riskAssessment}</p>
        </div>
      )}

      {/* Progress Notes */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h4 className="mb-3 font-semibold text-gray-900">Progress Notes</h4>
        <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{notes.progressNotes}</p>
      </div>
    </div>
  )
}

export default function SessionDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  // Unwrap params Promise for Next.js 15
  const { documentId } = use(params)

  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documentData, setDocumentData] = useState<APIResponse | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchDocumentContent()
    }
  }, [status, session, documentId])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/session-documents/${documentId}/content`)
      const data: APIResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load document')
      }

      setDocumentData(data)
    } catch (err: any) {
      console.error('[Session Document Page] Error:', err)
      setError(err.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error || !documentData || !documentData.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Document</h3>
          <p className="text-sm text-red-600">
            {error || documentData?.error || 'The document could not be loaded.'}
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

  const { content, contentType, document: doc } = documentData

  const isTranscript = contentType === 'transcript'
  const isClinicalNotes = contentType === 'clinical_notes'
  const isPlainText = contentType === 'plain_text'

  const transcriptData = isTranscript ? (content as TranscriptData) : null
  const clinicalNotesData = isClinicalNotes ? (content as ClinicalNotesData) : null
  const plainTextContent = isPlainText ? (content as string) : null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/patients/${doc?.patientId}/documents`}
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
                <h1 className="text-2xl font-bold text-white">{doc?.title}</h1>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/90">
                  <span>Patient: {doc?.patientName}</span>
                  <span>•</span>
                  <span>{doc?.createdAt && new Date(doc.createdAt).toLocaleDateString()}</span>
                  {doc?.language && (
                    <>
                      <span>•</span>
                      <span>Language: {doc.language.toUpperCase()}</span>
                    </>
                  )}
                  {transcriptData?.duration && (
                    <>
                      <span>•</span>
                      <span>Duration: {formatDuration(transcriptData.duration)}</span>
                    </>
                  )}
                </div>
                {doc?.aiGenerated && doc?.aiProvider && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                      🤖 AI Generated ({doc.aiProvider})
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
                Document Type: <span className="text-gray-900">{doc?.documentType}</span>
              </span>
              {transcriptData?.segments && (
                <span className="text-sm text-gray-600">
                  {transcriptData.segments.length} segment{transcriptData.segments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Transcript Content */}
        {isTranscript && transcriptData && transcriptData.segments && transcriptData.segments.length > 0 && (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    AI-generated transcript of the therapy session
                  </p>
                </div>
                <CopyButton
                  content={transcriptData.segments.map(s => `[${s.speaker || 'UNKNOWN'}] ${s.text}`).join('\n\n')}
                  label="Copy Transcript"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 px-6 py-4">
              {transcriptData.segments.map((segment, index) => {
                const speakerInfo = getSpeakerInfo(segment.speaker)
                return (
                  <div key={`${segment.start}-${index}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
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

        {/* Clinical Notes Content */}
        {isClinicalNotes && clinicalNotesData && (
          <ClinicalNotesViewer notes={clinicalNotesData} />
        )}

        {/* Plain Text Content (Summary/Translation) */}
        {isPlainText && plainTextContent && (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {doc?.documentType === 'SUMMARY' ? 'Session Summary' : 'Translation'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {doc?.documentType === 'SUMMARY'
                      ? 'AI-generated summary of the therapy session'
                      : `Translated to ${doc?.language?.toUpperCase() || 'target language'}`}
                  </p>
                </div>
                <CopyButton content={plainTextContent} />
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="prose prose-gray max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {plainTextContent}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {isTranscript && transcriptData && (!transcriptData.segments || transcriptData.segments.length === 0) && (
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
            href="/dashboard/video"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            View Session Vault
          </Link>
          <Link
            href={`/dashboard/patients/${doc?.patientId}/documents`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View All Documents
          </Link>
        </div>
      </div>
    </div>
  )
}
