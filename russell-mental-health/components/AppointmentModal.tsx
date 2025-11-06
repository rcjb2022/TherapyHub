/**
 * AppointmentModal Component
 *
 * Modal form for creating and editing appointments
 * - Select patient and therapist
 * - Choose date, time, and duration
 * - Set appointment type and CPT code
 * - Add notes
 * - Configure recurring appointments (optional)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { fromZonedTime } from 'date-fns-tz'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  APPOINTMENT_TYPES,
  SESSION_TYPES,
  CPT_CODES,
  DURATIONS,
  RECURRING_PATTERNS,
  TIMEZONE,
  calculateEndTime,
  formatTime,
  validateAppointmentTime,
  roundToNearestQuarterHour,
  getRecurringEndDate,
} from '@/lib/appointment-utils'
import { XIcon } from 'lucide-react'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultStartTime?: Date
  defaultEndTime?: Date
  appointmentId?: string // Optional - if provided, we're in edit mode
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Therapist {
  id: string
  userId: string
  user: {
    name: string
    email: string
  }
}

export function AppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  defaultStartTime,
  defaultEndTime,
  appointmentId,
}: AppointmentModalProps) {
  // Form state
  const [patients, setPatients] = useState<Patient[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAppointment, setLoadingAppointment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track edit mode
  const isEditMode = !!appointmentId

  // Form fields
  const [patientId, setPatientId] = useState('')
  const [therapistId, setTherapistId] = useState('')
  const [appointmentType, setAppointmentType] = useState('THERAPY_SESSION')
  const [sessionType, setSessionType] = useState('INDIVIDUAL')
  const [cptCode, setCptCode] = useState('90837')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [recurringPattern, setRecurringPattern] = useState('none')

  // Fetch existing appointment data (for edit mode)
  const fetchAppointmentData = useCallback(async (id: string) => {
    setLoadingAppointment(true)
    try {
      const response = await fetch(`/api/appointments/${id}`)
      if (response.ok) {
        const apt = await response.json()

        // Pre-populate form fields
        setPatientId(apt.patientId)
        setTherapistId(apt.therapistId)
        setAppointmentType(apt.appointmentType)
        setSessionType(apt.sessionType)
        setCptCode(apt.cptCode || '90837')
        setDuration(apt.duration)
        setNotes(apt.notes || '')

        // Parse start time from UTC to Eastern for display
        const start = new Date(apt.startTime)
        setStartDate(start.toISOString().split('T')[0])
        setStartTime(start.toTimeString().slice(0, 5))

        // Note: We don't support editing recurring appointments yet
        setRecurringPattern('none')
      } else {
        setError('Failed to load appointment data')
      }
    } catch (err) {
      console.error('Failed to fetch appointment:', err)
      setError('Failed to load appointment data')
    } finally {
      setLoadingAppointment(false)
    }
  }, [])

  // Fetch patients and therapists
  const fetchPatientsAndTherapists = useCallback(async () => {
    try {
      const [patientsRes, therapistsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/therapists'),
      ])

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData)
      }

      if (therapistsRes.ok) {
        const therapistsData = await therapistsRes.json()
        setTherapists(therapistsData)

        // Set default therapist (Dr. Bethany)
        if (therapistsData.length > 0) {
          setTherapistId(therapistsData[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load patients/therapists:', err)
    }
  }, [])

  // Load patients and therapists (and appointment data if editing)
  useEffect(() => {
    if (isOpen) {
      fetchPatientsAndTherapists()

      // If editing, load appointment data
      if (isEditMode && appointmentId) {
        fetchAppointmentData(appointmentId)
      } else {
        // Set default start time if provided
        if (defaultStartTime) {
          const rounded = roundToNearestQuarterHour(defaultStartTime)
          setStartDate(rounded.toISOString().split('T')[0])
          setStartTime(rounded.toTimeString().slice(0, 5))
        } else {
          // Default to next hour
          const next = roundToNearestQuarterHour(new Date(Date.now() + 60 * 60 * 1000))
          setStartDate(next.toISOString().split('T')[0])
          setStartTime(next.toTimeString().slice(0, 5))
        }
      }
    }
  }, [isOpen, defaultStartTime, isEditMode, appointmentId, fetchAppointmentData, fetchPatientsAndTherapists])

  // Handle appointment type change
  const handleTypeChange = (type: string) => {
    setAppointmentType(type)

    // Auto-set duration and CPT code based on type
    const typeDetails = APPOINTMENT_TYPES.find((t) => t.value === type)
    if (typeDetails) {
      setDuration(typeDetails.defaultDuration)
      setCptCode(typeDetails.defaultCPT)
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!patientId) {
      setError('Please select a patient')
      return
    }

    if (!therapistId) {
      setError('Please select a therapist')
      return
    }

    // Parse start time in Eastern timezone (America/New_York)
    // CRITICAL: The HTML datetime-local input gives us date/time WITHOUT timezone info
    // We must explicitly treat this as Eastern time, regardless of user's browser timezone
    // Using date-fns-tz fromZonedTime to properly handle DST transitions
    const startDateTime = fromZonedTime(`${startDate}T${startTime}`, TIMEZONE)

    // Validate appointment time
    const validation = validateAppointmentTime(startDateTime, duration)
    if (!validation.valid) {
      setError(validation.error || 'Invalid appointment time')
      return
    }

    // Prepare data
    const appointmentData = {
      patientId,
      therapistId,
      startTime: startDateTime.toISOString(),
      endTime: calculateEndTime(startDateTime, duration).toISOString(),
      duration,
      appointmentType,
      sessionType,
      cptCode,
      notes: notes || null,
      isRecurring: recurringPattern !== 'none',
      recurringPattern: recurringPattern !== 'none' ? recurringPattern : null,
    }

    setLoading(true)

    try {
      // Use PATCH for edit mode, POST for create mode
      const url = isEditMode ? `/api/appointments/${appointmentId}` : '/api/appointments'
      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || `Failed to ${isEditMode ? 'update' : 'create'} appointment`)
      }

      // Success!
      onSuccess()
      onClose()

      // Reset form
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} appointment`)
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setPatientId('')
    setAppointmentType('THERAPY_SESSION')
    setSessionType('INDIVIDUAL')
    setCptCode('90837')
    setDuration(60)
    setNotes('')
    setRecurringPattern('none')
    setError(null)
  }

  if (!isOpen) return null

  // Generate 15-minute interval time options (00:00 to 23:45)
  const timeOptions: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeOptions.push(time)
    }
  }

  // Calculate end time for display (in Eastern time)
  let endTimeDisplay = ''
  if (startDate && startTime) {
    const start = fromZonedTime(`${startDate}T${startTime}`, TIMEZONE)
    const end = calculateEndTime(start, duration)
    endTimeDisplay = formatTime(end)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditMode ? 'Edit Appointment' : 'New Appointment'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loading appointment data */}
            {loadingAppointment && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-gray-600">Loading appointment...</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Therapist Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Therapist *
              </label>
              <select
                value={therapistId}
                onChange={(e) => setTherapistId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a therapist...</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type *
              </label>
              <select
                value={appointmentType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {APPOINTMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SESSION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time * <span className="text-xs text-gray-500 font-normal">(Eastern Time)</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select time...</option>
                  {timeOptions.map((time) => {
                    // Format time for display (e.g., "09:00" -> "9:00 AM")
                    const [hour, minute] = time.split(':')
                    const hourNum = parseInt(hour)
                    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
                    const ampm = hourNum >= 12 ? 'PM' : 'AM'
                    const displayTime = `${displayHour}:${minute} ${ampm}`

                    return (
                      <option key={time} value={time}>
                        {displayTime}
                      </option>
                    )
                  })}
                </select>
                {endTimeDisplay && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ends at {endTimeDisplay}
                  </p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* CPT Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPT Code
              </label>
              <select
                value={cptCode}
                onChange={(e) => setCptCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CPT_CODES.map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.code} - {code.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurring Pattern */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat
              </label>
              <select
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RECURRING_PATTERNS.map((pattern) => (
                  <option key={pattern.value} value={pattern.value}>
                    {pattern.label}
                  </option>
                ))}
              </select>
              {recurringPattern !== 'none' && (
                <p className="text-xs text-gray-500 mt-1">
                  Will repeat for up to 90 days
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes about this appointment..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading
                  ? (isEditMode ? 'Saving...' : 'Creating...')
                  : (isEditMode ? 'Save Changes' : 'Create Appointment')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
