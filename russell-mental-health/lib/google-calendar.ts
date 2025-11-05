/**
 * Google Calendar API Integration
 * Handles all interactions with Google Calendar for appointment scheduling
 *
 * Features:
 * - Create appointments with Google Meet links
 * - Update and delete appointments
 * - Handle recurring appointments (max 90 days)
 * - Sync with DrBethany@RussellMentalHealth.com calendar
 * - Conflict detection
 */

import { google, calendar_v3 } from 'googleapis'
import fs from 'fs'

// Initialize Google Calendar client
function getCalendarClient(): calendar_v3.Calendar {
  let auth

  // Try Service Account first (preferred method)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    // Service account credentials from JSON string
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)

    // Use domain-wide delegation to impersonate the calendar owner
    const calendarEmail = process.env.GOOGLE_CALENDAR_ID || 'drbethany@russellmentalhealth.com'

    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      clientOptions: {
        subject: calendarEmail, // Impersonate this user (Domain-Wide Delegation)
      },
    })
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    // Service account credentials from file path
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
    if (fs.existsSync(keyPath)) {
      const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf-8'))

      // Use domain-wide delegation to impersonate the calendar owner
      const calendarEmail = process.env.GOOGLE_CALENDAR_ID || 'drbethany@russellmentalhealth.com'

      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ],
        clientOptions: {
          subject: calendarEmail, // Impersonate this user (Domain-Wide Delegation)
        },
      })
    } else {
      throw new Error(`Service account key file not found at: ${keyPath}`)
    }
  } else if (process.env.GOOGLE_REFRESH_TOKEN) {
    // Fallback to OAuth2 if refresh token is available
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
    auth = oauth2Client
  } else {
    throw new Error(
      'No Google Calendar authentication configured. ' +
        'Please set either GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SERVICE_ACCOUNT_KEY_PATH, ' +
        'or GOOGLE_REFRESH_TOKEN in your environment variables.'
    )
  }

  const calendar = google.calendar({ version: 'v3', auth })
  return calendar
}

// Types
export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  startTime: Date
  endTime: Date
  attendees?: string[]
  recurrence?: string[]
  meetLink?: string
  status?: string
}

export interface CreateEventParams {
  summary: string
  description?: string
  startTime: Date
  endTime: Date
  attendees?: string[]
  recurrence?: string[]
}

export interface CreateEventResult {
  eventId: string
  meetLink: string
}

/**
 * Create a calendar event with Google Meet link
 */
