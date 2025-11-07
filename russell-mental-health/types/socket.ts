/**
 * Socket.io Event Types
 *
 * Type definitions for all Socket.io events used in the application.
 * Ensures type safety for WebRTC signaling.
 */

/**
 * User information for room participants
 */
export interface SocketUser {
  socketId: string
  userId: string
  role: 'THERAPIST' | 'PATIENT'
  name: string
}

/**
 * Client -> Server Events
 */
export interface ClientToServerEvents {
  'join-room': (data: {
    roomId: string
    userId: string
    role: 'THERAPIST' | 'PATIENT'
    name: string
  }) => void

  'webrtc-offer': (data: { targetSocketId: string; offer: RTCSessionDescriptionInit }) => void

  'webrtc-answer': (data: { targetSocketId: string; answer: RTCSessionDescriptionInit }) => void

  'ice-candidate': (data: { targetSocketId: string; candidate: RTCIceCandidateInit }) => void

  'recording-started': () => void

  'recording-stopped': () => void
}

/**
 * Server -> Client Events
 */
export interface ServerToClientEvents {
  'room-joined': (data: { roomId: string; participants: SocketUser[] }) => void

  'user-joined': (data: SocketUser) => void

  'user-left': (data: SocketUser) => void

  'webrtc-offer': (data: { fromSocketId: string; offer: RTCSessionDescriptionInit }) => void

  'webrtc-answer': (data: { fromSocketId: string; answer: RTCSessionDescriptionInit }) => void

  'ice-candidate': (data: { fromSocketId: string; candidate: RTCIceCandidateInit }) => void

  'recording-started': () => void

  'recording-stopped': () => void
}
