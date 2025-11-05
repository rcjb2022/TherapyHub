/**
 * Appointment Utilities
 *
 * CPT codes, appointment types, durations, and validation helpers
 */

// CPT Codes for mental health services
export const CPT_CODES = [
  {
    code: '90791',
    description: 'Psychiatric Diagnostic Evaluation',
    duration: 60,
    category: 'initial',
  },
  {
    code: '90832',
    description: 'Psychotherapy, 30 minutes',
    duration: 30,
    category: 'therapy',
  },
  {
    code: '90834',
    description: 'Psychotherapy, 45 minutes',
    duration: 45,
    category: 'therapy',
  },
  {
    code: '90837',
    description: 'Psychotherapy, 60 minutes',
    duration: 60,
    category: 'therapy',
  },
  {
    code: '90846',
    description: 'Family Psychotherapy (without patient)',
    duration: 50,
    category: 'family',
  },
  {
    code: '90847',
    description: 'Family Psychotherapy (with patient)',
    duration: 50,
    category: 'family',
  },
  {
    code: '90853',
    description: 'Group Psychotherapy',
    duration: 60,
    category: 'group',
  },
  {
    code: '96130',
    description: 'Psychological Testing Evaluation (first hour)',
    duration: 60,
    category: 'assessment',
  },
  {
    code: '96131',
    description: 'Psychological Testing Evaluation (additional hour)',
    duration: 60,
    category: 'assessment',
  },
] as const

// Appointment Types
export const APPOINTMENT_TYPES = [
  { value: 'INITIAL_CONSULTATION', label: 'Initial Consultation', defaultDuration: 60, defaultCPT: '90791' },
  { value: 'THERAPY_SESSION', label: 'Therapy Session', defaultDuration: 60, defaultCPT: '90837' },
  { value: 'FOLLOW_UP', label: 'Follow-up', defaultDuration: 60, defaultCPT: '90837' },
  { value: 'ASD_ASSESSMENT', label: 'ASD Assessment', defaultDuration: 120, defaultCPT: '96130' },
  { value: 'IMMIGRATION_EVALUATION', label: 'Immigration Evaluation', defaultDuration: 90, defaultCPT: '96130' },
  { value: 'COURT_EVALUATION', label: 'Court Evaluation', defaultDuration: 90, defaultCPT: '96130' },
] as const

// Session Types
export const SESSION_TYPES = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'COUPLES', label: 'Couples' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'GROUP', label: 'Group' },
] as const

// Duration options (in minutes)
export const DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
] as const

// Recurring patterns
export const RECURRING_PATTERNS = [
  { value: 'none', label: 'One-time appointment' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
] as const

// Get CPT code details by code
export function getCPTDetails(code: string) {
  return CPT_CODES.find((c) => c.code === code)
}

// Get appointment type details by value
export function getAppointmentTypeDetails(value: string) {
  return APPOINTMENT_TYPES.find((t) => t.value === value)
}

// Calculate end time based on start time and duration
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + durationMinutes)
  return endTime
}

// Format time for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Check if time slot is during business hours (8 AM - 8 PM)
export function isBusinessHours(time: Date): boolean {
  const hours = time.getHours()
  return hours >= 8 && hours < 20
}

// Round time to nearest 15 minutes
export function roundToNearestQuarterHour(date: Date): Date {
  const rounded = new Date(date)
  const minutes = rounded.getMinutes()
  const roundedMinutes = Math.round(minutes / 15) * 15
  rounded.setMinutes(roundedMinutes)
  rounded.setSeconds(0)
  rounded.setMilliseconds(0)
  return rounded
}

// Validate appointment time
export function validateAppointmentTime(startTime: Date, duration: number): { valid: boolean; error?: string } {
  // Check if start time is in the past
  if (startTime < new Date()) {
    return { valid: false, error: 'Appointment cannot be scheduled in the past' }
  }

  // Allow appointments at ANY time (including outside normal hours for crisis situations)
  return { valid: true }
}

// Get recurring end date (max 90 days from start)
export function getRecurringEndDate(startDate: Date, maxDays: number = 90): Date {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + maxDays)
  return endDate
}
