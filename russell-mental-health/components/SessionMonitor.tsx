'use client'

// Session Monitor Component
// Tracks session expiration and shows warning modal 5 minutes before timeout
// Allows users to extend their session to avoid losing work

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import SessionWarningModal from './SessionWarningModal'

const WARNING_THRESHOLD = 5 * 60 // Show warning 5 minutes before expiration

export default function SessionMonitor() {
  const { data: session, update } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    if (!session?.expires) return

    const checkSessionExpiration = () => {
      const expiresAt = new Date(session.expires).getTime()
      const now = Date.now()
      const secondsRemaining = Math.floor((expiresAt - now) / 1000)

      setTimeRemaining(secondsRemaining)

      // Show warning if within 5 minutes of expiration
      if (secondsRemaining <= WARNING_THRESHOLD && secondsRemaining > 0) {
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }

      // If session has expired, force redirect to login
      if (secondsRemaining <= 0) {
        window.location.href = '/login?expired=true'
      }
    }

    // Check immediately
    checkSessionExpiration()

    // Check every second while warning is shown, every 30 seconds otherwise
    const interval = setInterval(
      checkSessionExpiration,
      showWarning ? 1000 : 30000
    )

    return () => clearInterval(interval)
  }, [session?.expires, showWarning])

  const handleExtendSession = async () => {
    try {
      // Update the session (triggers JWT callback with trigger: 'update')
      await update()
      setShowWarning(false)
    } catch (error) {
      console.error('[SessionMonitor] Failed to extend session:', error)
    }
  }

  const handleDismiss = () => {
    // User dismissed the warning, don't show again until next warning threshold
    setShowWarning(false)
  }

  return (
    <SessionWarningModal
      isOpen={showWarning}
      timeRemaining={timeRemaining}
      onExtendSession={handleExtendSession}
      onClose={handleDismiss}
    />
  )
}
