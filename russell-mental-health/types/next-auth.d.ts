// Extend NextAuth types to include custom fields
// Adds role, id, and session duration to session.user and JWT

import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
    }
    expires: string // ISO string of when session expires
    sessionDuration?: number // Duration in seconds based on role
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    image?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    exp?: number // Expiration timestamp
    sessionDuration?: number // Duration in seconds based on role
  }
}
