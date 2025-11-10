'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  VideoCameraIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

interface Recording {
  id: string
  appointmentId: string
  patientId: string
  patientName: string
  startedAt: string
  endedAt: string | null
  duration: number | null
  fileSize: number | null
  status: string
  expiresAt: string
  transcriptionStatus: string
  language: string | null
  videoUrl: string | null
  captionUrl: string | null
  transcriptDocumentId: string | null
  soapNotesId: string | null
  dapNotesId: string | null
  birpNotesId: string | null
  error?: string
}

// Language code to label mapping
const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
}

// Transcription status to text mapping
const TRANSCRIPTION_STATUS_TEXT: Record<string, string> = {
  PENDING: 'Not Transcribed',
  PROCESSING: 'Processing...',
  COMPLETED: 'Available',
  FAILED: 'Failed',
}

// Generate Transcript Button Component
interface GenerateTranscriptButtonProps {
  recording: Recording
  isProcessing: boolean
  onGenerate: () => void
}

// Clinical Notes Button Component
interface ClinicalNotesButtonProps {
  recording: Recording
  format: 'SOAP' | 'DAP' | 'BIRP'
  documentId: string | null
  isGenerating: boolean
  onGenerate: () => void
}

// SVG icon paths for better maintainability
const RETRY_ICON_PATH = "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
const GENERATE_ICON_PATH = "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"

// Clinical notes format mapping (type-safe)
const CLINICAL_NOTE_FORMATS = [
  { format: 'SOAP' as const, key: 'soapNotesId' as const },
  { format: 'DAP' as const, key: 'dapNotesId' as const },
  { format: 'BIRP' as const, key: 'birpNotesId' as const },
]

