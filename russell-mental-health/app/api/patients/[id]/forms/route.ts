// Patient Forms API
// Handle form submissions and retrieval

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/patients/[id]/forms - Get all forms for a patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapist: true },
    })

    if (!user?.therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }

    const forms = await prisma.formSubmission.findMany({
      where: { patientId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(forms)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/patients/[id]/forms - Create or update a form submission
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapist: true },
    })

    if (!user?.therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }

    const body = await request.json()
    const { formType, formData, status } = body

    console.log('Received form submission:', { formType, patientId: params.id, status })

    // Verify patient exists and belongs to therapist
    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        therapistId: user.therapist.id,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check if form already exists for this patient
    const existingForm = await prisma.formSubmission.findFirst({
      where: {
        patientId: params.id,
        formType: formType,
      },
    })

    let formSubmission

    if (existingForm) {
      // Update existing form
      formSubmission = await prisma.formSubmission.update({
        where: { id: existingForm.id },
        data: {
          formData,
          status,
          completedAt: status === 'SUBMITTED' || status === 'APPROVED' ? new Date() : null,
        },
      })
      console.log('Updated existing form submission:', formSubmission.id)
    } else {
      // Create new form submission
      formSubmission = await prisma.formSubmission.create({
        data: {
          patientId: params.id,
          formType,
          formData,
          status,
          completedAt: status === 'SUBMITTED' || status === 'APPROVED' ? new Date() : null,
        },
      })
      console.log('Created new form submission:', formSubmission.id)
    }

    // Update patient record with form data if it's a patient information form
    if (formType === 'patient-information' && formData) {
      console.log('Updating patient record with form data...')
      await prisma.patient.update({
        where: { id: params.id },
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          address: {
            street: formData.street || null,
            city: formData.city || null,
            state: formData.state || null,
            zip: formData.zip || null,
          },
        },
      })
      console.log('Patient record updated successfully')
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: existingForm ? 'UPDATE' : 'CREATE',
        resource: 'FormSubmission',
        resourceId: formSubmission.id,
        phi: true,
        details: { formType, patientId: params.id },
      },
    })

    return NextResponse.json(formSubmission, { status: existingForm ? 200 : 201 })
  } catch (error: any) {
    console.error('Error saving form:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
