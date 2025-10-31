// Patient Forms API
// Handle form submissions and retrieval

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/patients/[id]/forms - Get all forms for a patient
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        therapist: true,
        patient: true,
      },
    })

    // Authorization check
    if (user?.role === 'THERAPIST') {
      // Therapist must own the patient
      if (!user.therapist) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 })
      }
      const patient = await prisma.patient.findFirst({
        where: { id: id, therapistId: user.therapist.id },
      })
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }
    } else if (user?.role === 'PATIENT') {
      // Patient can only access their own forms
      if (!user.patient || user.patient.id !== id) {
        return NextResponse.json({ error: 'Unauthorized - You can only access your own forms' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check for formType query parameter
    const { searchParams } = new URL(request.url)
    const formType = searchParams.get('formType')

    const whereClause: any = { patientId: id }
    if (formType) {
      whereClause.formType = formType
    }

    const forms = await prisma.formSubmission.findMany({
      where: whereClause,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        therapist: true,
        patient: true,
      },
    })

    const body = await request.json()
    const { formType, formData, status } = body

    console.log('Received form submission:', { formType, patientId: id, status, userRole: user?.role })

    // Authorization check
    let patient
    if (user?.role === 'THERAPIST') {
      // Therapist must own the patient
      if (!user.therapist) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 })
      }
      patient = await prisma.patient.findFirst({
        where: { id: id, therapistId: user.therapist.id },
      })
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found or not authorized' }, { status: 404 })
      }
    } else if (user?.role === 'PATIENT') {
      // Patient can only submit their own forms
      if (!user.patient || user.patient.id !== id) {
        return NextResponse.json({ error: 'Unauthorized - You can only submit your own forms' }, { status: 403 })
      }
      patient = user.patient
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if form already exists for this patient
    const existingForm = await prisma.formSubmission.findFirst({
      where: {
        patientId: id,
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
          submittedBy: status === 'SUBMITTED' ? user.id : existingForm.submittedBy,
          completedAt: status === 'SUBMITTED' || status === 'APPROVED' ? new Date() : null,
        },
      })
      console.log('Updated existing form submission:', formSubmission.id)
    } else {
      // Create new form submission
      formSubmission = await prisma.formSubmission.create({
        data: {
          patientId: id,
          formType,
          formData,
          status,
          submittedBy: status === 'SUBMITTED' ? user.id : null,
          completedAt: status === 'SUBMITTED' || status === 'APPROVED' ? new Date() : null,
        },
      })
      console.log('Created new form submission:', formSubmission.id)
    }

    // Update patient record with form data if it's a patient information form
    if (formType === 'patient-information' && formData) {
      console.log('Updating patient record with form data...')
      await prisma.patient.update({
        where: { id: id },
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
        details: { formType, patientId: id },
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
