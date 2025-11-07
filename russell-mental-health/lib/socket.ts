/**
 * Socket.io Client Singleton
 *
 * Provides a single Socket.io connection for the entire application.
 * Used for WebRTC signaling during video sessions.
 *
 * Usage:
 *   import { getSocket } from '@/lib/socket'
 *   const socket = getSocket()
 *   socket.emit('join-room', { roomId, userId, role, name })
 */

import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

/**
 * Get or create Socket.io connection
 *
 * @param token - JWT token from NextAuth session (required for authentication)
 * @returns Socket.io client instance
 */
export function getSocket(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    // Create new connection to standalone Socket.io server (port 3001)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    socket = io(socketUrl, {
      auth: {
        token, // Send JWT token for authentication (required)
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Connection event handlers
    socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket.io Client] Connected:', socket?.id)
      }
    })

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket.io Client] Disconnected:', reason)
      }
    })

    socket.on('connect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket.io Client] Connection error:', error)
      }
    })

    socket.on('reconnect', (attemptNumber) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket.io Client] Reconnected after', attemptNumber, 'attempts')
      }
    })

    socket.on('reconnect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket.io Client] Reconnection error:', error)
      }
    })

    socket.on('reconnect_failed', () => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket.io Client] Reconnection failed after max attempts')
      }
    })
  }

  return socket
}

/**
 * Disconnect and cleanup Socket.io connection
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket.io Client] Socket disconnected and cleaned up')
    }
  }
}

/**
 * Check if Socket.io is connected
 *
 * @returns true if connected, false otherwise
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false
}
