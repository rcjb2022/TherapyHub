/**
 * Video Sessions Management Page (THERAPIST ONLY)
 * Session Vault - View and manage recorded therapy sessions
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SessionVaultClient from './SessionVaultClient'

export default async function VideoSessionsManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only therapists and admins can access session management
  if (session.user.role === 'PATIENT') {
    redirect('/dashboard/patient')
  }

  return <SessionVaultClient />
}
