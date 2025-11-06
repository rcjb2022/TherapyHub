// Patient Detail Page
// View full patient information and history

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, FolderIcon } from '@heroicons/react/24/outline'
import { ChargeCardForm } from '@/components/ChargeCardForm'

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await params (Next.js 15+ requirement)
  const { id } = await params

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

  // Fetch patient
  const patient = await prisma.patient.findFirst({
    where: {
      id: id,
      therapistId: user.therapist.id,
    },
    include: {
      insurancePrimary: true,
      insuranceSecondary: true,
      forms: {
        orderBy: { createdAt: 'desc' },
      },
      appointments: {
        orderBy: { startTime: 'desc' },
        take: 10, // Show last 10 appointments
      },
      clinicalNotes: {
        orderBy: { sessionDate: 'desc' },
        take: 5,
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  // Get total appointment count for this patient
  const totalAppointmentCount = await prisma.appointment.count({
    where: {
      patientId: id,
    },
  })

  // Get pending forms (SUBMITTED status)
  const pendingForms = patient?.forms.filter((f) => f.status === 'SUBMITTED') || []

  // Get payment method from payment-information form
  const paymentForm = patient?.forms.find((f) => f.formType === 'payment-information')
  const paymentMethodData = paymentForm?.formData as any
  const hasPaymentMethod = paymentMethodData?.stripePaymentMethodId && paymentMethodData?.cardLast4

  if (!patient) {
    notFound()
  }

  const address = patient.address as any
  const calculateAge = (dob: Date) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/patients"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Patients
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Age {calculateAge(patient.dateOfBirth)} • {patient.status}
            </p>
          </div>
          <Link
            href={`/dashboard/patients/${id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Patient
          </Link>
        </div>
      </div>

      {/* Patient Information Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
              </div>
              {patient.phone && (
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-sm text-gray-600">{patient.phone}</p>
                  </div>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-sm text-gray-600">
                      {address.street && `${address.street}`}
                      {address.city && (
                        <>
                          <br />
                          {address.city}, {address.state} {address.zip}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Card */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Patient Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    patient.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : patient.status === 'INACTIVE'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Onboarding</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    patient.onboardingComplete
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {patient.onboardingComplete ? 'Complete' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Insurance Information</h2>
            {patient.insurancePrimary ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Primary Insurance</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{patient.insurancePrimary.payerName}</p>
                  <p className="text-xs text-gray-600">Member ID: {patient.insurancePrimary.memberId}</p>
                  {patient.insurancePrimary.groupNumber && (
                    <p className="text-xs text-gray-600">Group: {patient.insurancePrimary.groupNumber}</p>
                  )}
                </div>
                {patient.insuranceSecondary && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium uppercase text-gray-500">Secondary Insurance</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{patient.insuranceSecondary.payerName}</p>
                    <p className="text-xs text-gray-600">Member ID: {patient.insuranceSecondary.memberId}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No insurance information on file</p>
            )}
          </div>

          {/* Payment Information */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Information</h2>

            {/* Card on File */}
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              {hasPaymentMethod ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">💳 Card on File</p>
                    <p className="text-sm text-gray-600">
                      •••• •••• •••• {paymentMethodData.cardLast4}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires {paymentMethodData.cardExpMonth}/{paymentMethodData.cardExpYear}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/patients/${id}/forms/payment-information`}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Update
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">No payment method on file</p>
                  <Link
                    href={`/dashboard/patients/${id}/forms/payment-information`}
                    className="inline-block text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Add payment method
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            {patient.payments && patient.payments.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Recent Payments</p>
                  <div className="mt-2 space-y-2">
                    {patient.payments.slice(0, 3).map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-gray-900">
                          ${(payment.amount / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">No payments on record</p>
              </div>
            )}
          </div>

          {/* Billing Section */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Billing</h2>

            {/* Outstanding Balance */}
            <div className="mb-4 rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm font-medium text-gray-700">Outstanding Balance</p>
              <p className={`text-3xl font-bold ${Number(patient.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${Number(patient.balance).toFixed(2)}
              </p>
            </div>

            {/* Charge Card Form */}
            {hasPaymentMethod ? (
              <ChargeCardForm
                patientId={patient.id}
                currentBalance={Number(patient.balance.toString())}
                cardLast4={paymentMethodData.cardLast4}
              />
            ) : (
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Patient must add a payment method before charges can be processed.
                </p>
                <Link
                  href={`/dashboard/patients/${id}/forms/payment-information`}
                  className="inline-block text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Add payment method
                </Link>
              </div>
            )}
          </div>

          {/* Documents Library */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documents Library</h2>
              <FolderIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              View all uploaded documents including insurance cards, ID photos, and legal documents.
            </p>
            <Link
              href={`/dashboard/patients/${id}/documents`}
              className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              View Documents Library
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Forms Review */}
          {pendingForms.length > 0 && (
            <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Forms Review
                  <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    {pendingForms.length}
                  </span>
                </h2>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                The following forms have been submitted by the patient and are awaiting your review and completion.
              </p>
              <div className="space-y-3">
                {pendingForms.map((form) => {
                  const formNames: Record<string, string> = {
                    'patient-information': 'Patient Information',
                    'medical-history': 'Medical History',
                    'mental-health-history': 'Mental Health History',
                    'insurance-information': 'Insurance Information',
                    'hipaa-authorization': 'HIPAA Authorization',
                    'payment-information': 'Payment Information',
                    'parental-consent': 'Parental Consent',
                  }

                  return (
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
                          {new Date(form.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/patients/${id}/forms/review?formId=${form.id}&formType=${form.formType}`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        Review & Complete
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Appointments */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
              {totalAppointmentCount > patient.appointments.length && (
                <span className="text-xs text-gray-500">
                  Showing last {patient.appointments.length} of {totalAppointmentCount} total
                </span>
              )}
            </div>
            {patient.appointments.length > 0 ? (
              <div className="space-y-3">
                {patient.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between border-l-4 border-blue-500 bg-blue-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.appointmentType}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(apt.startTime).toLocaleDateString()} at{' '}
                        {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        apt.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : apt.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No appointments yet</p>
            )}
            {totalAppointmentCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  All {totalAppointmentCount} appointment{totalAppointmentCount !== 1 ? 's' : ''} are recorded in the system for compliance.
                </p>
              </div>
            )}
          </div>

          {/* Clinical Notes */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Clinical Notes</h2>
            {patient.clinicalNotes.length > 0 ? (
              <div className="space-y-3">
                {patient.clinicalNotes.map((note) => (
                  <div key={note.id} className="border-l-4 border-purple-500 bg-purple-50 p-3">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(note.sessionDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">CPT: {note.cptCode || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No clinical notes yet</p>
            )}
          </div>

          {/* Required Documents Checklist */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Required Documents</h2>
            <div className="space-y-3">
              {[
                { name: 'Patient Information', type: 'INTAKE_FORM' },
                { name: 'Patient Medical History', type: 'INTAKE_FORM' },
                { name: 'Patient Insurance Information', type: 'INSURANCE_CARD' },
                { name: 'Patient HIPAA Authorization', type: 'CONSENT_FORM' },
                { name: 'Parental Consent (if applicable)', type: 'CONSENT_FORM' },
              ].map((requiredDoc, index) => {
                const hasDoc = patient.documents.some(
                  (doc) => doc.type === requiredDoc.type && doc.name.toLowerCase().includes(requiredDoc.name.toLowerCase().split(' ')[1])
                )
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      hasDoc
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          hasDoc
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {hasDoc && (
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${hasDoc ? 'text-green-900' : 'text-gray-900'}`}>
                          {requiredDoc.name}
                        </p>
                        <p className="text-xs text-gray-600">{requiredDoc.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {hasDoc ? (
                      <span className="text-xs font-medium text-green-600">Completed</span>
                    ) : (
                      <Link
                        href={`/dashboard/patients/${id}/forms`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Complete Form
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* All Documents */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">All Documents</h2>
            {patient.documents.length > 0 ? (
              <div className="space-y-3">
                {patient.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border-l-4 border-gray-500 bg-gray-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-600">{doc.type}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No documents uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
