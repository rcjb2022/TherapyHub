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

    // NextAuth stores the JWT in session.user (when using JWT strategy)
    // We need to get the raw JWT token, not the decoded session
    // The token is available in the cookie, we'll extract it client-side

    // Get the session token from cookies
    const cookies = document.cookie.split(';')
    const sessionTokenCookie = cookies.find((c) =>
      c.trim().startsWith('next-auth.session-token=') ||
      c.trim().startsWith('__Secure-next-auth.session-token=')
    )

    if (sessionTokenCookie) {
      // Use substring instead of split for robustness (handles = in cookie value)
      const token = sessionTokenCookie.substring(sessionTokenCookie.indexOf('=') + 1)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket Auth] Token retrieved successfully')
      }
      return token
    }

    console.warn('[Socket Auth] Session exists but token not found in cookies')
    return null
  } catch (error) {
    console.error('[Socket Auth] Failed to get session token:', error)
    return null
  }
}
