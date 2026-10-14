import { NextResponse } from 'next/server'
import { findUserByEmail, getUsers, saveUsers, setSessionCookie } from '@/lib/auth-server'
import { type User } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone, address } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 })
    }

    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'customer',
      phone: phone?.trim(),
      address: address?.trim(),
      memberSince: new Date().toISOString().slice(0, 10),
      booksOrdered: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    }

    const currentUsers = getUsers()
    saveUsers([...currentUsers, newUser])

    await setSessionCookie(newUser.id)

    const { password: _, ...safeUser } = newUser
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred during signup.' }, { status: 500 })
  }
}
