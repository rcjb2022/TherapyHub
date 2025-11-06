/**
 * Individual Appointment API
 *
 * GET - Fetch single appointment details
 * PATCH - Update appointment and sync to Google Calendar
 * DELETE - Cancel appointment and remove from Google Calendar
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'

// GET /api/appointments/[id] - Fetch appointment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Authorization check
    // Therapists can view their patients' appointments
    // Patients can view their own appointments
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        therapist: true,
        patient: true,
      },
    })

    const isTherapist = user?.role === 'THERAPIST' && user.therapist?.id === appointment.therapistId
    const isPatient = user?.role === 'PATIENT' && user.patient?.id === appointment.patientId

    if (!isTherapist && !isPatient && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Failed to fetch appointment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

// PATCH /api/appointments/[id] - Update appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can update appointments
    if (session.user.role !== 'THERAPIST' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Fetch existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        therapist: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Extract update fields
    const {
      startTime,
      endTime,
      duration,
      appointmentType,
      sessionType,
      cptCode,
      notes,
      status,
    } = body

    // Prepare database update
    const updateData: Partial<import('@prisma/client').Appointment> = {}
    if (startTime !== undefined) updateData.startTime = new Date(startTime)
    if (endTime !== undefined) updateData.endTime = new Date(endTime)
    if (duration !== undefined) updateData.duration = duration
    if (appointmentType !== undefined) updateData.appointmentType = appointmentType
    if (sessionType !== undefined) updateData.sessionType = sessionType
    if (cptCode !== undefined) updateData.cptCode = cptCode
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) updateData.status = status

    // Update in database
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Update in Google Calendar if time changed
    if (existingAppointment.googleEventId && (startTime || endTime)) {
      try {
        const eventSummary = `${updatedAppointment.patient.firstName} ${updatedAppointment.patient.lastName} - ${updatedAppointment.appointmentType.replace(/_/g, ' ')}`
        const eventDescription = `Appointment with ${updatedAppointment.therapist.user.name}\n\nType: ${updatedAppointment.appointmentType}\nSession: ${updatedAppointment.sessionType}\nCPT Code: ${updatedAppointment.cptCode || 'N/A'}\n\n${updatedAppointment.notes || ''}`

        await updateCalendarEvent(existingAppointment.googleEventId, {
          summary: eventSummary,
          description: eventDescription,
          startTime: updatedAppointment.startTime,
          endTime: updatedAppointment.endTime,
          attendees: [updatedAppointment.patient.email],
        })

        console.log('✅ Google Calendar event updated:', existingAppointment.googleEventId)
      } catch (error) {
        console.error('⚠️ Failed to update Google Calendar event:', error)
        // Don't fail the entire request if Google Calendar update fails
        // The database is already updated
      }
    }

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Failed to update appointment:', error)
    return NextResponse.json(
      {
        error: 'Failed to update appointment',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can cancel appointments
    if (session.user.role !== 'THERAPIST' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Fetch existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Update status to CANCELLED instead of deleting
    // (Preserve appointment history)
    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: 'Cancelled by therapist',
      },
    })

    // Remove from Google Calendar
    if (existingAppointment.googleEventId) {
      try {
        await deleteCalendarEvent(existingAppointment.googleEventId)
        console.log('✅ Google Calendar event deleted:', existingAppointment.googleEventId)
      } catch (error) {
        console.error('⚠️ Failed to delete Google Calendar event:', error)
        // Don't fail the entire request if Google Calendar deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: cancelledAppointment,
    })
  } catch (error) {
    console.error('Failed to cancel appointment:', error)
    return NextResponse.json(
      {
        error: 'Failed to cancel appointment',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
