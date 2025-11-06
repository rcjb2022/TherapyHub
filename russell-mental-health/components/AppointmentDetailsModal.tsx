/**
 * AppointmentDetailsModal Component
 *
 * Displays full appointment details when clicking a calendar event
 * - Patient name (clickable link to profile)
 * - Date/time in Eastern Time
 * - Google Meet link with join/copy buttons
 * - All appointment details
 * - Edit and Cancel actions
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { TIMEZONE } from '@/lib/appointment-utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  XIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  ClipboardCopyIcon,
  CheckIcon,
  PencilIcon,
  XCircleIcon,
} from 'lucide-react'

interface AppointmentDetailsModalProps {
  appointmentId: string
  isOpen: boolean
  onClose: () => void
  onEdit: (appointmentId: string) => void
  onRefresh: () => void
}

interface AppointmentDetails {
  id: string
  patientId: string
  patient: {
    id: string
    firstName: string
    lastName: string
  }
  therapist: {
    user: {
      name: string
    }
  }
  startTime: string
  endTime: string
  duration: number
  appointmentType: string
  sessionType: string
  cptCode: string | null
  status: string
  googleMeetLink: string | null
  notes: string | null
}

export function AppointmentDetailsModal({
  appointmentId,
  isOpen,
  onClose,
  onEdit,
  onRefresh,
}: AppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch appointment details
  const fetchAppointment = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointment(data)
      } else {
        setError('Failed to load appointment details')
      }
    } catch (err) {
      console.error('Failed to fetch appointment:', err)
      setError('Failed to load appointment details')
    } finally {
      setLoading(false)
    }
  }

  // Load appointment when modal opens
  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appointmentId])

  // Cancel appointment
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    setCanceling(true)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Appointment cancelled successfully')
        onRefresh()
        onClose()
      } else {
        const data = await response.json()
        alert(`Failed to cancel appointment: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
      alert('Failed to cancel appointment')
    } finally {
      setCanceling(false)
    }
  }

  // Copy Meet link to clipboard
  const handleCopyMeetLink = async () => {
    if (!appointment?.googleMeetLink) return

    try {
      await navigator.clipboard.writeText(appointment.googleMeetLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      alert('Failed to copy link')
    }
  }

  // Format appointment type for display
  const formatAppointmentType = (type: string) => {
    return type.replace(/_/g, ' ')
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {appointment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Patient</p>
                  <Link
                    href={`/dashboard/patients/${appointment.patient.id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </Link>
                </div>
                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {format(toZonedTime(new Date(appointment.startTime), TIMEZONE), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time (Eastern)</p>
                    <p className="text-base font-medium text-gray-900">
                      {format(toZonedTime(new Date(appointment.startTime), TIMEZONE), 'h:mm a')} -{' '}
                      {format(toZonedTime(new Date(appointment.endTime), TIMEZONE), 'h:mm a')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{appointment.duration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Google Meet Link */}
              {appointment.googleMeetLink && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <VideoIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Video Session</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={appointment.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <VideoIcon className="h-4 w-4 mr-2" />
                        Join Video Session
                      </Button>
                    </a>
                    <Button
                      onClick={handleCopyMeetLink}
                      variant="outline"
                      className="sm:w-auto"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardCopyIcon className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatAppointmentType(appointment.appointmentType)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Session</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatAppointmentType(appointment.sessionType)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">CPT Code</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {appointment.cptCode || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Therapist</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {appointment.therapist.user.name}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {appointment && appointment.status === 'SCHEDULED' && (
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={() => {
                onEdit(appointmentId)
                onClose()
              }}
              variant="outline"
              className="sm:w-auto"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Appointment
            </Button>
            <Button
              onClick={handleCancel}
              disabled={canceling}
              variant="destructive"
              className="sm:w-auto"
            >
              {canceling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
