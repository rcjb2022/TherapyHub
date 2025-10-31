// API Route: Complete a form submission
// PATCH /api/patients/[id]/forms/[formId]/complete
// Updates form status to COMPLETED and saves data to patient record

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  try {
    const { id, formId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get therapist
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapist: true },
    })

    if (!user?.therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }

    // Verify patient belongs to this therapist
    const patient = await prisma.patient.findFirst({
      where: {
        id: id,
        therapistId: user.therapist.id,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Get the form submission
    const formSubmission = await prisma.formSubmission.findUnique({
      where: { id: formId },
    })

    if (!formSubmission || formSubmission.patientId !== id) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const body = await request.json()
    const { formData, therapistId } = body

    // Update form submission to COMPLETED
    const updatedForm = await prisma.formSubmission.update({
      where: { id: formId },
      data: {
        formData: formData,
        status: 'COMPLETED',
        completedAt: new Date(),
        reviewedBy: therapistId,
      },
    })

    // TODO: Update patient record based on form type
    // For now, just mark as complete
    // In future, update Insurance table, patient address, etc.

    return NextResponse.json(updatedForm)
  } catch (error: any) {
    console.error('Error completing form:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
