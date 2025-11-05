/**
 * Therapists API
 * GET - Fetch all therapists
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all therapists
    const therapists = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    })

    return NextResponse.json(therapists)
  } catch (error) {
    console.error('Failed to fetch therapists:', error)
    return NextResponse.json({ error: 'Failed to fetch therapists' }, { status: 500 })
  }
}
