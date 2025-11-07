/**
 * Socket.io Authentication Helper
 *
 * Gets the NextAuth JWT token for Socket.io authentication
 */

import { getSession } from 'next-auth/react'

/**
 * Get the JWT token from the current NextAuth session
 *
 * This token is used to authenticate Socket.io connections.
 * The token is verified by the Socket.io server using the same
 * NEXTAUTH_SECRET.
 *
 * @returns JWT token string or null if not authenticated
 */
export async function getSocketToken(): Promise<string | null> {
  try {
    const session = await getSession()

    if (!session) {
      console.warn('[Socket Auth] No active session found')
      return null
    }

    // Call our API endpoint to get a Socket.io-specific JWT token
    const response = await fetch('/api/socket/token')

    if (!response.ok) {
      console.error('[Socket Auth] Failed to get token:', response.status)
      return null
    }

    const data = await response.json()

    if (!data.token) {
      console.warn('[Socket Auth] No token in API response')
      return null
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket Auth] Token retrieved successfully')
    }

    return data.token
  } catch (error) {
    console.error('[Socket Auth] Error getting socket token:', error)
    return null
  }
}
