/**
 * WebRTC Video Room Component
 *
 * Manages peer-to-peer video connections using SimplePeer and Socket.io signaling
 * Supports therapist-patient video sessions with HIPAA compliance
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import SimplePeer from 'simple-peer'
import { Socket } from 'socket.io-client'
import type { SocketUser } from '@/types/socket'

interface VideoRoomProps {
  socket: Socket
  roomId: string
  currentUser: {
    userId: string
    name: string
    role: 'THERAPIST' | 'PATIENT'
  }
}

interface PeerConnection {
  peer: SimplePeer.Instance
  socketId: string
  userInfo: SocketUser
}

export default function VideoRoom({ socket, roomId, currentUser }: VideoRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peersRef = useRef<Map<string, PeerConnection>>(new Map())

  // Get STUN server from environment (Google's free STUN server by default)
  const stunServer = process.env.NEXT_PUBLIC_STUN_SERVER_URL || 'stun:stun.l.google.com:19302'

  /**
   * Initialize local media stream (camera + microphone)
   */
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setLocalStream(stream)

      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      console.log('[VideoRoom] Local stream initialized')
      return stream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('[VideoRoom] Failed to get user media:', errorMessage)
      setError(`Camera/microphone access denied: ${errorMessage}`)
      return null
    }
  }, [])

  /**
   * Create a peer connection for a remote user
   */
  const createPeer = useCallback(
    (remoteSocketId: string, remoteUser: SocketUser, stream: MediaStream, initiator: boolean) => {
      console.log(
        `[VideoRoom] Creating peer connection with ${remoteUser.name} (initiator: ${initiator})`
      )

      const peer = new SimplePeer({
        initiator,
        trickle: true,
        stream,
        config: {
          iceServers: [{ urls: stunServer }],
        },
      })

      // When we have a signaling data (offer or answer), send it via Socket.io
      peer.on('signal', (signal) => {
        console.log(`[VideoRoom] Sending ${initiator ? 'offer' : 'answer'} to ${remoteSocketId}`)

        if (signal.type === 'offer') {
          socket.emit('webrtc-offer', {
            targetSocketId: remoteSocketId,
            offer: signal,
          })
        } else if (signal.type === 'answer') {
          socket.emit('webrtc-answer', {
            targetSocketId: remoteSocketId,
            answer: signal,
          })
        } else {
          // ICE candidate
          socket.emit('ice-candidate', {
            targetSocketId: remoteSocketId,
            candidate: signal,
          })
        }
      })

      // When peer connection is established
      peer.on('connect', () => {
        console.log(`[VideoRoom] Connected to ${remoteUser.name}`)
      })

      // When we receive remote stream
      peer.on('stream', (remoteStream) => {
        console.log(`[VideoRoom] Received stream from ${remoteUser.name}`)

        // Update peer with stream
        const peerConnection: PeerConnection = {
          peer,
          socketId: remoteSocketId,
          userInfo: remoteUser,
        }

        peersRef.current.set(remoteSocketId, peerConnection)
        setPeers(new Map(peersRef.current))

        // Attach stream to video element
        const videoElement = document.getElementById(
          `remote-video-${remoteSocketId}`
        ) as HTMLVideoElement
        if (videoElement) {
          videoElement.srcObject = remoteStream
        }
      })

      // Handle errors
      peer.on('error', (err) => {
        console.error(`[VideoRoom] Peer error with ${remoteUser.name}:`, err)
      })

      // Handle peer close
      peer.on('close', () => {
        console.log(`[VideoRoom] Peer connection closed with ${remoteUser.name}`)
        peersRef.current.delete(remoteSocketId)
        setPeers(new Map(peersRef.current))
      })

      return peer
    },
    [socket, stunServer]
  )

  /**
   * Setup Socket.io event listeners for WebRTC signaling
   */
  useEffect(() => {
    if (!socket || !localStream) return

    // When we successfully join a room, initiate connections to existing participants
    const handleRoomJoined = ({ participants }: { roomId: string; participants: SocketUser[] }) => {
      console.log(`[VideoRoom] Joined room with ${participants.length} other participants`)

      // Create peer connections to all existing participants (we are the initiator)
      participants.forEach((participant) => {
        const peer = createPeer(participant.socketId, participant, localStream, true)
        const peerConnection: PeerConnection = {
          peer,
          socketId: participant.socketId,
          userInfo: participant,
        }
        peersRef.current.set(participant.socketId, peerConnection)
        setPeers(new Map(peersRef.current))
      })
    }

    // When a new user joins, they will initiate connection to us
    const handleUserJoined = (user: SocketUser) => {
      console.log(`[VideoRoom] User joined: ${user.name}`)
      // We don't create peer here - wait for their offer
    }

    // When we receive an offer, create peer (not initiator) and accept
    const handleOffer = ({ fromSocketId, offer }: { fromSocketId: string; offer: any }) => {
      console.log(`[VideoRoom] Received offer from ${fromSocketId}`)

      // Find user info from existing participants or create placeholder
      const existingPeer = peersRef.current.get(fromSocketId)
      const userInfo = existingPeer?.userInfo || {
        socketId: fromSocketId,
        userId: 'unknown',
        role: 'PATIENT' as const,
        name: 'Unknown User',
      }

      const peer = createPeer(fromSocketId, userInfo, localStream, false)

      // Signal the offer to the peer
      peer.signal(offer)

      const peerConnection: PeerConnection = {
        peer,
        socketId: fromSocketId,
        userInfo,
      }
      peersRef.current.set(fromSocketId, peerConnection)
      setPeers(new Map(peersRef.current))
    }

    // When we receive an answer to our offer
    const handleAnswer = ({ fromSocketId, answer }: { fromSocketId: string; answer: any }) => {
      console.log(`[VideoRoom] Received answer from ${fromSocketId}`)

      const peerConnection = peersRef.current.get(fromSocketId)
      if (peerConnection) {
        peerConnection.peer.signal(answer)
      }
    }

    // When we receive an ICE candidate
    const handleIceCandidate = ({
      fromSocketId,
      candidate,
    }: {
      fromSocketId: string
      candidate: any
    }) => {
      console.log(`[VideoRoom] Received ICE candidate from ${fromSocketId}`)

      const peerConnection = peersRef.current.get(fromSocketId)
      if (peerConnection) {
        peerConnection.peer.signal(candidate)
      }
    }

    // When a user leaves
    const handleUserLeft = (user: SocketUser) => {
      console.log(`[VideoRoom] User left: ${user.name}`)

      const peerConnection = peersRef.current.get(user.socketId)
      if (peerConnection) {
        peerConnection.peer.destroy()
        peersRef.current.delete(user.socketId)
        setPeers(new Map(peersRef.current))
      }
    }

    // Register event listeners
    socket.on('room-joined', handleRoomJoined)
    socket.on('user-joined', handleUserJoined)
    socket.on('webrtc-offer', handleOffer)
    socket.on('webrtc-answer', handleAnswer)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('user-left', handleUserLeft)

    // Join the room
    socket.emit('join-room', { roomId })

    // Cleanup
    return () => {
      socket.off('room-joined', handleRoomJoined)
      socket.off('user-joined', handleUserJoined)
      socket.off('webrtc-offer', handleOffer)
      socket.off('webrtc-answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('user-left', handleUserLeft)

      // Destroy all peer connections
      peersRef.current.forEach((peerConnection) => {
        peerConnection.peer.destroy()
      })
      peersRef.current.clear()
      setPeers(new Map())
    }
  }, [socket, roomId, localStream, createPeer])

  /**
   * Initialize local stream on mount
   */
  useEffect(() => {
    initLocalStream()

    return () => {
      // Cleanup: stop all tracks when unmounting
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [initLocalStream])

  /**
   * Toggle video on/off
   */
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  /**
   * Toggle audio on/off
   */
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md rounded-lg bg-red-900/20 border border-red-500 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-400">Camera Error</h3>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={() => {
              setError(null)
              initLocalStream()
            }}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Video Grid */}
      <div className="flex-1 grid gap-4 p-4" style={{
        gridTemplateColumns: peers.size === 0 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        {/* Local Video */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800 shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 left-3 rounded bg-black/70 px-3 py-1 text-sm font-medium text-white">
            {currentUser.name} (You)
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="rounded-full bg-gray-700 p-6">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {Array.from(peers.values()).map(({ socketId, userInfo }) => (
          <div key={socketId} className="relative aspect-video rounded-lg overflow-hidden bg-gray-800 shadow-lg">
            <video
              id={`remote-video-${socketId}`}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-3 left-3 rounded bg-black/70 px-3 py-1 text-sm font-medium text-white">
              {userInfo.name} ({userInfo.role})
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 bg-gray-800 p-4">
        <button
          onClick={toggleAudio}
          className={`rounded-full p-4 transition-colors ${
            isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isAudioEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </>
            )}
          </svg>
        </button>

        <button
          onClick={toggleVideo}
          className={`rounded-full p-4 transition-colors ${
            isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isVideoEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  )
}
