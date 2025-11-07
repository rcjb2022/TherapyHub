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

let socket: Socket | null = null

/**
 * Get or create Socket.io connection
 *
 * @returns Socket.io client instance
 */
export function getSocket(): Socket {
  if (!socket) {
    // Create new connection
    socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[Socket.io Client] Connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io Client] Disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket.io Client] Connection error:', error)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket.io Client] Reconnected after', attemptNumber, 'attempts')
    })

    socket.on('reconnect_error', (error) => {
      console.error('[Socket.io Client] Reconnection error:', error)
    })

    socket.on('reconnect_failed', () => {
      console.error('[Socket.io Client] Reconnection failed after max attempts')
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
    console.log('[Socket.io Client] Socket disconnected and cleaned up')
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
