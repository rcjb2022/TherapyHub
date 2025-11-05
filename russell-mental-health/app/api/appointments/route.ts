/**
 * Appointments API
 *
 * GET - Fetch appointments (optionally filtered by patientId)
 * POST - Create new appointment and sync to Google Calendar
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent, generateRecurrenceRule } from '@/lib/google-calendar'

// GET /api/appointments - Fetch appointments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')

    // Build query
    const where: any = {}

    if (patientId) {
      where.patientId = patientId
    }

    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where,
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
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only therapists can create appointments
    if (session.user.role !== 'THERAPIST' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const {
      patientId,
      therapistId,
      startTime,
      endTime,
      duration,
      appointmentType,
      sessionType,
      cptCode,
      notes,
      isRecurring,
      recurringPattern,
    } = body

    // Validation
    if (!patientId || !therapistId || !startTime || !endTime || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Get therapist details
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }

    // Prepare Google Calendar event data
    const eventSummary = `${patient.firstName} ${patient.lastName} - ${appointmentType.replace(/_/g, ' ')}`
    const eventDescription = `Appointment with ${therapist.user.name}\n\nType: ${appointmentType}\nSession: ${sessionType}\nCPT Code: ${cptCode || 'N/A'}\n\n${notes || ''}`

    const startDateTime = new Date(startTime)
    const endDateTime = new Date(endTime)

    // Generate recurrence rule if recurring
    let recurrence: string[] | undefined
    if (isRecurring && recurringPattern && recurringPattern !== 'none') {
      recurrence = generateRecurrenceRule(recurringPattern, startDateTime)
    }

    // Create event in Google Calendar
    // Note: Service accounts can't send invites without Domain-Wide Delegation
    // Patient will see appointments in the app instead
    const { eventId, meetLink } = await createCalendarEvent({
      summary: eventSummary,
      description: eventDescription,
      startTime: startDateTime,
      endTime: endDateTime,
      attendees: [], // Can't invite with service account (would need Domain-Wide Delegation)
      recurrence,
    })

    // Create appointment in database
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        therapistId,
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
        appointmentType,
        sessionType,
        cptCode: cptCode || null,
        notes: notes || null,
        status: 'SCHEDULED',
        googleEventId: eventId,
        googleMeetLink: meetLink,
        isRecurring: isRecurring || false,
        recurringEventId: isRecurring ? eventId : null,
      },
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

    console.log('✅ Appointment created:', {
      id: appointment.id,
      patient: `${patient.firstName} ${patient.lastName}`,
      therapist: therapist.user.name,
      time: startDateTime.toLocaleString(),
      googleEventId: eventId,
      meetLink,
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Failed to create appointment:', error)

    return NextResponse.json(
      {
        error: 'Failed to create appointment',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
