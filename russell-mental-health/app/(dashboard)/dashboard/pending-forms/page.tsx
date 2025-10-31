// Pending Forms Page
// Shows all patients with forms awaiting therapist review

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const formNames: Record<string, string> = {
  'patient-information': 'Patient Information',
  'medical-history': 'Medical History',
  'mental-health-history': 'Mental Health History',
  'insurance-information': 'Insurance Information',
  'hipaa-authorization': 'HIPAA Authorization',
  'payment-information': 'Payment Information',
  'parental-consent': 'Parental Consent',
}

export default async function PendingFormsPage() {
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

  // Get all patients with pending forms (SUBMITTED status)
  const patientsWithPendingForms = await prisma.patient.findMany({
    where: {
      therapistId: user.therapist.id,
      forms: {
        some: {
          status: 'SUBMITTED',
        },
      },
    },
    include: {
      forms: {
        where: {
          status: 'SUBMITTED',
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
    orderBy: {
      lastName: 'asc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-yellow-50 p-3">
            <DocumentTextIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Forms Review</h1>
            <p className="mt-1 text-sm text-gray-600">
              {patientsWithPendingForms.length === 0
                ? 'No forms awaiting review'
                : `${patientsWithPendingForms.length} ${
                    patientsWithPendingForms.length === 1 ? 'patient has' : 'patients have'
                  } forms awaiting your review`}
            </p>
          </div>
        </div>
      </div>

      {/* Patients with Pending Forms */}
      {patientsWithPendingForms.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Pending Forms</h3>
          <p className="mt-2 text-sm text-gray-600">
            All submitted forms have been reviewed and completed.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {patientsWithPendingForms.map((patient) => (
            <div
              key={patient.id}
              className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6 shadow-sm"
            >
              {/* Patient Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
                <Link
                  href={`/dashboard/patients/${patient.id}`}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View Patient
                </Link>
              </div>

              {/* Pending Forms */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Pending Forms ({patient.forms.length}):
                </p>
                {patient.forms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between rounded-lg border border-yellow-200 bg-white p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formNames[form.formType] || form.formType}
                      </p>
                      <p className="text-xs text-gray-600" suppressHydrationWarning>
                        Submitted {new Date(form.updatedAt).toLocaleDateString()} at{' '}
                        {new Date(form.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/patients/${patient.id}/forms/review?formId=${form.id}&formType=${form.formType}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Review & Complete
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
