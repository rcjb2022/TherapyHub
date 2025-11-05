/**
 * Test Google Calendar API Connection
 *
 * Visit: http://localhost:3000/api/test-calendar
 *
 * This endpoint tests if we can successfully connect to Google Calendar
 * and list events from Dr. Bethany's calendar.
 */

import { NextResponse } from 'next/server'
import { listCalendarEvents } from '@/lib/google-calendar'

export async function GET() {
  try {
    // Try to list events from the past 7 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    console.log('Testing Google Calendar API connection...')
    console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID)
    console.log('Date range:', startDate, 'to', endDate)

    const events = await listCalendarEvents(startDate, endDate)

    return NextResponse.json({
      success: true,
      message: 'Google Calendar API connection successful!',
      eventCount: events.length,
      events: events,
      calendarId: process.env.GOOGLE_CALENDAR_ID,
    })
  } catch (error) {
    console.error('Google Calendar API test failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
