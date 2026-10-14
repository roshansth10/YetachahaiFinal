import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getSessionUser()
    return NextResponse.json({ user })
  } catch (err) {
    console.error('Failed to get session user:', err)
    return NextResponse.json({ user: null })
  }
}
