/**
 * Therapists API
 * GET - Fetch therapists based on role (RBAC)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with relations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        patient: true,
        therapist: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let therapists

    if (session.user.role === 'PATIENT') {
      // Patients can only see their assigned therapist
      if (!user.patient) {
        return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
      }

      const assignedTherapist = await prisma.therapist.findUnique({
        where: { id: user.patient.therapistId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      therapists = assignedTherapist ? [assignedTherapist] : []
    } else if (session.user.role === 'THERAPIST' || session.user.role === 'ADMIN') {
      // Therapists and Admins can see all therapists
      therapists = await prisma.therapist.findMany({
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
    } else {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LIST',
        resource: 'Therapist',
        resourceId: session.user.role === 'PATIENT' ? user.patient?.therapistId || 'none' : 'multiple',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        phi: false, // Therapist info (name, email) is not PHI, but log access anyway
      },
    })

    return NextResponse.json(therapists)
  } catch (error: any) {
    console.error('[Therapists API] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch therapists' }, { status: 500 })
  }
}
