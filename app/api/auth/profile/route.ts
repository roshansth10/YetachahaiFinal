import { NextResponse } from 'next/server'
import { getSessionUser, getUsers, saveUsers } from '@/lib/auth-server'

export async function PUT(request: Request) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
    }

    const users = getUsers()
    const updatedUsers = users.map(u => {
      if (u.id === sessionUser.id) {
        return {
          ...u,
          name: name.trim(),
          phone: phone !== undefined ? phone.trim() : u.phone,
          address: address !== undefined ? address : u.address,
        }
      }
      return u
    })

    saveUsers(updatedUsers)

    const updatedUser = updatedUsers.find(u => u.id === sessionUser.id)!
    const { password: _, ...safeUser } = updatedUser

    return NextResponse.json({ success: true, user: safeUser })
  } catch (err) {
    console.error('Update profile error:', err)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}
