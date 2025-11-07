/**
 * Custom Next.js Server with Socket.io
 *
 * This server combines Next.js with Socket.io for WebRTC signaling.
 * It handles real-time peer-to-peer connection setup for video sessions.
 *
 * Usage: node server.js (instead of npm run dev)
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXTAUTH_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
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
     * Client sends: { roomId, userId, role, name }
     */
    socket.on('join-room', ({ roomId, userId, role, name }) => {
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
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          ...userInfo,
        })
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

  // Start server
  httpServer
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.io server ready for WebRTC signaling`)
      console.log(`> Environment: ${dev ? 'development' : 'production'}`)
    })
})
