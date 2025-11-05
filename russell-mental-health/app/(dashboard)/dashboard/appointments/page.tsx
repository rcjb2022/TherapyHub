/**
 * Patient Appointments Page
 * Shows patient's own appointments (read-only calendar view)
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PatientAppointmentCalendar } from '@/components/PatientAppointmentCalendar'

export const metadata = {
  title: 'My Appointments | Russell Mental Health',
  description: 'View your upcoming appointments',
}

export default async function PatientAppointmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Get patient data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      patient: {
        include: {
          therapist: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  // If patient, show patient calendar
  if (user?.patient) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-sm text-gray-600 mt-1">
                Your upcoming sessions with {user.patient.therapist?.user?.name ?? 'your therapist'}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="flex-1 overflow-hidden">
          <PatientAppointmentCalendar patientId={user.patient.id} />
        </div>
      </div>
    )
  }

  // If therapist, redirect to main calendar
  if (session.user.role === 'THERAPIST') {
    redirect('/dashboard/calendar')
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-900">Access Denied</h2>
      <p className="mt-2 text-sm text-red-700">
        Unable to load appointment information. Please contact support.
      </p>
    </div>
  )
}
