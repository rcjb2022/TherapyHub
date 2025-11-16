// Patient API Routes (Individual)
// GET, PUT, DELETE operations for specific patient

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Session } from 'next-auth'
import { Patient } from '@prisma/client'

/**
 * Verify user has permission to access the specified patient
 * @param session - NextAuth session
 * @param patientId - ID of patient being accessed
 * @returns Object with authorization status and patient data if authorized
 */
async function verifyPatientAccess(
  session: Session,
  patientId: string
): Promise<{ authorized: boolean; patient?: Patient; error?: string; statusCode?: number }> {

  // Fetch the patient first
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  })

  if (!patient) {
    return { authorized: false, error: 'Patient not found', statusCode: 404 }
  }

  // Fetch user with all necessary relations
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { therapist: true, patient: true }
  })

  if (!user) {
    return { authorized: false, error: 'User not found', statusCode: 404 }
  }

  // Check authorization based on role
  if (session.user.role === 'PATIENT') {
    // Patients can only access their own record
    if (patient.userId !== user.id) {
      return {
        authorized: false,
        error: 'Forbidden - patients can only access their own records',
        statusCode: 403
      }
    }
    return { authorized: true, patient }
  }

  else if (session.user.role === 'THERAPIST') {
    // Therapists can only access their own patients
    if (!user.therapist) {
      return { authorized: false, error: 'Therapist profile not found', statusCode: 404 }
    }

    if (patient.therapistId !== user.therapist.id) {
      return {
        authorized: false,
        error: 'Forbidden - therapists can only access their own patients',
        statusCode: 403
      }
    }
    return { authorized: true, patient }
  }

  else if (session.user.role === 'ADMIN') {
    // Admins can access any patient
    return { authorized: true, patient }
  }

  // Unknown role
  return {
    authorized: false,
    error: 'Forbidden - insufficient permissions',
    statusCode: 403
  }
}

// GET /api/patients/[id] - Get single patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify authorization
    const { authorized, patient, error, statusCode } = await verifyPatientAccess(session, id)

    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }

    // Get user for audit log
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    // Create audit log for PHI access
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'READ',
          resource: 'Patient',
          resourceId: patient!.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          phi: true,
          details: { patientEmail: patient!.email },
        },
      })
    }

    console.log('GET /api/patients/[id] - Returning patient:', {
      id: patient!.id,
      firstName: patient!.firstName,
      lastName: patient!.lastName,
      role: session.user.role
    })

    return NextResponse.json(patient, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('[GET /api/patients/[id]] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify authorization
    const { authorized, patient, error, statusCode } = await verifyPatientAccess(session, id)

    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }

    // Patients have read-only access to their own records (can't update via API)
    if (session.user.role === 'PATIENT') {
      return NextResponse.json({
        error: 'Forbidden - patients cannot update records via API'
      }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth, address, status } = body

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: { id: id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        address,
        status,
      },
    })

    // Get user for audit log
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    // Create audit log
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          resource: 'Patient',
          resourceId: updatedPatient.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          phi: true,
          details: { changes: body },
        },
      })
    }

    return NextResponse.json(updatedPatient)
  } catch (error: any) {
    console.error('[PUT /api/patients/[id]] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/patients/[id] - Delete patient (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists and admins can delete patients
    if (session.user.role === 'PATIENT') {
      return NextResponse.json({
        error: 'Forbidden - patients cannot delete records'
      }, { status: 403 })
    }

    // Verify authorization
    const { authorized, patient, error, statusCode } = await verifyPatientAccess(session, id)

    if (!authorized) {
      return NextResponse.json({ error }, { status: statusCode || 403 })
    }

    // Soft delete - set status to DISCHARGED
    const updatedPatient = await prisma.patient.update({
      where: { id: id },
      data: { status: 'DISCHARGED' },
    })

    // Get user for audit log
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    // Create audit log
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE',
          resource: 'Patient',
          resourceId: updatedPatient.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          phi: true,
          details: { reason: 'Soft delete - discharged' },
        },
      })
    }

    return NextResponse.json({ message: 'Patient discharged successfully' })
  } catch (error: any) {
    console.error('[DELETE /api/patients/[id]] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
