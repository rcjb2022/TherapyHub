/**
 * WebRTC Video Test Page
 *
 * TEMPORARY: For testing peer-to-peer video connections
 * DELETE after WebRTC implementation is complete
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getSocket } from '@/lib/socket'
import { getSocketToken } from '@/lib/socket-auth'
import VideoRoom from '@/components/video/VideoRoom'
import type { Socket } from 'socket.io-client'

export default function VideoTestPage() {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>(
    'connecting'
  )
  const [roomId, setRoomId] = useState('test-video-room')
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    if (!session) return

    let socketInstance: Socket | null = null

    const onConnect = () => {
      setConnectionStatus('connected')
      if (socketInstance) {
        setSocket(socketInstance)
      }
    }

    const onDisconnect = () => setConnectionStatus('connecting')
    const onConnectError = () => setConnectionStatus('error')

    getSocketToken()
      .then((authToken) => {
        if (!authToken) {
          setConnectionStatus('error')
          return
        }

        socketInstance = getSocket(authToken)
        socketInstance.on('connect', onConnect)
        socketInstance.on('disconnect', onDisconnect)
        socketInstance.on('connect_error', onConnectError)

        // If already connected, trigger the connect handler
        if (socketInstance.connected) {
          onConnect()
        }
      })
      .catch(() => {
        setConnectionStatus('error')
      })

    return () => {
      if (socketInstance) {
        socketInstance.off('connect', onConnect)
        socketInstance.off('disconnect', onDisconnect)
        socketInstance.off('connect_error', onConnectError)
      }
    }
  }, [session])

  const joinRoom = () => {
    if (socket && session?.user) {
      setHasJoined(true)
    }
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading session...</h2>
        </div>
      </div>
    )
  }

  if (connectionStatus === 'error') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-red-50 border border-red-200 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-900">Connection Error</h3>
          <p className="text-sm text-red-700">
            Failed to connect to Socket.io server. Make sure the server is running on port 3001.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!hasJoined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="max-w-lg rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">WebRTC Video Test</h1>

          <div className="mb-6 space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Your Information</h3>
              <p className="text-sm text-blue-800">
                <strong>Name:</strong> {session.user.name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Role:</strong> {session.user.role}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter room ID"
              />
              <p className="text-xs text-gray-500">
                Both users must use the same Room ID to connect
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <h3 className="mb-2 font-semibold text-yellow-900">Testing Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                <li>Make sure Socket.io server is running (npm run dev:all)</li>
                <li>Allow camera and microphone access when prompted</li>
                <li>Open this page in another browser/tab with a different user</li>
                <li>Use the same Room ID in both tabs</li>
                <li>Click "Join Room" in both tabs</li>
                <li>You should see both video feeds</li>
              </ol>
            </div>
          </div>

          <button
            onClick={joinRoom}
            disabled={connectionStatus !== 'connected' || !roomId.trim()}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Join Room'}
          </button>
        </div>
      </div>
    )
  }

  // Show video room
  return (
    <div className="h-screen">
      <VideoRoom
        socket={socket!}
        roomId={roomId}
        currentUser={{
          userId: session.user.id,
          name: session.user.name,
          role: session.user.role as 'THERAPIST' | 'PATIENT',
        }}
      />
    </div>
  )
}
