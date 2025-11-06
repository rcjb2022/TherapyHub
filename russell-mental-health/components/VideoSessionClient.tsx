/**
 * VideoSessionClient Component
 *
 * Client-side component that manages the video session experience
 * - Checks timing with canJoinSession()
 * - Shows waiting room if too early
 * - Shows Google Meet session if in join window
 * - Shows "Session ended" message if past end time
 * - Updates automatically every minute
 */

'use client'

import { useState, useEffect } from 'react'
import { canJoinSession } from '@/lib/video-utils'
import { VideoWaitingRoom } from '@/components/VideoWaitingRoom'
import { GoogleMeetSession } from '@/components/GoogleMeetSession'

interface AppointmentData {
  id: string
  startTime: string
  endTime: string
  duration: number
  appointmentType: string
  sessionType: string
  googleMeetLink: string
  status: string
  patient: {
    firstName: string
    lastName: string
  }
  therapist: {
    name: string
  }
}

interface VideoSessionClientProps {
  appointment: AppointmentData
  userRole: string
}

export function VideoSessionClient({ appointment, userRole }: VideoSessionClientProps) {
  const start = new Date(appointment.startTime)
  const end = new Date(appointment.endTime)

  // Check join status (updates every minute)
  const [joinStatus, setJoinStatus] = useState(() => canJoinSession(start, end))

  useEffect(() => {
    const interval = setInterval(() => {
      setJoinStatus(canJoinSession(start, end))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [start, end])

  // Session has ended
  if (joinStatus.reason === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Ended</h1>
          <p className="text-gray-600 mb-2">
            This session has concluded.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {start.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <a
            href="/dashboard"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Too early - show waiting room
  if (joinStatus.reason === 'too_early') {
    return (
      <VideoWaitingRoom
        appointment={appointment}
        userRole={userRole}
        minutesUntilStart={joinStatus.minutesUntil || 0}
      />
    )
  }

  // Can join - show Google Meet session
  return <GoogleMeetSession appointment={appointment} userRole={userRole} />
}
