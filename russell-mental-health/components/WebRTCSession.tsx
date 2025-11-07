/**
 * WebRTCSession Component
 *
 * Primary video session interface using WebRTC peer-to-peer connection
 * - WebRTC VideoRoom for high-quality, recordable sessions
 * - Google Meet fallback link for connection issues
 * - Appointment details sidebar
 * - Session end handling with confirmation
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLinkIcon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react'
import { getSocket } from '@/lib/socket'
import { getSocketToken } from '@/lib/socket-auth'
import VideoRoom from '@/components/video/VideoRoom'
import type { Socket } from 'socket.io-client'

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

interface WebRTCSessionProps {
  appointment: AppointmentData
  userRole: string
  userId: string
  userName: string
}

export function WebRTCSession({ appointment, userRole, userId, userName }: WebRTCSessionProps) {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>(
    'connecting'
  )
  const [showEndConfirmation, setShowEndConfirmation] = useState(false)

  const startTime = new Date(appointment.startTime)

  // Setup socket connection
  useEffect(() => {
    let socketInstance: Socket | null = null

    const onConnect = () => {
      setConnectionStatus('connected')
      if (socketInstance) {
        setSocket(socketInstance)
      }
    }

    const onDisconnect = () => setConnectionStatus('connecting')
    const onConnectError = () => setConnectionStatus('error')

    getSocketToken()
      .then((authToken) => {
        if (!authToken) {
          setConnectionStatus('error')
          return
        }

        socketInstance = getSocket(authToken)
        socketInstance.on('connect', onConnect)
        socketInstance.on('disconnect', onDisconnect)
        socketInstance.on('connect_error', onConnectError)

        // If already connected, trigger the connect handler
        if (socketInstance.connected) {
          onConnect()
        }
      })
      .catch(() => {
        setConnectionStatus('error')
      })

    return () => {
      if (socketInstance) {
        socketInstance.off('connect', onConnect)
        socketInstance.off('disconnect', onDisconnect)
        socketInstance.off('connect_error', onConnectError)
      }
    }
  }, [])

  const handleEndSession = () => {
    setShowEndConfirmation(true)
  }

  const confirmEndSession = () => {
    router.push('/dashboard')
  }

  const cancelEndSession = () => {
    setShowEndConfirmation(false)
  }

  // Connection error state
  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Main content area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h1>
              <p className="text-gray-600 mb-6">
                Unable to connect to video server. Please use Google Meet instead.
              </p>
              <a
                href={appointment.googleMeetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium mb-4"
              >
                Open Google Meet
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
              <div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <AppointmentSidebar
            appointment={appointment}
            userRole={userRole}
            startTime={startTime}
          />
        </div>
      </div>
    )
  }

  // Connecting state
  if (connectionStatus === 'connecting' || !socket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
        <div className="min-h-screen flex flex-col lg:flex-row">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Connecting to video session...</p>
            </div>
          </div>
          <AppointmentSidebar
            appointment={appointment}
            userRole={userRole}
            startTime={startTime}
          />
        </div>
      </div>
    )
  }

  // Main video session
  return (
    <div className="relative h-screen flex flex-col lg:flex-row">
      {/* Video Room - Full screen */}
      <div className="flex-1 relative">
        <VideoRoom
          socket={socket}
          roomId={appointment.id} // Use appointment ID as room ID
          currentUser={{
            userId: userId,
            name: userName,
            role: userRole as 'THERAPIST' | 'PATIENT',
          }}
          onEndSession={handleEndSession}
        />

        {/* Google Meet Fallback - Overlay at bottom */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2 text-center">
              Having connection issues?
            </p>
            <a
              href={appointment.googleMeetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLinkIcon className="h-3 w-3" />
              Switch to Google Meet
            </a>
          </div>
        </div>
      </div>

      {/* Sidebar - Appointment details (hidden on small screens during session) */}
      <div className="hidden lg:block">
        <AppointmentSidebar
          appointment={appointment}
          userRole={userRole}
          startTime={startTime}
        />
      </div>

      {/* End Session Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">End Session?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to end this therapy session? Your camera and microphone will be turned off.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelEndSession}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Appointment Details Sidebar Component
function AppointmentSidebar({
  appointment,
  userRole,
  startTime,
}: {
  appointment: AppointmentData
  userRole: string
  startTime: Date
}) {
  return (
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

      {/* Info */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-blue-900 font-medium mb-1">
            🎥 Session Recording Active
          </p>
          <p className="text-xs text-blue-700">
            This session is being recorded for your records and AI-assisted notes.
          </p>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Ensure your camera and microphone are working properly.
        </p>
      </div>
    </div>
  )
}