function GenerateTranscriptButton({ recording, isProcessing, onGenerate }: GenerateTranscriptButtonProps) {
  if (recording.transcriptionStatus !== 'PENDING' && recording.transcriptionStatus !== 'FAILED') {
    return null
  }

  const isFailed = recording.transcriptionStatus === 'FAILED'
  const buttonColorClasses = isFailed
    ? 'bg-orange-600 hover:bg-orange-700'
    : 'bg-purple-600 hover:bg-purple-700'
  const iconPath = isFailed ? RETRY_ICON_PATH : GENERATE_ICON_PATH
  const buttonText = isFailed ? 'Retry Transcript Generation' : 'Generate Transcript'

  return (
    <button
      onClick={onGenerate}
      disabled={isProcessing}
      className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${buttonColorClasses}`}
    >
      {isProcessing ? (
        <>
          <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
          {buttonText}
        </>
      )}
    </button>
  )
}

function ClinicalNotesButton({ recording, format, documentId, isGenerating, onGenerate }: ClinicalNotesButtonProps) {
  // Can't generate notes without a transcript
  if (recording.transcriptionStatus !== 'COMPLETED') {
    return null
  }

  const colorMap = {
    SOAP: 'bg-emerald-600 hover:bg-emerald-700',
    DAP: 'bg-teal-600 hover:bg-teal-700',
    BIRP: 'bg-cyan-600 hover:bg-cyan-700',
  }

  if (documentId) {
    // Notes exist - show view button
    return (
      <Link
        href={`/dashboard/session-documents/${documentId}`}
        className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium text-white ${colorMap[format]}`}
      >
        <DocumentTextIcon className="h-3.5 w-3.5" />
        View {format}
      </Link>
    )
  }

  // Notes don't exist - show generate button
  return (
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${colorMap[format]}`}
      title={`Generate ${format} clinical notes`}
    >
      {isGenerating ? (
        <>
          <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={GENERATE_ICON_PATH} />
          </svg>
          {format}
        </>
      )}
    </button>
  )
}

export default function SessionVaultClient() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [transcribingIds, setTranscribingIds] = useState<Set<string>>(new Set())
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [generatingNotesIds, setGeneratingNotesIds] = useState<Set<string>>(new Set())
  const [notesError, setNotesError] = useState<string | null>(null)

  // Fetch recordings on mount
  useEffect(() => {
    fetchRecordings()
  }, [])

  // Filter recordings based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecordings(recordings)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredRecordings(
        recordings.filter((recording) => recording.patientName.toLowerCase().includes(query))
      )
    }
  }, [searchQuery, recordings])

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recordings')

      if (!response.ok) {
        throw new Error('Failed to fetch recordings')
      }

      const data = await response.json()
      setRecordings(data.recordings)
      setFilteredRecordings(data.recordings)
    } catch (err) {
      console.error('Failed to fetch recordings:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getDaysUntilExpiration = (expiresAt: string): number => {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diffMs = expiration.getTime() - now.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  const openVideoPlayer = (recording: Recording) => {
    setSelectedRecording(recording)
  }

  const closeVideoPlayer = () => {
    setSelectedRecording(null)
  }

  const generateTranscript = async (recordingId: string) => {
    try {
      setTranscribeError(null)
      setTranscribingIds((prev) => new Set(prev).add(recordingId))

      const response = await fetch(`/api/recordings/${recordingId}/transcribe`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const result = await response.json()
      console.log('Transcription result:', result)

      // Refresh recordings to show updated status
      await fetchRecordings()
    } catch (err) {
      console.error('Failed to generate transcript:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setTranscribeError(`Failed to generate transcript: ${errorMessage}`)
    } finally {
      setTranscribingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(recordingId)
        return newSet
      })
    }
  }

  const generateClinicalNotes = async (recordingId: string, format: 'SOAP' | 'DAP' | 'BIRP') => {
    try {
      setNotesError(null)
      const notesKey = `${recordingId}-${format}`
      setGeneratingNotesIds((prev) => new Set(prev).add(notesKey))

      const response = await fetch(`/api/recordings/${recordingId}/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to generate ${format} notes`)
      }

      const result = await response.json()
      console.log(`${format} notes generated:`, result)

      // Refresh recordings to show updated clinical notes
      await fetchRecordings()
    } catch (err) {
      console.error(`Failed to generate ${format} notes:`, err)
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setNotesError(`Failed to generate ${format} notes: ${errorMessage}`)
    } finally {
      setGeneratingNotesIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(`${recordingId}-${format}`)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading recordings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Recordings</h3>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchRecordings}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session Vault</h1>
            <p className="mt-2 text-gray-600">
              View and manage recorded therapy sessions (30-day retention)
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
            <VideoCameraIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {recordings.length} Recording{recordings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Transcription Error Banner */}
        {transcribeError && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{transcribeError}</p>
            </div>
            <button
              onClick={() => setTranscribeError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Clinical Notes Error Banner */}
        {notesError && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{notesError}</p>
            </div>
            <button
              onClick={() => setNotesError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recordings Table */}
        {filteredRecordings.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchQuery ? 'No matching recordings' : 'No recordings yet'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Session recordings will appear here after you record video appointments'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Transcript
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRecordings.map((recording) => {
                  const daysLeft = getDaysUntilExpiration(recording.expiresAt)
                  const isExpiringSoon = daysLeft <= 7

                  return (
                    <tr key={recording.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDate(recording.startedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {recording.patientName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDuration(recording.duration)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(recording.fileSize)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            recording.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : recording.status === 'PROCESSING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {recording.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            recording.transcriptionStatus === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : recording.transcriptionStatus === 'PROCESSING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : recording.transcriptionStatus === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {recording.transcriptionStatus === 'COMPLETED' && recording.language && (
                            <span className="uppercase">{recording.language}</span>
                          )}
                          {TRANSCRIPTION_STATUS_TEXT[recording.transcriptionStatus]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <ClockIcon
                            className={`h-4 w-4 ${isExpiringSoon ? 'text-orange-500' : 'text-gray-400'}`}
                          />
                          <span className={isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}>
                            {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex flex-col items-end gap-2">
                          {/* Main action buttons row */}
                          <div className="flex items-center gap-2">
                            {recording.videoUrl ? (
                              <>
                                <button
                                  onClick={() => openVideoPlayer(recording)}
                                  className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                  <PlayIcon className="h-4 w-4" />
                                  Play
                                </button>
                                {recording.transcriptionStatus === 'COMPLETED' && recording.transcriptDocumentId ? (
                                  <Link
                                    href={`/dashboard/session-documents/${recording.transcriptDocumentId}`}
                                    className="inline-flex items-center gap-1 rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                                  >
                                    <DocumentTextIcon className="h-4 w-4" />
                                    View Transcript
                                  </Link>
                                ) : (
                                  <GenerateTranscriptButton
                                    recording={recording}
                                    isProcessing={transcribingIds.has(recording.id)}
                                    onGenerate={() => generateTranscript(recording.id)}
                                  />
                                )}
                                <a
                                  href={recording.videoUrl}
                                  download
                                  className="inline-flex items-center gap-1 rounded bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                                >
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                  Download
                                </a>
                              </>
                            ) : (
                              <span className="text-xs text-red-600">
                                {recording.error || 'Unavailable'}
                              </span>
                            )}
                          </div>

                          {/* Clinical Notes row */}
                          {recording.transcriptionStatus === 'COMPLETED' && (
                            <div className="flex items-center gap-1.5">
                              {CLINICAL_NOTE_FORMATS.map(({ format, key }) => (
                                <ClinicalNotesButton
                                  key={format}
                                  recording={recording}
                                  format={format}
                                  documentId={recording[key]}
                                  isGenerating={generatingNotesIds.has(`${recording.id}-${format}`)}
                                  onGenerate={() => generateClinicalNotes(recording.id, format)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-6xl rounded-lg bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Session Recording: {selectedRecording.patientName}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedRecording.startedAt)} • Duration:{' '}
                  {formatDuration(selectedRecording.duration)}
                </p>
              </div>
              <button
                onClick={closeVideoPlayer}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close video player"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="bg-black">
              {selectedRecording.videoUrl ? (
                <video
                  src={selectedRecording.videoUrl}
                  controls
                  autoPlay
                  className="w-full"
                  style={{ maxHeight: '70vh' }}
                >
                  {selectedRecording.captionUrl && (
                    <track
                      kind="captions"
                      src={selectedRecording.captionUrl}
                      srcLang={selectedRecording.language || 'en'}
                      label={LANGUAGE_LABELS[selectedRecording.language || 'en'] || 'English'}
                      default
                    />
                  )}
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex h-96 items-center justify-center">
                  <p className="text-white">Video unavailable</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <ClockIcon className="inline-block h-4 w-4" /> Expires in{' '}
                  {getDaysUntilExpiration(selectedRecording.expiresAt)} days
                </div>
                <div className="flex gap-2">
                  {selectedRecording.videoUrl && (
                    <a
                      href={selectedRecording.videoUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={closeVideoPlayer}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
