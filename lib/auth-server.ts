import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import sharp from 'sharp'
import { mockUsers as defaultMockUsers, orders as defaultMockOrders, type User, type Order } from './data'

const COOKIE_NAME = 'yetaxahai_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'yetaxahai-nepal-bookstore-secret-key-2026'

// File-based persistent store for users during app lifetime
const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

// In-memory cache + persistent JSON backing
let usersCache: User[] | null = null

export function getUsers(): User[] {
  ensureDirectories()
  if (usersCache) return usersCache

  if (fs.existsSync(USERS_FILE)) {
    try {
      const raw = fs.readFileSync(USERS_FILE, 'utf8')
      usersCache = JSON.parse(raw)
      return usersCache!
    } catch {
      // fallback
    }
  }

  // Initialize with seed mock users (without any AI avatars)
  usersCache = defaultMockUsers.map(u => ({ ...u, avatar: undefined }))
  saveUsers(usersCache)
  return usersCache
}

export function saveUsers(users: User[]) {
  ensureDirectories()
  usersCache = users
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

export function findUserById(id: string): User | undefined {
  const users = getUsers()
  return users.find(u => u.id === id)
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

// Session signing helpers
function signToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url')
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function verifyToken(token: string): string | null {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
    if (signature !== expectedSig) return null

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data.userId || data.exp < Date.now()) return null
    return data.userId
  } catch {
    return null
  }
}

// Set httpOnly session cookie
export async function setSessionCookie(userId: string) {
  const token = signToken(userId)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

// Clear httpOnly session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  })
}

// Get authenticated user from httpOnly session cookie
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  if (!sessionCookie || !sessionCookie.value) {
    return null
  }

  const userId = verifyToken(sessionCookie.value)
  if (!userId) {
    return null
  }

  const user = findUserById(userId)
  return user || null
}

// In-memory rate limiting (identifier -> timestamps array)
const uploadRateLimits = new Map<string, number[]>()
const loginRateLimits = new Map<string, number[]>()
const orderRateLimits = new Map<string, number[]>()

export function checkUploadRateLimit(userId: string, maxUploadsPerMinute = 5): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000
  const timestamps = (uploadRateLimits.get(userId) || []).filter(t => now - t < windowMs)

  if (timestamps.length >= maxUploadsPerMinute) {
    return false
  }

  timestamps.push(now)
  uploadRateLimits.set(userId, timestamps)
  return true
}

export function checkLoginRateLimit(identifier: string, maxAttemptsPerMinute = 10): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000
  const timestamps = (loginRateLimits.get(identifier) || []).filter(t => now - t < windowMs)

  if (timestamps.length >= maxAttemptsPerMinute) {
    return false
  }

  timestamps.push(now)
  loginRateLimits.set(identifier, timestamps)
  return true
}

export function checkOrderRateLimit(userId: string, maxOrdersPerMinute = 10): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000
  const timestamps = (orderRateLimits.get(userId) || []).filter(t => now - t < windowMs)

  if (timestamps.length >= maxOrdersPerMinute) {
    return false
  }

  timestamps.push(now)
  orderRateLimits.set(userId, timestamps)
  return true
}

// Persistent Orders store
let ordersCache: Order[] | null = null

export function getOrders(): Order[] {
  ensureDirectories()
  if (ordersCache) return ordersCache

  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf8')
      ordersCache = JSON.parse(raw)
      return ordersCache!
    } catch {
      // fallback
    }
  }

  ordersCache = [...defaultMockOrders]
  saveOrders(ordersCache)
  return ordersCache
}

export function saveOrders(orders: Order[]) {
  ensureDirectories()
  ordersCache = orders
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8')
}

export function getUserOrders(userId: string): Order[] {
  const allOrders = getOrders()
  return allOrders.filter(o => o.userId === userId)
}

export function addOrder(order: Order): Order {
  const allOrders = getOrders()
  allOrders.unshift(order)
  saveOrders(allOrders)

  // Update user stats and delivery address if needed
  const user = findUserById(order.userId)
  if (user) {
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
    user.booksOrdered = (user.booksOrdered || 0) + totalItems
    user.totalSpent = (user.totalSpent || 0) + order.total
    if (!user.phone && order.shippingAddress.phone) {
      user.phone = order.shippingAddress.phone
    }
    if (!user.address) {
      user.address = {
        line1: order.shippingAddress.line1,
        line2: order.shippingAddress.line2,
        city: order.shippingAddress.city,
        district: order.shippingAddress.district,
        province: order.shippingAddress.province,
        postalCode: order.shippingAddress.postalCode,
      }
    }
    const users = getUsers()
    const updatedUsers = users.map(u => (u.id === user.id ? user : u))
    saveUsers(updatedUsers)
  }

  return order
}

// Process and save avatar image with sharp
export async function processAndSaveAvatar(
  userId: string,
  buffer: Buffer,
  originalFilename?: string
): Promise<{ avatarUrl: string }> {
  ensureDirectories()

  // Verify real image data using sharp
  const metadata = await sharp(buffer).metadata()
  if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
    throw new Error('Unsupported image format. Please upload JPG, PNG, or WebP.')
  }

  // Delete previous avatar file if exists
  const user = findUserById(userId)
  if (user?.avatar && user.avatar.startsWith('/uploads/avatars/')) {
    const oldFilename = path.basename(user.avatar)
    const oldFilePath = path.join(UPLOADS_DIR, oldFilename)
    if (fs.existsSync(oldFilePath)) {
      try {
        fs.unlinkSync(oldFilePath)
      } catch {
        // ignore
      }
    }
  }

  // Generate safe sanitized filename
  const safeRandom = crypto.randomBytes(8).toString('hex')
  const newFilename = `avatar-${userId}-${safeRandom}.webp`
  const targetPath = path.join(UPLOADS_DIR, newFilename)

  // Resize to 512x512, convert to WebP, and strip all EXIF metadata
  await sharp(buffer)
    .rotate() // auto-orient based on EXIF before stripping
    .resize(512, 512, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(targetPath)

  const avatarUrl = `/uploads/avatars/${newFilename}`

  // Update user in store
  const users = getUsers()
  const updatedUsers = users.map(u => (u.id === userId ? { ...u, avatar: avatarUrl } : u))
  saveUsers(updatedUsers)

  return { avatarUrl }
}

// Remove avatar from disk and user record
export async function removeUserAvatar(userId: string): Promise<void> {
  const user = findUserById(userId)
  if (!user) return

  if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
    const filename = path.basename(user.avatar)
    const filePath = path.join(UPLOADS_DIR, filename)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
      } catch {
        // ignore
      }
    }
  }

  const users = getUsers()
  const updatedUsers = users.map(u => (u.id === userId ? { ...u, avatar: undefined } : u))
  saveUsers(updatedUsers)
}
