// Patients API Routes
// Handle patient CRUD operations

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/patients - List all patients for current therapist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get therapist ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapist: true },
    })

    if (!user?.therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }

    // Fetch patients
    const patients = await prisma.patient.findMany({
      where: { therapistId: user.therapist.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(patients)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get therapist ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapist: true },
    })

    if (!user?.therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth, address } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if patient with same email already exists
    const existingPatient = await prisma.patient.findFirst({
      where: {
        email,
        therapistId: user.therapist.id,
      },
    })

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Patient with this email already exists' },
        { status: 400 }
      )
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        therapistId: user.therapist.id,
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        resource: 'Patient',
        resourceId: patient.id,
        phi: true,
        details: { patientEmail: email },
      },
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error: any) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
