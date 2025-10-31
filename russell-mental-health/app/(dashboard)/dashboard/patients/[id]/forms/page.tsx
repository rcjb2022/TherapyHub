// Patient Forms Page
// Fillable forms that save data to database

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default async function PatientFormsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { therapist: true },
  })

  if (!user?.therapist) {
    return <div>Therapist not found</div>
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: id,
      therapistId: user.therapist.id,
    },
    include: {
      forms: true,
    },
  })

  if (!patient) {
    notFound()
  }

  const forms = [
    {
      id: 'patient-information',
      name: 'Patient Information',
      description: 'Basic demographic and contact information',
      type: 'patient-information',
      icon: DocumentTextIcon,
    },
    {
      id: 'medical-history',
      name: 'Medical History',
      description: 'Complete medical and mental health history',
      type: 'medical-history',
      icon: DocumentTextIcon,
    },
    {
      id: 'insurance-information',
      name: 'Insurance Information',
      description: 'Primary and secondary insurance details',
      type: 'insurance-information',
      icon: DocumentTextIcon,
    },
    {
      id: 'hipaa-authorization',
      name: 'HIPAA Authorization',
      description: 'Authorization to use and disclose health information',
      type: 'hipaa-authorization',
      icon: DocumentTextIcon,
    },
    {
      id: 'parental-consent',
      name: 'Parental Consent',
      description: 'Consent for treatment of minor (if applicable)',
      type: 'parental-consent',
      icon: DocumentTextIcon,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/patients/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Patient
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Patient Forms - {patient.firstName} {patient.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete required forms for patient onboarding and records
        </p>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => {
          const submission = patient.forms.find((f) => f.formType === form.type)
          const isComplete = submission?.status === 'SUBMITTED' || submission?.status === 'APPROVED'

          return (
            <Link
              key={form.id}
              href={`/dashboard/patients/${id}/forms/${form.id}`}
              className={`rounded-lg border p-6 transition-all hover:shadow-md ${
                isComplete
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-lg p-3 ${
                      isComplete ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <form.icon
                      className={`h-6 w-6 ${
                        isComplete ? 'text-green-600' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{form.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{form.description}</p>
                  </div>
                </div>
                {isComplete && (
                  <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-green-600" />
                )}
              </div>
              <div className="mt-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    isComplete
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {isComplete ? 'Completed' : 'Not Completed'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
