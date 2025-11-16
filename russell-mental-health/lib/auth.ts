// NextAuth.js configuration for Russell Mental Health
// Handles therapist authentication with credentials
// Role-based session durations for optimal UX and security

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { compare } from 'bcryptjs'

/**
 * Role-based session durations (in seconds)
 * Balances security with user experience based on typical usage patterns
 */
const SESSION_DURATIONS = {
  PATIENT: 60 * 60,        // 60 minutes - covers full therapy session
  THERAPIST: 8 * 60 * 60,  // 8 hours - full work day
  ADMIN: 4 * 60 * 60,      // 4 hours - moderate security
} as const

/**
 * Get session duration based on user role
 */
function getSessionDuration(role: string): number {
  switch (role) {
    case 'PATIENT':
      return SESSION_DURATIONS.PATIENT
    case 'THERAPIST':
      return SESSION_DURATIONS.THERAPIST
    case 'ADMIN':
      return SESSION_DURATIONS.ADMIN
    default:
      return 15 * 60 // 15 minutes default (conservative)
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours max (therapist duration), actual duration is role-based
    updateAge: 5 * 60,   // Update session every 5 minutes to track activity
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            therapist: true,
            patient: true,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        // Allow therapists, admins, and patients to login
        if (user.role !== 'THERAPIST' && user.role !== 'ADMIN' && user.role !== 'PATIENT') {
          throw new Error('Unauthorized - Invalid user role')
        }

        // Verify password
        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        // Create audit log for login
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            resource: 'User',
            resourceId: user.id,
            phi: false,
            details: { email: user.email },
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign in or manual refresh, set new expiration based on role
      if (user || trigger === 'update') {
        const role = (user?.role || token.role) as string
        const sessionDuration = getSessionDuration(role)
        const now = Math.floor(Date.now() / 1000)

        if (user) {
          token.id = user.id
          token.role = user.role
        }

        // Set role-based expiration time
        token.exp = now + sessionDuration
        token.sessionDuration = sessionDuration
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string

        // Add session expiration info for client-side monitoring
        session.expires = new Date((token.exp as number) * 1000).toISOString()
        session.sessionDuration = token.sessionDuration as number
      }
      return session
    },
  },
}
