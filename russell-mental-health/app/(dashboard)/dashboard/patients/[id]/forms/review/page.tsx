// Server Component - Universal review page for all form types
// Therapist reviews and completes any submitted form

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import UniversalFormReview from './UniversalFormReview'

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    formId?: string
    formType?: string
  }>
}

export default async function UniversalFormReviewPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { formId, formType } = await searchParams

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Get therapist
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { therapist: true },
  })

  if (!user?.therapist) {
    return <div>Therapist not found</div>
  }

  // Verify patient belongs to this therapist
  const patient = await prisma.patient.findFirst({
    where: {
      id: id,
      therapistId: user.therapist.id,
    },
  })

  if (!patient) {
    notFound()
  }

  // Get the form submission
  if (!formId) {
    notFound()
  }

  const formSubmission = await prisma.formSubmission.findUnique({
    where: { id: formId },
  })

  if (!formSubmission || formSubmission.patientId !== id) {
    notFound()
  }

  return (
    <UniversalFormReview
      patientId={id}
      formSubmission={formSubmission}
    />
  )
}
