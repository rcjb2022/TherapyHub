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

import { useState, useEffect } from 'react'
import { fromZonedTime } from 'date-fns-tz'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  APPOINTMENT_TYPES,
  SESSION_TYPES,
  CPT_CODES,
  DURATIONS,
  RECURRING_PATTERNS,
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
}: AppointmentModalProps) {
  // Form state
  const [patients, setPatients] = useState<Patient[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Load patients and therapists
  useEffect(() => {
    if (isOpen) {
      fetchPatientsAndTherapists()

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
  }, [isOpen, defaultStartTime])

  // Fetch patients and therapists
  const fetchPatientsAndTherapists = async () => {
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
  }

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
    const timeZone = 'America/New_York'
    const startDateTime = fromZonedTime(`${startDate}T${startTime}`, timeZone)

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
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create appointment')
      }

      // Success!
      onSuccess()
      onClose()

      // Reset form
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment')
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

  // Calculate end time for display
  let endTimeDisplay = ''
  if (startDate && startTime) {
    const start = new Date(`${startDate}T${startTime}`)
    const end = calculateEndTime(start, duration)
    endTimeDisplay = formatTime(end)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">New Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  Start Time *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  step="900"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Appointment'}
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
