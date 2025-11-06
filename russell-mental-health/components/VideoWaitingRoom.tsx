/**
 * VideoWaitingRoom Component
 *
 * Beautiful waiting room with calming animations while waiting for session to start
 * - Russell Mental Health logo (or text fallback)
 * - "We will be with you shortly" message
 * - Countdown timer to session start
 * - Animated floating gradient orbs (calming, subtle)
 * - Warm/professional color scheme (soft blues, gentle grays)
 * - Appointment details sidebar
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ClockIcon, CalendarIcon, UserIcon } from 'lucide-react'

interface AppointmentData {
  id: string
  startTime: string
  endTime: string
  duration: number
  appointmentType: string
  sessionType: string
  patient: {
    firstName: string
    lastName: string
  }
  therapist: {
    name: string
  }
}

interface VideoWaitingRoomProps {
  appointment: AppointmentData
  userRole: string
  minutesUntilStart: number
}

export function VideoWaitingRoom({
  appointment,
  userRole,
  minutesUntilStart: initialMinutes,
}: VideoWaitingRoomProps) {
  const [minutesRemaining, setMinutesRemaining] = useState(initialMinutes)
  const [logoError, setLogoError] = useState(false)

  const startTime = new Date(appointment.startTime)

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesRemaining((prev) => Math.max(0, prev - 1))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Format countdown display
  const formatCountdown = (minutes: number) => {
    if (minutes < 1) return 'Starting soon...'
    if (minutes === 1) return '1 minute'
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 relative overflow-hidden">
      {/* Animated floating orbs - calming gradient spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Center section - Logo and message */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* Logo */}
            <div className="mb-8">
              {!logoError ? (
                <div className="flex justify-center">
                  <Image
                    src="/logo.png"
                    alt="Russell Mental Health"
                    width={200}
                    height={80}
                    priority
                    onError={() => setLogoError(true)}
                    className="h-auto w-auto max-w-[200px]"
                  />
                </div>
              ) : (
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Russell Mental Health
                </h1>
              )}
            </div>

            {/* Welcome message */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
              <p className="text-2xl font-semibold text-gray-800 mb-4">
                We will be with you shortly
              </p>

              {/* Countdown */}
              <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-900 rounded-full px-6 py-3">
                <ClockIcon className="h-5 w-5" />
                <span className="text-lg font-medium">
                  Session starts in {formatCountdown(minutesRemaining)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-6">
                Your session will begin automatically when the time comes.
              </p>
            </div>

            {/* Connection status */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Connected</span>
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
                ET • {appointment.duration} minutes
              </p>
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

          {/* Technical info */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Please ensure your camera and microphone are ready.
              <br />
              The session will start automatically.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for floating orbs animation */}
      <style jsx>{`
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float linear infinite;
          opacity: 0.6;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%);
          top: -10%;
          left: -10%;
          animation-duration: 25s;
        }

        .orb-2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 70%);
          bottom: -10%;
          right: -10%;
          animation-duration: 30s;
          animation-delay: -5s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(191, 219, 254, 0.5) 0%, transparent 70%);
          top: 30%;
          right: 15%;
          animation-duration: 35s;
          animation-delay: -10s;
        }

        .orb-4 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%);
          bottom: 25%;
          left: 20%;
          animation-duration: 40s;
          animation-delay: -15s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(40px, 10px) scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
