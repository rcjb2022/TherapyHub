/**
 * Google Calendar OAuth Authorization Page
 *
 * ONE-TIME SETUP: Admin visits this page to authorize Google Calendar access
 * After authorization, refresh token is displayed to copy into .env.local
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react'

export default function GoogleAuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = () => {
    setLoading(true)
    setError(null)

    try {
      // Build Google OAuth URL
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

      if (!clientId) {
        throw new Error('Google Client ID not found in environment variables')
      }

      const redirectUri = `${window.location.origin}/api/auth/google/callback`
      const scope = encodeURIComponent(
        'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
      )

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${scope}&` +
        `access_type=offline&` +
        `prompt=consent`

      // Redirect to Google OAuth
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate authorization')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-center">Connect Google Calendar</CardTitle>
          <CardDescription className="text-center">
            One-time setup to authorize TherapyHub to manage Dr. Bethany's calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-900">What this does:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Authorizes TherapyHub to create/edit appointments</li>
              <li>Syncs with DrBethany@RussellMentalHealth.com calendar</li>
              <li>Generates Google Meet links automatically</li>
              <li>Sends calendar invites to patients</li>
            </ul>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-900">After clicking "Connect":</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>You'll be redirected to Google</li>
              <li>Sign in with DrBethany@RussellMentalHealth.com</li>
              <li>Grant calendar access</li>
              <li>Copy the refresh token displayed</li>
              <li>Add it to your .env.local file</li>
            </ol>
          </div>

          <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Redirecting to Google...' : 'Connect Google Calendar'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            This is a one-time setup. The refresh token will be valid indefinitely.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
