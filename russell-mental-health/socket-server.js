/**
 * Standalone Socket.io Server for WebRTC Signaling
 *
 * Runs independently on port 3001 alongside Next.js (port 3000)
 * Handles real-time WebRTC signaling for video sessions
 *
 * Usage: node socket-server.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createServer } = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

const port = parseInt(process.env.SOCKET_PORT || '3001', 10)
const dev = process.env.NODE_ENV !== 'production'

// JWT secret from NextAuth (must match NEXTAUTH_SECRET in .env.local)
const JWT_SECRET = process.env.NEXTAUTH_SECRET
if (!JWT_SECRET) {
  console.error('[Socket.io] FATAL: NEXTAUTH_SECRET is not set in environment variables')
  console.error('[Socket.io] Make sure .env.local exists with NEXTAUTH_SECRET defined')
  process.exit(1)
}

// Create HTTP server for Socket.io
const httpServer = createServer()

// Initialize Socket.io with CORS for Next.js
const io = new Server(httpServer, {
  cors: {
    origin: dev ? 'http://localhost:3000' : process.env.NEXTAUTH_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Authentication middleware - verify JWT token before allowing connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication error: No token provided'))
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Validate required fields
    if (!decoded.role) {
      return next(new Error('Authentication error: Token missing role'))
    }

    // Attach authenticated user data to socket
    socket.user = {
      userId: decoded.sub || decoded.id, // NextAuth uses 'sub' for user ID
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }

    console.log(`[Socket.io] Authenticated: ${socket.user.name} (${socket.user.role})`)
    next()
  } catch (err) {
    console.error('[Socket.io] Authentication failed:', err.message)
    return next(new Error('Authentication error: Invalid token'))
  }
})

// Track active rooms and participants
const rooms = new Map() // roomId -> Set of socketIds
const socketToRoom = new Map() // socketId -> roomId
const socketToUser = new Map() // socketId -> { userId, role, name }

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`)

  /**
   * Join a video session room
   *
   * Client sends: { roomId }
   * User data comes from authenticated socket.user (verified by middleware)
   */
  socket.on('join-room', ({ roomId }) => {
    // Use authenticated user data from socket.user (set by auth middleware)
    const { userId, role, name } = socket.user

    console.log(`[Socket.io] ${name} (${role}) joining room: ${roomId}`)

    // Leave previous room if any
    const previousRoom = socketToRoom.get(socket.id)
    if (previousRoom) {
      socket.leave(previousRoom)
      rooms.get(previousRoom)?.delete(socket.id)
    }

    // Join new room
    socket.join(roomId)
    socketToRoom.set(socket.id, roomId)
    socketToUser.set(socket.id, { userId, role, name })

    // Track room participants
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set())
    }
    rooms.get(roomId).add(socket.id)

    // Get other participants in room
    const otherParticipants = Array.from(rooms.get(roomId))
      .filter((id) => id !== socket.id)
      .map((id) => ({
        socketId: id,
        ...socketToUser.get(id),
      }))

    // Notify this user of other participants
    socket.emit('room-joined', {
      roomId,
      participants: otherParticipants,
    })

    // Notify other participants that this user joined
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      role,
      name,
    })

    console.log(`[Socket.io] Room ${roomId} now has ${rooms.get(roomId).size} participants`)
  })

  /**
   * WebRTC Signaling: Offer
   *
   * Peer A sends offer to Peer B
   */
  socket.on('webrtc-offer', ({ targetSocketId, offer }) => {
    console.log(`[Socket.io] Forwarding offer from ${socket.id} to ${targetSocketId}`)

    io.to(targetSocketId).emit('webrtc-offer', {
      fromSocketId: socket.id,
      offer,
    })
  })

  /**
   * WebRTC Signaling: Answer
   *
   * Peer B sends answer back to Peer A
   */
  socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
    console.log(`[Socket.io] Forwarding answer from ${socket.id} to ${targetSocketId}`)

    io.to(targetSocketId).emit('webrtc-answer', {
      fromSocketId: socket.id,
      answer,
    })
  })

  /**
   * WebRTC Signaling: ICE Candidate
   *
   * Exchange ICE candidates for NAT traversal
   */
  socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
    console.log(`[Socket.io] Forwarding ICE candidate from ${socket.id} to ${targetSocketId}`)

    io.to(targetSocketId).emit('ice-candidate', {
      fromSocketId: socket.id,
      candidate,
    })
  })

  /**
   * Recording Started
   *
   * Notify other participants that recording has begun
   */
  socket.on('recording-started', () => {
    const roomId = socketToRoom.get(socket.id)
    if (roomId) {
      console.log(`[Socket.io] Recording started in room: ${roomId}`)
      socket.to(roomId).emit('recording-started')
    }
  })

  /**
   * Recording Stopped
   *
   * Notify other participants that recording has stopped
   */
  socket.on('recording-stopped', () => {
    const roomId = socketToRoom.get(socket.id)
    if (roomId) {
      console.log(`[Socket.io] Recording stopped in room: ${roomId}`)
      socket.to(roomId).emit('recording-stopped')
    }
  })

  /**
   * Disconnect Handler
   *
   * Clean up when user leaves
   */
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`)

    const roomId = socketToRoom.get(socket.id)
    const userInfo = socketToUser.get(socket.id)

    if (roomId) {
      // Remove from room tracking
      rooms.get(roomId)?.delete(socket.id)

      // If room is empty, delete it
      if (rooms.get(roomId)?.size === 0) {
        rooms.delete(roomId)
        console.log(`[Socket.io] Room ${roomId} is now empty and removed`)
      }

      // Notify other participants
      if (userInfo) {
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          ...userInfo,
        })
      }
    }

    // Clean up tracking maps
    socketToRoom.delete(socket.id)
    socketToUser.delete(socket.id)
  })

  /**
   * Error Handler
   */
  socket.on('error', (error) => {
    console.error(`[Socket.io] Socket error for ${socket.id}:`, error)
  })
})

// Start Socket.io server
httpServer
  .once('error', (err) => {
    console.error('[Socket.io] Server error:', err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`[Socket.io] Server ready on http://localhost:${port}`)
    console.log(`[Socket.io] Environment: ${dev ? 'development' : 'production'}`)
    console.log(`[Socket.io] Waiting for WebRTC connections...`)
  })
