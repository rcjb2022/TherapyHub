/**
 * Video Session Page
 *
 * Handles video sessions with authorization and timing checks
 * - Verifies user is authorized (therapist OR patient for THIS appointment)
 * - Fetches appointment details
 * - Passes to client component for rendering
 * - Shows waiting room if too early
 * - Shows Google Meet integration if in session window
 * - Shows "Session ended" message if past end time
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { VideoSessionClient } from '@/components/VideoSessionClient'

interface VideoSessionPageProps {
  params: Promise<{
    appointmentId: string
  }>
}

export default async function VideoSessionPage({ params }: VideoSessionPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const { appointmentId } = await params

  // Fetch appointment with patient and therapist details
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userId: true,
        },
      },
      therapist: {
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!appointment) {
    notFound()
  }

  // Authorization check: User must be either:
  // 1. The therapist for this appointment
  // 2. The patient for this appointment
  const isTherapist = session.user.role === 'THERAPIST' &&
                     session.user.therapist?.id === appointment.therapistId
  const isPatient = session.user.role === 'PATIENT' &&
                   appointment.patient.userId === session.user.id

  if (!isTherapist && !isPatient) {
    // Unauthorized - redirect to dashboard
    redirect('/dashboard')
  }

  // Check if appointment is cancelled
  if (appointment.status === 'CANCELLED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            This appointment has been cancelled. Please contact your therapist to reschedule.
          </p>
          <a
            href="/dashboard"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Check if appointment has a Google Meet link
  if (!appointment.googleMeetLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Video Link Available</h1>
          <p className="text-gray-600 mb-6">
            This appointment doesn't have a video link yet. Please contact your therapist.
          </p>
          <a
            href="/dashboard"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Prepare appointment data for client component
  const appointmentData = {
    id: appointment.id,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    duration: appointment.duration,
    appointmentType: appointment.appointmentType,
    sessionType: appointment.sessionType,
    googleMeetLink: appointment.googleMeetLink,
    status: appointment.status,
    patient: {
      firstName: appointment.patient.firstName,
      lastName: appointment.patient.lastName,
    },
    therapist: {
      name: appointment.therapist.user.name,
    },
  }

  const userRole = session.user.role

  return <VideoSessionClient appointment={appointmentData} userRole={userRole} />
}
