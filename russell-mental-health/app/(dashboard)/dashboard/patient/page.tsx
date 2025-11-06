// Patient Dashboard
// Shows patient's own forms, appointments, and billing

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DocumentTextIcon, CalendarIcon, VideoCameraIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const formNames: Record<string, string> = {
  'patient-information': 'Patient Information',
  'medical-history': 'Medical History',
  'mental-health-history': 'Mental Health History',
  'insurance-information': 'Insurance Information',
  'hipaa-authorization': 'HIPAA Authorization',
  'payment-information': 'Payment Information',
  'parental-consent': 'Parental Consent',
}

export default async function PatientDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only patients can access this page
  if (session.user.role !== 'PATIENT') {
    redirect('/dashboard')
  }

  // Get patient data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      patient: {
        include: {
          forms: {
            orderBy: { updatedAt: 'desc' },
          },
          therapist: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (!user?.patient) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">Patient Profile Not Found</h2>
        <p className="mt-2 text-sm text-red-700">
          Your account is not linked to a patient profile. Please contact your therapist.
        </p>
      </div>
    )
  }

  const patient = user.patient

  // Get upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      startTime: {
        gte: new Date(), // Future appointments only
      },
      status: {
        in: ['SCHEDULED', 'CONFIRMED'],
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 1, // Just get the next one
  })

  const nextAppointment = upcomingAppointments[0]
  const upcomingCount = upcomingAppointments.length

  // Separate forms by status
  const pendingForms = patient.forms.filter((f) => f.status === 'DRAFT' || f.status === 'SUBMITTED')
  const completedForms = patient.forms.filter((f) => f.status === 'COMPLETED')

  // All required forms
  const allFormTypes = [
    'patient-information',
    'medical-history',
    'mental-health-history',
    'insurance-information',
    'hipaa-authorization',
    'payment-information',
  ]

  // Add parental consent if under 18
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
  if (age < 18) {
    allFormTypes.push('parental-consent')
  }

  // Forms that haven't been started yet
  const startedFormTypes = patient.forms.map((f) => f.formType)
  const notStartedForms = allFormTypes.filter((type) => !startedFormTypes.includes(type))

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {patient.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Your therapist: {patient.therapist.user.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Forms to Complete</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {pendingForms.length + notStartedForms.length}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/appointments"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Next Appointment</p>
              {nextAppointment ? (
                <>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {new Date(nextAppointment.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(nextAppointment.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: 'America/New_York',
                    })}
                  </p>
                  <p className="mt-2 text-xs font-medium text-blue-600">
                    View Calendar →
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                  <p className="mt-2 text-xs font-medium text-blue-600">
                    No upcoming appointments
                  </p>
                </>
              )}
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Video Sessions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <VideoCameraIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/patient/billing"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className={`mt-2 text-3xl font-bold ${Number(patient.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${Number(patient.balance).toFixed(2)}
              </p>
              {Number(patient.balance) > 0 ? (
                <p className="mt-2 text-xs font-medium text-blue-600">
                  Pay Now →
                </p>
              ) : (
                <p className="mt-2 text-xs font-medium text-green-600">
                  All paid up! ✓
                </p>
              )}
            </div>
            <div className={`rounded-full p-3 ${Number(patient.balance) > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <CurrencyDollarIcon className={`h-6 w-6 ${Number(patient.balance) > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
          </div>
        </Link>
      </div>

      {/* Forms to Complete */}
      {(pendingForms.length > 0 || notStartedForms.length > 0) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Required Forms
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {pendingForms.length + notStartedForms.length} to complete
            </span>
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            Please complete the following forms before your first appointment.
          </p>

          <div className="space-y-3">
            {/* Forms not started yet */}
            {notStartedForms.map((formType) => (
              <div
                key={formType}
                className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formNames[formType] || formType}
                  </p>
                  <p className="text-xs text-gray-600">Not started</p>
                </div>
                <Link
                  href={`/dashboard/patients/${patient.id}/forms/${formType}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Start Form
                </Link>
              </div>
            ))}

            {/* Forms in progress or submitted */}
            {pendingForms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formNames[form.formType] || form.formType}
                  </p>
                  <p className="text-xs text-gray-600">
                    {form.status === 'DRAFT' ? 'In progress' : 'Submitted - awaiting review'}
                  </p>
                </div>
                <Link
                  href={`/dashboard/patients/${patient.id}/forms/${form.formType}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {form.status === 'DRAFT' ? 'Continue' : 'View'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Forms */}
      {completedForms.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Completed Forms
            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {completedForms.length}
            </span>
          </h2>
          <div className="space-y-3">
            {completedForms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formNames[form.formType] || form.formType}
                  </p>
                  <p className="text-xs text-gray-600">
                    Completed {form.completedAt ? new Date(form.completedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  ✓ Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments (placeholder) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
        <p className="text-sm text-gray-600">No upcoming appointments scheduled.</p>
      </div>
    </div>
  )
}
