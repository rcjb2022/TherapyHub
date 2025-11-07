/**
 * Socket.io Connection Test Page
 *
 * TEMPORARY: For testing Socket.io setup only
 * DELETE after WebRTC implementation is complete
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSocket } from '@/lib/socket'
import { getSocketToken } from '@/lib/socket-auth'
import type { SocketUser } from '@/types/socket'

export default function SocketTestPage() {
  const [connected, setConnected] = useState(false)
  const [socketId, setSocketId] = useState<string>('')
  const [messages, setMessages] = useState<string[]>([])
  const [token, setToken] = useState<string | null>(null)

  const addMessage = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setMessages((prev) => [...prev, `[${timestamp}] ${message}`])
  }, [])

  useEffect(() => {
    // Get authentication token first
    getSocketToken().then((authToken) => {
      if (!authToken) {
        addMessage('❌ Failed to get authentication token')
        return
      }

      setToken(authToken)
      addMessage('✅ Authentication token obtained')

      // Connect to Socket.io with token
      const socket = getSocket(authToken)

    // Connection status
    setConnected(socket.connected)
    setSocketId(socket.id || '')

    // Listen for connection events
    const onConnect = () => {
      setConnected(true)
      setSocketId(socket.id || '')
      addMessage('✅ Connected to Socket.io server')
    }

    const onDisconnect = () => {
      setConnected(false)
      addMessage('❌ Disconnected from Socket.io server')
    }

    const onUserJoined = (user: { name: string; role: string }) => {
      addMessage(`👤 User joined: ${user.name} (${user.role})`)
    }

      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      socket.on('user-joined', onUserJoined)

      // Clean up
      return () => {
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.off('user-joined', onUserJoined)
      }
    })
  }, [addMessage])

  const testJoinRoom = () => {
    if (!token) {
      addMessage('❌ Cannot join room: No authentication token')
      return
    }

    const socket = getSocket(token)
    const testRoomId = 'test-room-123'

    addMessage(`🔵 Joining room: ${testRoomId}`)

    // Only send roomId - server gets user data from authenticated socket.user
    socket.emit('join-room', {
      roomId: testRoomId,
    })

    // Listen for room-joined event (once per button click is OK)
    socket.once('room-joined', ({ roomId, participants }: { roomId: string; participants: SocketUser[] }) => {
      addMessage(`✅ Successfully joined room: ${roomId}`)
      addMessage(`👥 Room has ${participants.length} other participants`)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Socket.io Connection Test</h1>
          <p className="mt-2 text-gray-600">
            Temporary page for testing WebRTC signaling server
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Connection Status</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              ></div>
              <span className="font-medium text-gray-700">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {socketId && (
              <div className="text-sm text-gray-600">
                <strong>Socket ID:</strong> {socketId}
              </div>
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Test Actions</h2>

          <button
            onClick={testJoinRoom}
            disabled={!connected}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Join Room
          </button>
        </div>

        {/* Message Log */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Message Log</h2>

          <div className="space-y-2 rounded bg-gray-900 p-4 font-mono text-sm text-green-400 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-gray-500">No messages yet...</div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="break-words">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Check that connection status shows "Connected"</li>
            <li>Click "Test Join Room" button</li>
            <li>Check message log for successful room join</li>
            <li>Open this page in another browser tab (incognito mode)</li>
            <li>Click "Test Join Room" in second tab</li>
            <li>Both tabs should see "User joined" messages</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
