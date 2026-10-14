import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth-server'

export async function POST() {
  try {
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json({ error: 'Failed to clear session.' }, { status: 500 })
  }
}
