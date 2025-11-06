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
import luxon2Plugin from '@fullcalendar/luxon2'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RefreshCwIcon, VideoIcon } from 'lucide-react'
import { TIMEZONE } from '@/lib/appointment-utils'

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
        // Pass dates as-is (ISO format with UTC timezone)
        // FullCalendar's timeZone prop will handle display conversion
        const now = new Date()
        const calendarEvents: CalendarEvent[] = data.map((apt: any) => {
          const startTime = new Date(apt.startTime)
          const endTime = new Date(apt.endTime)
          const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60)
          const minutesAfterEnd = (now.getTime() - endTime.getTime()) / (1000 * 60)
          // Can join: 30 minutes before start → end time
          const canJoin = minutesUntilStart <= 30 && minutesAfterEnd < 0

          return {
            id: apt.id,
            title: `Session with ${apt.therapist.user.name}`,
            start: apt.startTime,  // ISO string from API (UTC)
            end: apt.endTime,      // ISO string from API (UTC)
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
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Your scheduled appointments
          </div>
          <div className="text-xs font-medium text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            All times shown in Eastern Time (ET)
          </div>
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
          plugins={[dayGridPlugin, timeGridPlugin, luxon2Plugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          timeZone={TIMEZONE}
          slotMinTime="00:00:00" // 24-hour access (crisis appointments)
          slotMaxTime="24:00:00"
          allDaySlot={false}
          nowIndicator={true}
          events={events}
          eventClick={handleEventClick}
          height="100%"
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

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Details</h2>

            <div className="space-y-4 mb-8">
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Therapist</p>
                <p className="text-lg font-semibold text-gray-900">{selectedAppointment.extendedProps?.therapistName}</p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Date & Time</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(selectedAppointment.start).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {new Date(selectedAppointment.start).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/New_York',
                  })} ET
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedAppointment.extendedProps?.appointmentType?.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedAppointment.extendedProps?.status || '')}`}>
                    {selectedAppointment.extendedProps?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedAppointment.extendedProps?.canJoin && selectedAppointment.extendedProps?.googleMeetLink ? (
              <div className="space-y-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold">
                  <Link href={`/dashboard/video-session/${selectedAppointment.id}`}>
                    <VideoIcon className="h-5 w-5 mr-2" />
                    Join Session
                  </Link>
                </Button>
                <Button
                  onClick={() => setSelectedAppointment(null)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Join button will appear 30 minutes before your appointment
                </p>
              </div>
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
