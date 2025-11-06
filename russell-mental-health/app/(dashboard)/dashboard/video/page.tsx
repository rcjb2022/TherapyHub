/**
 * Video Sessions Management Page (THERAPIST ONLY)
 *
 * Future Session Vault - Coming Soon!
 *
 * This page will serve as the central hub for therapists to:
 * - View all recorded video sessions (30-day retention)
 * - Re-watch past sessions
 * - AI-powered features with Gemini API:
 *   - Transcribe sessions
 *   - Generate SOAP notes
 *   - Create treatment plans
 *   - Analyze session themes
 *   - Translate to multiple languages
 * - Write clinical notes alongside video playback
 * - Session scribble pad for notes taken during sessions
 * - Search sessions by patient, date, keywords, topics
 *
 * Patient users should NOT have access to this page
 * (they access video sessions via dashboard Join buttons and calendar)
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { VideoCameraIcon, SparklesIcon, DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default async function VideoSessionsManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only therapists and admins can access session management
  if (session.user.role === 'PATIENT') {
    redirect('/dashboard/patient')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Session Management</h1>
          <p className="mt-2 text-gray-600">
            Central hub for recorded sessions, AI analysis, and clinical notes
          </p>
        </div>

        {/* Coming Soon Banner */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-8 mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <VideoCameraIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Vault - Coming Soon!</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            This feature is currently under development. Check back soon for powerful session management tools.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Session Recordings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <VideoCameraIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Session Recordings</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• View all recorded sessions</li>
              <li>• 30-day retention period</li>
              <li>• Re-watch past appointments</li>
              <li>• Search by patient or date</li>
              <li>• Secure, HIPAA-compliant storage</li>
            </ul>
          </div>

          {/* AI-Powered Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI-Powered Tools</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Auto-transcribe sessions (Gemini API)</li>
              <li>• Generate SOAP notes</li>
              <li>• Create treatment plans</li>
              <li>• Analyze session themes</li>
              <li>• Multi-language translation</li>
            </ul>
          </div>

          {/* Clinical Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Clinical Documentation</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Write notes alongside video</li>
              <li>• Session scribble pad</li>
              <li>• Auto-save drafts</li>
              <li>• Link notes to patient records</li>
              <li>• Export to PDF or print</li>
            </ul>
          </div>

          {/* Smart Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Smart Search</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Search by patient name</li>
              <li>• Filter by date range</li>
              <li>• Find keywords in transcripts</li>
              <li>• Topic-based discovery</li>
              <li>• Quick access to recent sessions</li>
            </ul>
          </div>
        </div>

        {/* Timeline Note */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            <strong>Development Timeline:</strong> This feature is planned for Day 8-9 implementation.
            <br />
            It will integrate with WebRTC video recording and Gemini AI for powerful session management.
          </p>
        </div>

        {/* Temporary Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
