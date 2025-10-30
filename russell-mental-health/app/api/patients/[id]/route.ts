// Patient API Routes (Individual)
// GET, PUT, DELETE operations for specific patient

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/patients/[id] - Get single patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch patient
    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        therapistId: user.therapist.id,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Create audit log for PHI access
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'READ',
        resource: 'Patient',
        resourceId: patient.id,
        phi: true,
        details: { patientEmail: patient.email },
      },
    })

    return NextResponse.json(patient)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { firstName, lastName, email, phone, dateOfBirth, address, status } = body

    // Verify patient belongs to this therapist
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        therapistId: user.therapist.id,
      },
    })

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Update patient
    const patient = await prisma.patient.update({
      where: { id: params.id },
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        resource: 'Patient',
        resourceId: patient.id,
        phi: true,
        details: { changes: body },
      },
    })

    return NextResponse.json(patient)
  } catch (error: any) {
    console.error('Error updating patient:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/patients/[id] - Delete patient (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify patient belongs to this therapist
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        therapistId: user.therapist.id,
      },
    })

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Soft delete - set status to DISCHARGED
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: { status: 'DISCHARGED' },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        resource: 'Patient',
        resourceId: patient.id,
        phi: true,
        details: { reason: 'Soft delete - discharged' },
      },
    })

    return NextResponse.json({ message: 'Patient discharged successfully' })
  } catch (error: any) {
    console.error('Error deleting patient:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
