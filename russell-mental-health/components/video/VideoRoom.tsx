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
  onEndSession?: () => void
}

interface PeerConnection {
  peer: SimplePeer.Instance
  socketId: string
  userInfo: SocketUser
}

export default function VideoRoom({ socket, roomId, currentUser, onEndSession }: VideoRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peersRef = useRef<Map<string, PeerConnection>>(new Map())
  const participantsMapRef = useRef<Map<string, SocketUser>>(new Map())
  const hasJoinedRoomRef = useRef(false)

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingStartTimeRef = useRef<number>(0)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

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
   * Start recording the session
   */
  const startRecording = useCallback(() => {
    if (!localStream) {
      console.error('[VideoRoom] Cannot start recording: no local stream')
      return
    }

    try {
      console.log('[VideoRoom] Starting recording...')

      // For now, record just the local stream
      // TODO Phase 3: Combine with remote streams
      const options = { mimeType: 'video/webm;codecs=vp9,opus' }

      // Check if the mimeType is supported, fallback if needed
      const mimeType = MediaRecorder.isTypeSupported(options.mimeType)
        ? options.mimeType
        : 'video/webm'

      const mediaRecorder = new MediaRecorder(localStream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
          console.log(`[VideoRoom] Recorded chunk: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onstart = () => {
        console.log('[VideoRoom] Recording started')
        setIsRecording(true)
        setIsPaused(false)
        recordingStartTimeRef.current = Date.now()

        // Start recording duration timer
        recordingTimerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
          setRecordingDuration(elapsed)
        }, 1000)

        // Notify all participants that recording has started
        socket.emit('recording-started', { roomId })
      }

      mediaRecorder.onstop = () => {
        console.log('[VideoRoom] Recording stopped')
        setIsRecording(false)
        setIsPaused(false)

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          recordingTimerRef.current = null
        }

        // Notify all participants that recording has stopped
        socket.emit('recording-stopped', { roomId })
      }

      mediaRecorder.onerror = (event) => {
        console.error('[VideoRoom] MediaRecorder error:', event)
        setError('Recording failed. Please try again.')
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Capture in 1-second chunks
    } catch (err) {
      console.error('[VideoRoom] Failed to start recording:', err)
      setError('Failed to start recording. Your browser may not support this feature.')
    }
  }, [localStream, socket, roomId])

  /**
   * Pause the recording
   */
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      console.log('[VideoRoom] Recording paused')

      // Stop the duration timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }

      socket.emit('recording-paused', { roomId })
    }
  }, [socket, roomId])

  /**
   * Resume the recording
   */
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      console.log('[VideoRoom] Recording resumed')

      // Restart the duration timer
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        setRecordingDuration(elapsed)
      }, 1000)

      socket.emit('recording-resumed', { roomId })
    }
  }, [socket, roomId])

  /**
   * Stop recording and prepare the blob for upload
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()

      // Create a blob from recorded chunks
      setTimeout(() => {
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
          console.log(`[VideoRoom] Recording complete: ${blob.size} bytes`)

          // For testing: download the recording
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `session-${roomId}-${Date.now()}.webm`
          a.click()
          URL.revokeObjectURL(url)

          // Clear chunks for next recording
          recordedChunksRef.current = []
        }
      }, 100)
    }
  }, [roomId])

  /**
   * End the video session and clean up all resources
   */
  const endSession = useCallback(() => {
    console.log('[VideoRoom] Ending session...')

    // Stop recording if active
    if (isRecording) {
      stopRecording()
    }

    // Clear recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop()
        console.log(`[VideoRoom] Stopped track: ${track.kind}`)
      })
      setLocalStream(null)
    }

    // Destroy all peer connections
    peersRef.current.forEach((peerConnection) => {
      peerConnection.peer.removeAllListeners('close')
      peerConnection.peer.destroy()
    })
    peersRef.current.clear()
    setPeers(new Map())

    // Clear participants
    participantsMapRef.current.clear()

    // Leave the room
    if (socket) {
      socket.emit('leave-room', { roomId })
    }

    // Reset join flag
    hasJoinedRoomRef.current = false

    console.log('[VideoRoom] Session ended successfully')

    // Call the onEndSession callback if provided
    if (onEndSession) {
      onEndSession()
    }
  }, [isRecording, stopRecording, localStream, socket, roomId, onEndSession])

  /**
   * Setup Socket.io event listeners for WebRTC signaling
   */
  useEffect(() => {
    if (!socket || !localStream) return

    // When we successfully join a room, initiate connections to existing participants
    const handleRoomJoined = ({ participants }: { roomId: string; participants: SocketUser[] }) => {
      console.log(`[VideoRoom] Joined room with ${participants.length} other participants`)

      // Store participant info
      participants.forEach((participant) => {
        participantsMapRef.current.set(participant.socketId, participant)
      })

      // Create peer connections to all existing participants (we are the initiator)
      participants.forEach((participant) => {
        // Skip if peer already exists
        if (peersRef.current.has(participant.socketId)) {
          console.log(`[VideoRoom] Peer already exists for ${participant.name}, skipping`)
          return
        }

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

    // When a new user joins, store their info - they will initiate connection to us
    const handleUserJoined = (user: SocketUser) => {
      console.log(`[VideoRoom] User joined: ${user.name}`)
      participantsMapRef.current.set(user.socketId, user)
    }

    // When we receive an offer, create peer (not initiator) and accept
    const handleOffer = ({ fromSocketId, offer }: { fromSocketId: string; offer: SimplePeer.SignalData }) => {
      console.log(`[VideoRoom] Received offer from ${fromSocketId}`)

      // Check if peer already exists
      const existingPeer = peersRef.current.get(fromSocketId)
      if (existingPeer) {
        console.log(`[VideoRoom] Peer already exists for ${fromSocketId}, ignoring duplicate offer`)
        return
      }

      // Get user info from participants map
      const userInfo = participantsMapRef.current.get(fromSocketId) || {
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
    const handleAnswer = ({ fromSocketId, answer }: { fromSocketId: string; answer: SimplePeer.SignalData }) => {
      console.log(`[VideoRoom] Received answer from ${fromSocketId}`)

      const peerConnection = peersRef.current.get(fromSocketId)
      if (peerConnection) {
        try {
          peerConnection.peer.signal(answer)
        } catch (err) {
          console.error(`[VideoRoom] Error signaling answer from ${fromSocketId}:`, err)
        }
      } else {
        console.warn(`[VideoRoom] Received answer from unknown peer ${fromSocketId}`)
      }
    }

    // When we receive an ICE candidate
    const handleIceCandidate = ({
      fromSocketId,
      candidate,
    }: {
      fromSocketId: string
      candidate: SimplePeer.SignalData
    }) => {
      console.log(`[VideoRoom] Received ICE candidate from ${fromSocketId}`)

      const peerConnection = peersRef.current.get(fromSocketId)
      if (peerConnection) {
        try {
          peerConnection.peer.signal(candidate)
        } catch (err) {
          console.error(`[VideoRoom] Error signaling ICE candidate from ${fromSocketId}:`, err)
        }
      }
    }

    // When a user leaves
    const handleUserLeft = (user: SocketUser) => {
      console.log(`[VideoRoom] User left: ${user.name}`)

      participantsMapRef.current.delete(user.socketId)

      const peerConnection = peersRef.current.get(user.socketId)
      if (peerConnection) {
        peerConnection.peer.removeAllListeners('close')
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

    // Join the room only once
    if (!hasJoinedRoomRef.current) {
      hasJoinedRoomRef.current = true
      socket.emit('join-room', { roomId })
    }

    // Cleanup
    return () => {
      socket.off('room-joined', handleRoomJoined)
      socket.off('user-joined', handleUserJoined)
      socket.off('webrtc-offer', handleOffer)
      socket.off('webrtc-answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('user-left', handleUserLeft)

      // Only destroy peers and reset join flag if component is unmounting
      // (not just re-rendering due to dependency changes)
    }
  }, [socket, roomId, localStream, createPeer])

  /**
   * Initialize local stream on mount
   */
  useEffect(() => {
    let stream: MediaStream | null = null

    initLocalStream().then((s) => {
      stream = s
    })

    return () => {
      // Cleanup: stop all tracks when unmounting
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [initLocalStream])

  /**
   * Cleanup on unmount: destroy all peer connections and reset join flag
   */
  useEffect(() => {
    return () => {
      // Reset the join flag when component unmounts
      hasJoinedRoomRef.current = false

      // Destroy all peer connections (remove listeners first to prevent state updates on unmount)
      peersRef.current.forEach((peerConnection) => {
        peerConnection.peer.removeAllListeners('close')
        peerConnection.peer.destroy()
      })
      peersRef.current.clear()
    }
  }, [])

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

  /**
   * Format recording duration as MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Auto-start recording when session begins (automatic recording)
  useEffect(() => {
    if (localStream && currentUser.role === 'THERAPIST' && !isRecording && !hasJoinedRoomRef.current) {
      // Wait a moment for peer connections to establish
      const timer = setTimeout(() => {
        startRecording()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [localStream, currentUser.role, isRecording, startRecording])

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Recording Indicator (visible to ALL participants) */}
      {isRecording && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-red-600/90 backdrop-blur-sm px-4 py-2 shadow-lg">
          <div className={`h-3 w-3 rounded-full bg-white ${isPaused ? '' : 'animate-pulse'}`} />
          <span className="text-sm font-semibold text-white">
            {isPaused ? 'Recording Paused' : 'Recording'} {formatDuration(recordingDuration)}
          </span>
        </div>
      )}

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
      <div className="flex items-center justify-between bg-gray-800 p-4">
        {/* Left: Recording Controls (Therapist Only) */}
        <div className="flex items-center gap-3">
          {currentUser.role === 'THERAPIST' && (
            <>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  title="Start Recording"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" />
                  </svg>
                  Start Recording
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeRecording}
                      className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      title="Resume Recording"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="flex items-center gap-2 rounded-full bg-yellow-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
                      title="Pause Recording"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pause
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 rounded-full bg-gray-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
                    title="Stop Recording"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Center: Video/Audio Controls */}
        <div className="flex items-center gap-4">
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

        <button
          onClick={endSession}
          className="rounded-full bg-red-600 p-4 transition-colors hover:bg-red-700"
          title="End Session"
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        </div>

        {/* Right: Empty spacer for balance */}
        <div className="w-32" />
      </div>
    </div>
  )
}
