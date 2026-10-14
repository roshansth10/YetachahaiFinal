import { NextResponse } from 'next/server'
import { findUserByEmail, setSessionCookie, checkLoginRateLimit } from '@/lib/auth-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // Rate limiting per email address
    if (!checkLoginRateLimit(email.toLowerCase(), 10)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute before trying again.' },
        { status: 429 }
      )
    }

    const user = findUserByEmail(email)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    await setSessionCookie(user.id)

    // Return user without password
    const { password: _, ...safeUser } = user
    return NextResponse.json({ success: true, user: safeUser })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 })
  }
}
