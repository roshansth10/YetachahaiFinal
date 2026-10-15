import { ADMIN_CREDENTIALS, STORAGE_KEYS } from './auth-constants'

export interface PasswordRecord {
  salt: string
  hash: string
  iterations: number
}

export interface StoredUser {
  id: string
  name: string
  email: string
  passwordRecord: PasswordRecord
  role: 'customer' | 'admin'
  phone?: string
  address?: unknown
  avatar?: string
  createdAt: string
  booksOrdered?: number
  totalSpent?: number
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  avatar?: string
  phone?: string
  address?: unknown
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

export async function hashPassword(password: string): Promise<PasswordRecord> {
  const iterations = 210000
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto
  const saltBytes = new Uint8Array(16)
  cryptoObj.getRandomValues(saltBytes)
  const salt = bufferToHex(saltBytes.buffer)

  const enc = new TextEncoder()
  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const derivedBits = await cryptoObj.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  const hash = bufferToHex(derivedBits)
  return { salt, hash, iterations }
}

export async function verifyPassword(password: string, record: PasswordRecord): Promise<boolean> {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto
  const saltBytes = hexToBuffer(record.salt)
  const enc = new TextEncoder()
  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const derivedBits = await cryptoObj.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: record.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  const computedHash = bufferToHex(derivedBits)
  return computedHash === record.hash
}

// Lockout tracking: 5 failed attempts = 30 second wait
export interface LockoutState {
  attempts: number
  lockedUntil: number | null
}

export function getLockoutState(): LockoutState {
  if (typeof window === 'undefined') return { attempts: 0, lockedUntil: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCKOUT)
    if (!raw) return { attempts: 0, lockedUntil: null }
    const parsed = JSON.parse(raw) as LockoutState
    if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
      // Lockout expired
      clearLockout()
      return { attempts: 0, lockedUntil: null }
    }
    return parsed
  } catch {
    return { attempts: 0, lockedUntil: null }
  }
}

export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
  if (typeof window === 'undefined') return { isLocked: false, remainingSeconds: 0 }
  const state = getLockoutState()
  const attempts = state.attempts + 1
  let lockedUntil = state.lockedUntil

  if (attempts >= 5) {
    lockedUntil = Date.now() + 30 * 1000 // 30 seconds
  }

  const newState: LockoutState = { attempts, lockedUntil }
  localStorage.setItem(STORAGE_KEYS.LOCKOUT, JSON.stringify(newState))

  if (lockedUntil && lockedUntil > Date.now()) {
    return { isLocked: true, remainingSeconds: Math.ceil((lockedUntil - Date.now()) / 1000) }
  }
  return { isLocked: false, remainingSeconds: 0 }
}

export function clearLockout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT)
}

// User CRUD in localStorage
export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession(user: SessionUser | null): void {
  if (typeof window === 'undefined') return
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
    document.cookie = 'yetaxahai_session_v2=; path=/; max-age=0; SameSite=Lax'
  } else {
    // Only store safe fields: never store password or hash
    const sessionData: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    }
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData))
    document.cookie = `yetaxahai_session_v2=${user.role}; path=/; max-age=604800; SameSite=Lax`
  }
}

/**
 * Migration & Initialization
 * 1. Checks schema version.
 * 2. If older version or missing:
 *    - Cleans legacy users, removes plaintext passwords, removes old customer demo.
 *    - Clears stale session.
 *    - Preserves existing cart & wishlist.
 * 3. Seeds Admin demo account if not already present.
 */
export async function initStorageAuth(): Promise<void> {
  if (typeof window === 'undefined') return

  const currentVersion = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)

  if (currentVersion !== STORAGE_KEYS.CURRENT_VERSION) {
    // Clean legacy storage
    localStorage.removeItem('yetaxahai_users')
    localStorage.removeItem('yetaxahai_session')
    localStorage.removeItem('yetaxahai-store-user')
    // Clear legacy session
    localStorage.removeItem(STORAGE_KEYS.SESSION)

    // Clean legacy user-attached user object in yetaxahai-store while preserving cart/wishlist
    try {
      const storeRaw = localStorage.getItem('yetaxahai-store')
      if (storeRaw) {
        const parsed = JSON.parse(storeRaw)
        delete parsed.user
        localStorage.setItem('yetaxahai-store', JSON.stringify(parsed))
      }
    } catch {}

    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, STORAGE_KEYS.CURRENT_VERSION)
  }

  // Ensure Admin Demo exists
  const users = getStoredUsers()
  const adminExists = users.some(u => u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase())

  if (!adminExists) {
    const passwordRecord = await hashPassword(ADMIN_CREDENTIALS.password)
    const adminUser: StoredUser = {
      id: 'admin_demo_01',
      name: 'Yetaxahai Admin',
      email: ADMIN_CREDENTIALS.email,
      passwordRecord,
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z',
    }
    users.unshift(adminUser)
    saveStoredUsers(users)
  }
}
