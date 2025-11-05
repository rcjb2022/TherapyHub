/**
 * Calendar Page - Appointment Scheduling
 *
 * Features:
 * - Day/Week/Month views
 * - Create/edit/delete appointments
 * - Sync with Google Calendar
 * - Drag-and-drop rescheduling
 * - Recurring appointment support
 */

import { Metadata } from 'next'
import { AppointmentCalendar } from '@/components/AppointmentCalendar'

export const metadata: Metadata = {
  title: 'Calendar | Russell Mental Health',
  description: 'Appointment scheduling and calendar management',
}

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage appointments and schedule sessions
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="flex-1 overflow-hidden">
        <AppointmentCalendar />
      </div>
    </div>
  )
}
