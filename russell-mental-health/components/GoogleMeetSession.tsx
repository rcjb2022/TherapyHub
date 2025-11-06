/**
 * GoogleMeetSession Component
 *
 * Display and manage Google Meet video session
 * - Prominent "Join Google Meet" button (opens in new tab)
 * - Appointment details sidebar
 * - Pre-session checklist and instructions
 * - Back to dashboard link
 *
 * Note: iframe embedding removed - Google Meet blocks it for security
 */

'use client'

import { VideoIcon, ExternalLinkIcon, UserIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppointmentData {
  id: string
  startTime: string
  endTime: string
  duration: number
  appointmentType: string
  sessionType: string
  googleMeetLink: string
  patient: {
    firstName: string
    lastName: string
  }
  therapist: {
    name: string
  }
}

interface GoogleMeetSessionProps {
  appointment: AppointmentData
  userRole: string
}

export function GoogleMeetSession({ appointment, userRole }: GoogleMeetSessionProps) {
  const startTime = new Date(appointment.startTime)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Session</h1>
              <p className="text-gray-600">
                Your session is ready. Click below to join the video call.
              </p>
            </div>

            {/* Google Meet Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="text-center">
                {/* Google Meet Icon/Logo */}
                <div className="mb-6">
                  <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    <VideoIcon className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Session Status */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-900 rounded-full px-4 py-2 mb-4">
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Session Active</span>
                  </div>
                </div>

                {/* Join Button - Primary */}
                <div className="mb-8">
                  <a
                    href={appointment.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">
                      <VideoIcon className="h-5 w-5 mr-2" />
                      Join Google Meet
                      <ExternalLinkIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Before you join:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Ensure your camera and microphone are working</li>
                    <li>✓ Find a quiet, private space</li>
                    <li>✓ Check your internet connection</li>
                    <li>✓ Close unnecessary browser tabs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center">
              <a
                href="/dashboard"
                className="inline-block text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar - Appointment details */}
        <div className="lg:w-96 bg-white/90 backdrop-blur-sm border-l border-gray-200 p-8 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Session Details</h2>

          <div className="space-y-6 flex-1">
            {/* Date and Time */}
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Date & Time</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {startTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-700">
                {startTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZone: 'America/New_York',
                })}{' '}
                ET
              </p>
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <ClockIcon className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Duration</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{appointment.duration} minutes</p>
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <UserIcon className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide font-medium">
                  {userRole === 'PATIENT' ? 'Therapist' : 'Patient'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {userRole === 'PATIENT'
                  ? appointment.therapist.name
                  : `${appointment.patient.firstName} ${appointment.patient.lastName}`}
              </p>
            </div>

            {/* Session Type */}
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="text-xs uppercase tracking-wide font-medium">Session Type</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {appointment.appointmentType.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-600">{appointment.sessionType}</p>
            </div>
          </div>

          {/* Technical Support Note */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Need help?</h3>
            <p className="text-xs text-gray-600 mb-2">
              If you experience technical difficulties:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Refresh the page</li>
              <li>• Try a different browser</li>
              <li>• Contact support if issues persist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
