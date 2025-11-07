/**
 * Socket.io Token API
 *
 * Generates a JWT token for Socket.io authentication
 * based on the current NextAuth session
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get JWT secret from environment
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('[Socket Token API] NEXTAUTH_SECRET is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create a short-lived token for Socket.io (matches session duration: 15 minutes)
    const token = jwt.sign(
      {
        sub: session.user.id,
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      secret,
      {
        expiresIn: '15m', // Match NextAuth session timeout
      }
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error('[Socket Token API] Error generating token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
