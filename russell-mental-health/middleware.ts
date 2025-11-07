// Middleware for route protection
// Ensures only authenticated users can access dashboard routes
// Compatible with Next.js 16

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get session token from cookies
  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value

  const isAuth = !!sessionToken
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
