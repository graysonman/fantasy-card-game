// src/utils/supabaseMiddleware.ts
import { createServerClient, type CookieOptions as SupabaseCookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type NextSameSite = 'lax' | 'strict' | 'none' | boolean
function normalizeSameSite(v: SupabaseCookieOptions['sameSite']): NextSameSite {
  if (v === undefined) return 'lax'
  if (typeof v === 'boolean') return v
  const s = v.toLowerCase()
  return s === 'strict' || s === 'none' ? (s as 'strict' | 'none') : 'lax'
}

export function createClient(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })

  const isSecure =
    request.nextUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https'

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: SupabaseCookieOptions = {}) {
        const opts = {
          ...options,
          path: options.path ?? '/',
          sameSite: normalizeSameSite(options.sameSite),
          secure: isSecure,
        }
        request.cookies.set({ name, value, ...opts })
        response.cookies.set({ name, value, ...opts })
      },
      remove(name: string, options: SupabaseCookieOptions = {}) {
        const opts = {
          ...options,
          path: options.path ?? '/',
          sameSite: normalizeSameSite(options.sameSite),
          secure: isSecure,
          maxAge: 0,
          value: '', 
        }
        request.cookies.set({ name, ...opts })
        response.cookies.set({ name, ...opts })
      },
    },
  })

  return { supabase, response }
}
