import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Demo route guard. Real authorization and purchase enforcement needs a backend.
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionCookie = request.cookies.get('yetaxahai_session_v2')
  const hasSession = !!(sessionCookie?.value)

  // Routes that require authentication (any logged-in user)
  const authProtected = ['/checkout', '/profile', '/orders']
  const isAuthProtected = authProtected.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isAuthProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    const targetRedirect = `${pathname}${search}`
    loginUrl.searchParams.set('redirect', targetRedirect)
    return NextResponse.redirect(loginUrl)
  }

  // /admin requires a session with admin role
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && (!hasSession || sessionCookie?.value !== 'admin')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/checkout', '/checkout/:path*',
    '/profile', '/profile/:path*',
    '/orders', '/orders/:path*',
    '/admin', '/admin/:path*',
  ],
}
