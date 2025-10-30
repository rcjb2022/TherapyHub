// Patient Detail Page
// View full patient information and history

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
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
      id: params.id,
      therapistId: user.therapist.id,
    },
    include: {
      appointments: {
        orderBy: { startTime: 'desc' },
        take: 5,
      },
      clinicalNotes: {
        orderBy: { sessionDate: 'desc' },
        take: 5,
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

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
            href={`/dashboard/patients/${patient.id}/edit`}
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
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Appointments */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Appointments</h2>
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

          {/* Documents */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Documents</h2>
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