export async function createCalendarEvent(
  params: CreateEventParams
): Promise<CreateEventResult> {
  try {
    const calendar = getCalendarClient()
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: 'America/New_York', // Florida timezone
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: params.attendees?.map(email => ({ email })),
      recurrence: params.recurrence,
      // Request Google Meet conference
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      // Send email notifications to attendees
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 15 }, // 15 minutes before
        ],
      },
    }

    console.log('Creating Google Calendar event:', {
      summary: params.summary,
      start: params.startTime,
      end: params.endTime,
      recurring: !!params.recurrence,
    })

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1, // Required for Meet link generation
      sendUpdates: 'all', // Send email invitations to attendees
    })

    const eventId = response.data.id
    const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri

    if (!eventId) {
      throw new Error('Failed to create calendar event: No event ID returned')
    }

    console.log('✅ Google Calendar event created:', {
      eventId,
      meetLink,
      summary: params.summary,
    })

    return {
      eventId,
      meetLink: meetLink || '',
    }
  } catch (error) {
    console.error('❌ Error creating Google Calendar event:', error)
    throw new Error(`Failed to create calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CreateEventParams>,
  updateAll: boolean = false
): Promise<void> {
  try {
    const calendar = getCalendarClient()
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    // First, get the existing event
    const existingEvent = await calendar.events.get({
      calendarId,
      eventId,
    })

    const updatedEvent: calendar_v3.Schema$Event = {
      ...existingEvent.data,
      summary: updates.summary || existingEvent.data.summary,
      description: updates.description !== undefined ? updates.description : existingEvent.data.description,
    }

    if (updates.startTime) {
      updatedEvent.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: 'America/New_York',
      }
    }

    if (updates.endTime) {
      updatedEvent.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: 'America/New_York',
      }
    }

    if (updates.attendees) {
      updatedEvent.attendees = updates.attendees.map(email => ({ email }))
    }

    if (updates.recurrence) {
      updatedEvent.recurrence = updates.recurrence
    }

    console.log('Updating Google Calendar event:', {
      eventId,
      updateAll,
      summary: updatedEvent.summary,
    })

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: updatedEvent,
      sendUpdates: 'all', // Notify attendees of changes
    })

    console.log('✅ Google Calendar event updated:', eventId)
  } catch (error) {
    console.error('❌ Error updating Google Calendar event:', error)
    throw new Error(`Failed to update calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  eventId: string,
  deleteAll: boolean = false
): Promise<void> {
  try {
    const calendar = getCalendarClient()
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    console.log('Deleting Google Calendar event:', {
      eventId,
      deleteAll,
    })

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Notify attendees of cancellation
    })

    console.log('✅ Google Calendar event deleted:', eventId)
  } catch (error) {
    console.error('❌ Error deleting Google Calendar event:', error)
    throw new Error(`Failed to delete calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * List calendar events in a date range
 */
export async function listCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    const calendar = getCalendarClient()
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    console.log('Fetching Google Calendar events:', {
      start: startDate,
      end: endDate,
    })

    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true, // Expand recurring events into individual instances
      orderBy: 'startTime',
    })

    const events: CalendarEvent[] = (response.data.items || []).map(event => ({
      id: event.id,
      summary: event.summary || 'Untitled Event',
      description: event.description,
      startTime: new Date(event.start?.dateTime || event.start?.date || ''),
      endTime: new Date(event.end?.dateTime || event.end?.date || ''),
      attendees: event.attendees?.map(a => a.email || '').filter(Boolean),
      meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri,
      status: event.status,
    }))

    console.log(`✅ Fetched ${events.length} Google Calendar events`)

    return events
  } catch (error) {
    console.error('❌ Error listing Google Calendar events:', error)
    throw new Error(`Failed to list calendar events: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check for scheduling conflicts
 */
export async function checkConflicts(
  startTime: Date,
  endTime: Date,
  excludeEventId?: string
): Promise<boolean> {
  try {
    const events = await listCalendarEvents(
      new Date(startTime.getTime() - 60 * 60 * 1000), // 1 hour before
      new Date(endTime.getTime() + 60 * 60 * 1000)     // 1 hour after
    )

    // Check if any event overlaps with the requested time range
    const hasConflict = events.some(event => {
      // Skip the event we're excluding (for updates)
      if (excludeEventId && event.id === excludeEventId) {
        return false
      }

      // Check for overlap
      const eventStart = event.startTime.getTime()
      const eventEnd = event.endTime.getTime()
      const requestStart = startTime.getTime()
      const requestEnd = endTime.getTime()

      // Events overlap if: (start1 < end2) AND (start2 < end1)
      const overlaps = (requestStart < eventEnd) && (eventStart < requestEnd)

      if (overlaps) {
        console.log('⚠️ Scheduling conflict detected:', {
          existingEvent: event.summary,
          existingTime: `${event.startTime} - ${event.endTime}`,
          requestedTime: `${startTime} - ${endTime}`,
        })
      }

      return overlaps
    })

    return hasConflict
  } catch (error) {
    console.error('❌ Error checking for conflicts:', error)
    // In case of error, assume no conflict to allow the operation
    // (Better to allow potentially conflicting appointment than block all)
    return false
  }
}

/**
 * Generate recurrence rule for Google Calendar
 * Max 90 days from start date
 */
export function generateRecurrenceRule(
  pattern: 'weekly' | 'biweekly' | 'monthly',
  startDate: Date,
  endDate?: Date
): string[] {
  // Calculate max end date (90 days from start)
  const maxEndDate = new Date(startDate)
  maxEndDate.setDate(maxEndDate.getDate() + 90)

  // Use provided end date if it's earlier than max, otherwise use max
  const until = endDate && endDate < maxEndDate ? endDate : maxEndDate

  // Format: YYYYMMDD (no hyphens, no time)
  const untilStr = until.toISOString().split('T')[0].replace(/-/g, '')

  console.log('Generating recurrence rule:', {
    pattern,
    startDate,
    until,
    untilStr,
  })

  switch (pattern) {
    case 'weekly':
      return [`RRULE:FREQ=WEEKLY;UNTIL=${untilStr}`]
    case 'biweekly':
      return [`RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=${untilStr}`]
    case 'monthly':
      return [`RRULE:FREQ=MONTHLY;UNTIL=${untilStr}`]
    default:
      return []
  }
}
