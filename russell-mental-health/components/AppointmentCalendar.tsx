/**
 * AppointmentCalendar Component
 *
 * Full-featured calendar using FullCalendar.js
 * - Day/Week/Month views
 * - 8 AM - 8 PM visible hours
 * - 15-minute time slots
 * - Click to create appointments
 * - Drag-and-drop rescheduling
 * - Syncs with Google Calendar
 */

'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import { EventClickArg, EventDropArg } from '@fullcalendar/core'
import luxon2Plugin from '@fullcalendar/luxon2'
import { Button } from '@/components/ui/button'
import { PlusIcon, RefreshCwIcon } from 'lucide-react'
import { AppointmentModal } from './AppointmentModal'
import { AppointmentDetailsModal } from './AppointmentDetailsModal'
import { TIMEZONE } from '@/lib/appointment-utils'

// API Response types
interface AppointmentFromAPI {
  id: string
  startTime: string
  endTime: string
  status: string
  appointmentType: string
  googleMeetLink?: string | null
  patient: {
    firstName: string
    lastName: string
  }
  therapist: {
    user: {
      name: string
    }
  }
}

// Calendar event type
interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
  extendedProps?: {
    patientName?: string
    therapistName?: string
    appointmentType?: string
    status?: string
    googleMeetLink?: string
    patientId?: string
  }
}

interface AppointmentCalendarProps {
  userRole: string
}

export function AppointmentCalendar({ userRole }: AppointmentCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data: AppointmentFromAPI[] = await response.json()

        // Transform appointments to FullCalendar events
        // Pass dates as-is (ISO format with UTC timezone)
        // FullCalendar's timeZone prop will handle display conversion
        const calendarEvents: CalendarEvent[] = data.map((apt) => {
          // Add video indicator if Google Meet link exists
          const videoIndicator = apt.googleMeetLink ? ' 📹' : ''

          return {
            id: apt.id,
            title: `${apt.patient.firstName} ${apt.patient.lastName}${videoIndicator}`,
            start: apt.startTime,  // ISO string from API (UTC)
            end: apt.endTime,      // ISO string from API (UTC)
            backgroundColor: getStatusColor(apt.status),
            borderColor: getStatusColor(apt.status),
            extendedProps: {
              patientId: apt.patient.id,
              patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
              therapistName: apt.therapist.user.name,
              appointmentType: apt.appointmentType,
              status: apt.status,
              googleMeetLink: apt.googleMeetLink || undefined,
            },
          }
        })

        setEvents(calendarEvents)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load appointments on mount
  useEffect(() => {
    fetchAppointments()
  }, [])

  // Handle date click (create new appointment)
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedSlot({
      start: arg.date,
      end: new Date(arg.date.getTime() + 60 * 60 * 1000), // Default 1 hour
    })
    setShowNewAppointmentModal(true)
  }

  // Handle event click (view/edit appointment)
  const handleEventClick = (arg: EventClickArg) => {
    const appointmentId = arg.event.id
    console.log('Event clicked:', appointmentId)
    setSelectedAppointmentId(appointmentId)
    setShowDetailsModal(true)
  }

  // Handle event drag (reschedule)
  const handleEventDrop = async (arg: EventDropArg) => {
    const appointmentId = arg.event.id
    const newStart = arg.event.start
    const newEnd = arg.event.end

    if (!newStart || !newEnd) {
      alert('Invalid drop time')
      arg.revert()
      return
    }

    console.log('Event dropped:', {
      appointmentId,
      oldStart: arg.oldEvent.start,
      newStart,
      newEnd,
    })

    try {
      // Calculate duration
      const duration = Math.round((newEnd.getTime() - newStart.getTime()) / (1000 * 60))

      // Update appointment via API
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
          duration,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to reschedule appointment')
      }

      console.log('✅ Appointment rescheduled successfully')

      // Refresh calendar to sync with Google Calendar
      fetchAppointments()
    } catch (error) {
      console.error('Failed to reschedule appointment:', error)
      alert(
        `Failed to reschedule appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      // Revert the drag operation
      arg.revert()
    }
  }

  // Handle edit appointment from details modal
  const handleEditAppointment = (appointmentId: string) => {
    setEditingAppointmentId(appointmentId)
    setShowNewAppointmentModal(true)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowNewAppointmentModal(true)}
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Appointment
          </Button>

          <Button
            onClick={fetchAppointments}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Timezone notice */}
          <div className="text-xs font-medium text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            All times shown in Eastern Time (ET)
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-400"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, luxon2Plugin]}

          // Initial view
          initialView="timeGridWeek"

          // Header toolbar
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}

          // Time settings (Florida/Eastern time)
          timeZone={TIMEZONE}
          slotMinTime="00:00:00" // 12 AM (midnight) - allow crisis appointments
          slotMaxTime="24:00:00" // 12 AM next day (full 24 hours)
          slotDuration="00:15:00" // 15-minute slots
          snapDuration="00:15:00" // Snap to 15-minute increments

          // Business hours (typical hours, but appointments allowed anytime)
          businessHours={{
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Sunday - Saturday
            startTime: '08:00',
            endTime: '20:00',
          }}

          // Display settings
          allDaySlot={false} // Hide all-day row
          nowIndicator={true} // Show current time line
          navLinks={true} // Click day/week names to navigate
          editable={true} // Enable drag-and-drop
          selectable={true} // Enable date selection
          selectMirror={true} // Show mirror while selecting
          dayMaxEvents={true} // Show "more" link when too many events
          weekends={true} // Show weekends

          // Event settings
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}

          // Styling
          height="100%"
          contentHeight="auto"
          aspectRatio={1.8}

          // Time format (Eastern time - timezone is set above)
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
        />
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => {
          setShowNewAppointmentModal(false)
          setSelectedSlot(null)
          setEditingAppointmentId(null)
        }}
        onSuccess={() => {
          fetchAppointments() // Refresh calendar
        }}
        defaultStartTime={selectedSlot?.start}
        defaultEndTime={selectedSlot?.end}
        appointmentId={editingAppointmentId || undefined}
      />

      {/* Appointment Details Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailsModal
          appointmentId={selectedAppointmentId}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedAppointmentId(null)
          }}
          onEdit={handleEditAppointment}
          onRefresh={() => {
            fetchAppointments() // Refresh calendar after cancel/edit
          }}
          userRole={userRole}
        />
      )}
    </div>
  )
}

// Helper: Get color based on appointment status
function getStatusColor(status: string): string {
  switch (status) {
    case 'SCHEDULED':
    case 'CONFIRMED':
      return '#3b82f6' // blue
    case 'IN_PROGRESS':
      return '#f59e0b' // amber
    case 'COMPLETED':
      return '#10b981' // green
    case 'CANCELLED':
      return '#9ca3af' // gray
    case 'NO_SHOW':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray-500
  }
}
