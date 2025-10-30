'use client'

// Session Provider Wrapper
// Wraps app with NextAuth SessionProvider for client-side auth

import { SessionProvider } from 'next-auth/react'

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
