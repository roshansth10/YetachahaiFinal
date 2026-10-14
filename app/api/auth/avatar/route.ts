import { NextResponse } from 'next/server'
import {
  getSessionUser,
  checkUploadRateLimit,
  processAndSaveAvatar,
  removeUserAvatar,
  findUserById,
} from '@/lib/auth-server'

// Max 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: Request) {
  try {
    // 1. Session verification: User id MUST come from session, NEVER from request body
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to upload a profile picture.' }, { status: 401 })
    }

    // 2. Rate limiting (max 5 uploads per minute per user)
    const allowed = checkUploadRateLimit(sessionUser.id, 5)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please wait a minute before trying again.' },
        { status: 429 }
      )
    }

    // 3. Extract uploaded file from multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    // 4. File size validation (<= 5 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5 MB limit. Please choose a smaller image.' }, { status: 400 })
    }

    // 5. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 6. Server-side processing: strip EXIF, resize to 512x512 WebP, save sanitized file
    const { avatarUrl } = await processAndSaveAvatar(sessionUser.id, buffer, file.name)

    const updatedUser = findUserById(sessionUser.id)!
    const { password: _, ...safeUser } = updatedUser

    return NextResponse.json({
      success: true,
      avatarUrl,
      user: safeUser,
      message: 'Profile picture updated successfully.',
    })
  } catch (err: any) {
    console.error('Avatar upload error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to process and upload avatar image.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    await removeUserAvatar(sessionUser.id)

    const updatedUser = findUserById(sessionUser.id)!
    const { password: _, ...safeUser } = updatedUser

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Profile picture removed successfully.',
    })
  } catch (err) {
    console.error('Avatar removal error:', err)
    return NextResponse.json({ error: 'Failed to remove profile picture.' }, { status: 500 })
  }
}
