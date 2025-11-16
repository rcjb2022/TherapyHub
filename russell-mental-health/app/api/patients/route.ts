// Patients API Routes
// Handle patient CRUD operations

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/patients - List all patients (RBAC: THERAPIST sees own, ADMIN sees all)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // RBAC: Only THERAPIST and ADMIN can list patients
    if (session.user.role === 'PATIENT') {
      return NextResponse.json(
        { error: 'Forbidden - patients cannot list other patients' },
        { status: 403 }
      )
    }

    // Get user with relations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapist: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build query based on role
    let patients

    if (session.user.role === 'ADMIN') {
      // Admins can see all patients
      patients = await prisma.patient.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          therapist: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })
    } else if (session.user.role === 'THERAPIST') {
      // Therapists see only their own patients
      if (!user.therapist) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 })
      }

      patients = await prisma.patient.findMany({
        where: { therapistId: user.therapist.id },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LIST',
        resource: 'Patient',
        resourceId: 'multiple',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        phi: true,
      },
    })

    return NextResponse.json(patients)
  } catch (error: any) {
    console.error('[Patients API] GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/patients - Create new patient (RBAC: THERAPIST and ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // RBAC: Only THERAPIST and ADMIN can create patients
    if (session.user.role === 'PATIENT') {
      return NextResponse.json(
        { error: 'Forbidden - patients cannot create patient records' },
        { status: 403 }
      )
    }

    // Get user with relations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapist: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth, address, therapistId } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine which therapist the patient should be assigned to
    let assignedTherapistId: string

    if (session.user.role === 'THERAPIST') {
      // Therapists can only create patients for themselves
      if (!user.therapist) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 })
      }
      assignedTherapistId = user.therapist.id
    } else if (session.user.role === 'ADMIN') {
      // Admins can create patients for any therapist (must specify therapistId)
      if (!therapistId) {
        return NextResponse.json(
          { error: 'Admin must specify therapistId when creating patient' },
          { status: 400 }
        )
      }
      assignedTherapistId = therapistId
    } else {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
    }

    // Check if patient with same email already exists for this therapist
    const existingPatient = await prisma.patient.findFirst({
      where: {
        email,
        therapistId: assignedTherapistId,
      },
    })

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Patient with this email already exists for this therapist' },
        { status: 400 }
      )
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        therapistId: assignedTherapistId,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        address,
        status: 'ACTIVE',
        onboardingComplete: false,
      },
    })

    // Create audit log with IP and user agent
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        resource: 'Patient',
        resourceId: patient.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        phi: true,
        details: { patientEmail: email, assignedTherapistId },
      },
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error: any) {
    console.error('[Patients API] POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
