/**
 * Video Session Utilities
 *
 * Handles timing validation for joining video sessions
 * - Users can join 30 minutes before session start
 * - Users can join anytime during the session (until end time)
 * - Session is locked after end time
 */

export interface SessionJoinStatus {
  canJoin: boolean
  reason?: 'too_early' | 'ended'
  minutesUntil?: number
  message?: string
}

/**
 * Check if a user can join a video session based on current time
 *
 * Rules:
 * - Can join: 30 minutes before start → end time
 * - Too early: Before 30-minute window
 * - Ended: After end time
 *
 * @param startTime - Session start time
 * @param endTime - Session end time
 * @returns SessionJoinStatus with canJoin flag and optional message
 */
export function canJoinSession(
  startTime: Date,
  endTime: Date
): SessionJoinStatus {
  const now = new Date()
  const thirtyMinBefore = new Date(startTime.getTime() - 30 * 60 * 1000)

  // Too early - session opens in X minutes
  if (now < thirtyMinBefore) {
    const minutesUntil = Math.ceil((thirtyMinBefore.getTime() - now.getTime()) / 60000)
    return {
      canJoin: false,
      reason: 'too_early',
      minutesUntil,
      message: `Session opens in ${minutesUntil} minute${minutesUntil === 1 ? '' : 's'}`,
    }
  }

  // Session has ended
  if (now > endTime) {
    return {
      canJoin: false,
      reason: 'ended',
      message: 'This session has ended',
    }
  }

  // Can join!
  return { canJoin: true }
}

/**
 * Format countdown timer for display
 *
 * @param minutesUntil - Minutes until session opens
 * @returns Formatted string (e.g., "29 minutes" or "1 minute")
 */
export function formatCountdown(minutesUntil: number): string {
  if (minutesUntil < 1) return 'Less than a minute'
  if (minutesUntil === 1) return '1 minute'
  return `${minutesUntil} minutes`
}

/**
 * Check if session is currently active (between start and end time)
 *
 * @param startTime - Session start time
 * @param endTime - Session end time
 * @returns True if session is currently in progress
 */
export function isSessionActive(startTime: Date, endTime: Date): boolean {
  const now = new Date()
  return now >= startTime && now <= endTime
}

/**
 * Check if session is in the pre-join window (30 min before start)
 *
 * @param startTime - Session start time
 * @returns True if within 30-minute pre-join window
 */
export function isInPreJoinWindow(startTime: Date): boolean {
  const now = new Date()
  const thirtyMinBefore = new Date(startTime.getTime() - 30 * 60 * 1000)
  return now >= thirtyMinBefore && now < startTime
}
