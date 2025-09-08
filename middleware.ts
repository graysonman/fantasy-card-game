// middleware.ts (at project root)
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './utils/supabaseMiddleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // allow auth-related routes through without a session
  if (
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/reset-password')
  ) {
    return NextResponse.next()
  }

  const { supabase, response } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  // example: protect your app areas
  if (!user && (pathname.startsWith('/app') || pathname.startsWith('/battle-arena'))) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|robots.txt|sitemap.xml|images/).*)'],
}
