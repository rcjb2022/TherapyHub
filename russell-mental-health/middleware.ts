// Middleware for route protection
// Ensures only authenticated users can access dashboard routes
// Compatible with Next.js 16

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Verify NEXTAUTH_SECRET is configured
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('Authentication middleware error: NEXTAUTH_SECRET is not set.')
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  // Get and verify session token (validates signature and expiration)
  const session = await getToken({ req, secret })

  const isAuth = !!session
  const isAuthPage = pathname.startsWith('/login')
  const isDashboard = pathname.startsWith('/dashboard')

  // Redirect authenticated users away from login page
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users from dashboard to login
  if (isDashboard && !isAuth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
