/**
 * PatientAppointmentCalendar Component
 *
 * Read-only calendar view for patients
 * - Shows only the patient's appointments
 * - "Join Session" button if appointment is within 15 minutes
 * - Click appointment to see details
 */

'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventClickArg } from '@fullcalendar/core'
import { Button } from '@/components/ui/button'
import { RefreshCwIcon, VideoIcon } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
  extendedProps?: {
    therapistName?: string
    appointmentType?: string
    status?: string
    googleMeetLink?: string
    canJoin?: boolean
  }
}

interface PatientAppointmentCalendarProps {
  patientId: string
}

export function PatientAppointmentCalendar({ patientId }: PatientAppointmentCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarEvent | null>(null)

  // Fetch patient's appointments
  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments?patientId=${patientId}`)
      if (response.ok) {
        const data = await response.json()

        // Transform to calendar events
        const now = new Date()
        const calendarEvents: CalendarEvent[] = data.map((apt: any) => {
          const startTime = new Date(apt.startTime)
          const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60)
          const canJoin = minutesUntilStart <= 15 && minutesUntilStart >= -60 // 15 min before to 60 min after

          return {
            id: apt.id,
            title: `Session with ${apt.therapist.user.name}`,
            start: apt.startTime,
            end: apt.endTime,
            backgroundColor: getStatusColor(apt.status),
            borderColor: getStatusColor(apt.status),
            extendedProps: {
              therapistName: apt.therapist.user.name,
              appointmentType: apt.appointmentType,
              status: apt.status,
              googleMeetLink: apt.googleMeetLink,
              canJoin,
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

  useEffect(() => {
    fetchAppointments()
    // Refresh every minute to update "can join" status
    const interval = setInterval(fetchAppointments, 60000)
    return () => clearInterval(interval)
  }, [patientId])

  // Handle appointment click
  const handleEventClick = (arg: EventClickArg) => {
    const event: CalendarEvent = {
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.startStr,
      end: arg.event.endStr,
      backgroundColor: arg.event.backgroundColor,
      borderColor: arg.event.borderColor,
      extendedProps: arg.event.extendedProps,
    }
    setSelectedAppointment(event)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-600">
          Your scheduled appointments
        </div>

        <Button
          onClick={fetchAppointments}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          timeZone="America/New_York"
          slotMinTime="00:00:00" // 24-hour access (crisis appointments)
          slotMaxTime="24:00:00"
          allDaySlot={false}
          nowIndicator={true}
          events={events}
          eventClick={handleEventClick}
          height="100%"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
        />
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Appointment Details</h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Therapist</p>
                <p className="text-base font-medium">{selectedAppointment.extendedProps?.therapistName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="text-base font-medium">
                  {new Date(selectedAppointment.start).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-base font-medium">
                  {selectedAppointment.extendedProps?.appointmentType?.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedAppointment.extendedProps?.status || '')}`}>
                  {selectedAppointment.extendedProps?.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedAppointment.extendedProps?.canJoin && selectedAppointment.extendedProps?.googleMeetLink && (
                <Button
                  onClick={() => window.open(selectedAppointment.extendedProps?.googleMeetLink, '_blank')}
                  className="flex-1"
                >
                  <VideoIcon className="h-4 w-4 mr-2" />
                  Join Session
                </Button>
              )}
              <Button
                onClick={() => setSelectedAppointment(null)}
                variant={selectedAppointment.extendedProps?.canJoin ? 'outline' : 'default'}
                className={selectedAppointment.extendedProps?.canJoin ? '' : 'flex-1'}
              >
                Close
              </Button>
            </div>

            {!selectedAppointment.extendedProps?.canJoin && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Join button will appear 15 minutes before your appointment
              </p>
            )}
          </div>
        </div>
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
    case 'COMPLETED':
      return '#10b981' // green
    case 'CANCELLED':
      return '#9ca3af' // gray
    default:
      return '#6b7280'
  }
}

// Helper: Get badge color based on status
function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'SCHEDULED':
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
