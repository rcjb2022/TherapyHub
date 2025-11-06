/**
 * JoinSessionButton Component
 *
 * Displays a Join Session button with time-based validation
 * - Shows active button if within join window (30 min before → end time)
 * - Shows disabled button with countdown if too early
 * - Hides button if session has ended
 * - Updates every minute to keep countdown fresh
 */

'use client'

import { useState, useEffect } from 'react'
import { VideoCameraIcon, ClockIcon } from '@heroicons/react/24/outline'
import { canJoinSession } from '@/lib/video-utils'

interface JoinSessionButtonProps {
  appointmentId: string
  startTime: Date | string
  endTime: Date | string
  googleMeetLink: string | null
  status: string
  className?: string
}

export function JoinSessionButton({
  appointmentId,
  startTime,
  endTime,
  googleMeetLink,
  status,
  className = '',
}: JoinSessionButtonProps) {
  // Convert to Date objects if needed
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime

  // State for join status (updates every minute)
  const [joinStatus, setJoinStatus] = useState(() => canJoinSession(start, end))

  // Update join status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setJoinStatus(canJoinSession(start, end))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [start, end])

  // Don't show button if cancelled
  if (status === 'CANCELLED') {
    return <span className="text-xs font-medium text-gray-500">Cancelled</span>
  }

  // Don't show button if no Google Meet link
  if (!googleMeetLink) {
    return null
  }

  // Session has ended
  if (joinStatus.reason === 'ended') {
    return <span className="text-xs font-medium text-gray-500">Session Ended</span>
  }

  // Too early - show countdown
  if (joinStatus.reason === 'too_early') {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600 cursor-not-allowed ${className}`}
        title={joinStatus.message}
      >
        <ClockIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Opens in {joinStatus.minutesUntil} min</span>
        <span className="sm:hidden">{joinStatus.minutesUntil} min</span>
      </button>
    )
  }

  // Can join!
  return (
    <a
      href={googleMeetLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 ${className}`}
    >
      <VideoCameraIcon className="h-4 w-4" />
      Join Session
    </a>
  )
}
