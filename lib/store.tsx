'use client'

import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react'
import { mockBooks as books, type Book, type User, type Order } from './data'
import {
  initStorageAuth,
  getStoredUsers,
  saveStoredUsers,
  getSession,
  setSession,
  verifyPassword,
  hashPassword,
  getLockoutState,
  recordFailedAttempt,
  clearLockout,
  type SessionUser,
  type StoredUser,
} from './auth-client'
import { STORAGE_KEYS } from './auth-constants'

// Admin Stats type
export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalBooks: number
  revenueChange: number
  ordersChange: number
  usersChange: number
  booksChange: number
}

// Types
interface CartItem {
  book: Book
  quantity: number
}

interface WishlistItem {
  book: Book
  addedAt: string
}

interface ShippingInfo {
  name: string
  email: string
  phone: string
  line1: string
  line2?: string
  city: string
  district: string
  province: string
  postalCode: string
  notes?: string
  method: 'standard' | 'express' | 'sameday'
}

interface PaymentState {
  method: 'esewa' | 'khalti' | 'cod' | null
  status: 'idle' | 'processing' | 'otp' | 'mpin' | 'success' | 'failed'
  transactionId?: string
}

interface AppState {
  user: User | null
  cart: CartItem[]
  wishlist: WishlistItem[]
  orders: Order[]
  shipping: ShippingInfo | null
  payment: PaymentState
  checkoutStep: number
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; payload: { book: Book; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { bookId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: Book }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'MOVE_TO_CART'; payload: string }
  | { type: 'SET_SHIPPING'; payload: ShippingInfo }
  | { type: 'SET_PAYMENT_METHOD'; payload: 'esewa' | 'khalti' | 'cod' }
  | { type: 'SET_PAYMENT_STATUS'; payload: PaymentState['status'] }
  | { type: 'SET_TRANSACTION_ID'; payload: string }
  | { type: 'SET_CHECKOUT_STEP'; payload: number }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'RESET_CHECKOUT' }
  | { type: 'HYDRATE'; payload: Partial<AppState> }

const initialState: AppState = {
  user: null,
  cart: [],
  wishlist: [],
  orders: [],
  shipping: null,
  payment: { method: null, status: 'idle' },
  checkoutStep: 1,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.book.id === action.payload.book.id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.book.id === action.payload.book.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { book: action.payload.book, quantity: action.payload.quantity }],
      }
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.book.id !== action.payload),
      }
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.book.id === action.payload.bookId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      }
    case 'CLEAR_CART':
      return { ...state, cart: [] }
    case 'ADD_TO_WISHLIST': {
      const exists = state.wishlist.find(item => item.book.id === action.payload.id)
      if (exists) return state
      return {
        ...state,
        wishlist: [...state.wishlist, { book: action.payload, addedAt: new Date().toISOString() }],
      }
    }
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.book.id !== action.payload && item.book.slug !== action.payload),
      }
    case 'MOVE_TO_CART': {
      const item = state.wishlist.find(item => item.book.id === action.payload)
      if (!item) return state
      const existingCartItem = state.cart.find(cartItem => cartItem.book.id === action.payload)
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.book.id !== action.payload),
        cart: existingCartItem
          ? state.cart.map(cartItem =>
              cartItem.book.id === action.payload
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          : [...state.cart, { book: item.book, quantity: 1 }],
      }
    }
    case 'SET_SHIPPING':
      return { ...state, shipping: action.payload }
    case 'SET_PAYMENT_METHOD':
      return { ...state, payment: { ...state.payment, method: action.payload, status: 'idle' } }
    case 'SET_PAYMENT_STATUS':
      return { ...state, payment: { ...state.payment, status: action.payload } }
    case 'SET_TRANSACTION_ID':
      return { ...state, payment: { ...state.payment, transactionId: action.payload } }
    case 'SET_CHECKOUT_STEP':
      return { ...state, checkoutStep: action.payload }
    case 'SET_CART':
      return { ...state, cart: action.payload }
    case 'SET_ORDERS':
      return { ...state, orders: action.payload }
    case 'PLACE_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders.filter(o => o.id !== action.payload.id)],
        cart: [],
        shipping: null,
        payment: { method: null, status: 'idle' },
        checkoutStep: 1,
      }
    case 'RESET_CHECKOUT':
      return {
        ...state,
        shipping: null,
        payment: { method: null, status: 'idle' },
        checkoutStep: 1,
      }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface StoreContextType {
  // State access
  state: AppState
  user: User | null
  cart: CartItem[]
  wishlist: Book[]
  orders: Order[]
  shipping: ShippingInfo | null
  payment: PaymentState
  checkoutStep: number
  adminStats: AdminStats | null
  dispatch: React.Dispatch<Action>
  isAuthLoading: boolean
  // Auth
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (data: { email: string; password: string; name: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: { name?: string; phone?: string; address?: unknown }) => Promise<boolean>
  uploadAvatar: (dataUrl: string) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>
  removeAvatar: () => Promise<boolean>
  // Cart
  addToCart: (book: Book, quantity?: number) => void
  removeFromCart: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => { subtotal: number; shipping: number; discount: number; total: number }
  // Wishlist
  addToWishlist: (book: Book) => void
  removeFromWishlist: (bookId: string) => void
  moveToCart: (bookId: string) => void
  isInWishlist: (bookId: string) => boolean
  // Checkout
  setShipping: (info: ShippingInfo) => void
  setPaymentMethod: (method: 'esewa' | 'khalti' | 'cod') => void
  setPaymentStatus: (status: PaymentState['status']) => void
  setTransactionId: (id: string) => void
  processPayment: () => Promise<boolean>
  setCheckoutStep: (step: number) => void
  placeOrder: (transactionIdOverride?: string) => Promise<{ success: boolean; order?: Order; error?: string; status?: number }>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Helper: Merge guest cart with user's saved account cart
  const mergeGuestCartOnLogin = (guestCart: CartItem[], loggedInUser: User | StoredUser) => {
    const accountCartKey = `yetaxahai_account_cart_${loggedInUser.id}`
    let accountCart: CartItem[] = []
    try {
      const raw = localStorage.getItem(accountCartKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        accountCart = parsed.map((item: { book: { id: string }; quantity: number }) => ({
          book: books.find(b => b.id === item.book.id) || item.book,
          quantity: item.quantity,
        })).filter((item: CartItem) => item.book)
      }
    } catch {}

    const map = new Map<string, CartItem>()
    // Start with account cart items
    for (const item of accountCart) {
      map.set(item.book.id, { ...item })
    }
    // Add/merge guest items (sum quantities, no duplicates)
    for (const guestItem of guestCart) {
      const existing = map.get(guestItem.book.id)
      if (existing) {
        existing.quantity += guestItem.quantity
      } else {
        map.set(guestItem.book.id, { ...guestItem })
      }
    }

    const merged = Array.from(map.values())
    dispatch({ type: 'SET_CART', payload: merged })

    try {
      localStorage.setItem(
        accountCartKey,
        JSON.stringify(merged.map(i => ({ book: { id: i.book.id }, quantity: i.quantity })))
      )
      // Clear standalone guest cart
      localStorage.removeItem('yetaxahai-guest-cart')
    } catch {}
  }

  // 1. Initialise localStorage auth and restore session if present
  useEffect(() => {
    async function initAuth() {
      try {
        await initStorageAuth()
        const session = getSession()
        if (session) {
          const users = getStoredUsers()
          const matchedUser = users.find(u => u.id === session.id)
          if (matchedUser) {
            dispatch({ type: 'LOGIN', payload: matchedUser as unknown as User })
            // Restore user's orders from localStorage
            try {
              const ordersRaw = localStorage.getItem(STORAGE_KEYS.ORDERS_PREFIX + matchedUser.id)
              if (ordersRaw) {
                dispatch({ type: 'SET_ORDERS', payload: JSON.parse(ordersRaw) })
              }
            } catch {}
          } else {
            setSession(null)
          }
        }
      } catch (err) {
        console.error('Failed to initialise client auth:', err)
      } finally {
        setIsAuthLoading(false)
      }
    }
    initAuth()
  }, [])

  // 2. Load cart & wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yetaxahai-store')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        delete parsed.user // Strictly ensure no user is ever loaded from general store
        if (parsed.cart) {
          parsed.cart = parsed.cart.map((item: { book: { id: string }; quantity: number }) => ({
            ...item,
            book: books.find(b => b.id === item.book.id) || item.book,
          }))
        }
        if (parsed.wishlist) {
          parsed.wishlist = parsed.wishlist.map((item: { book: { id: string }; addedAt: string }) => ({
            book: books.find(b => b.id === item.book.id) || item.book,
            addedAt: item.addedAt,
          }))
        }
        dispatch({ type: 'HYDRATE', payload: parsed })
      } catch {
        console.error('Failed to parse stored state')
      }
    }
  }, [])

  // 3. Save cart and wishlist on state change
  useEffect(() => {
    const toSave = {
      cart: state.cart.map(item => ({ book: { id: item.book.id }, quantity: item.quantity })),
      wishlist: state.wishlist.map(item => ({ book: { id: item.book.id }, addedAt: item.addedAt })),
      orders: state.orders,
    }
    localStorage.setItem('yetaxahai-store', JSON.stringify(toSave))
    if (state.user) {
      try {
        localStorage.setItem(
          `yetaxahai_account_cart_${state.user.id}`,
          JSON.stringify(toSave.cart)
        )
      } catch {}
    }
  }, [state.cart, state.wishlist, state.orders, state.user])

  // Login using localStorage PBKDF2 Web Crypto API
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const lockout = getLockoutState()
    if (lockout.lockedUntil && Date.now() < lockout.lockedUntil) {
      const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000)
      return { success: false, error: `Account locked. Please wait ${remaining} seconds.` }
    }

    const cleanEmail = email.trim().toLowerCase()
    const users = getStoredUsers()
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail)

    if (!foundUser) {
      const lock = recordFailedAttempt()
      return {
        success: false,
        error: lock.isLocked
          ? `Too many failed attempts. Locked for ${lock.remainingSeconds} seconds.`
          : 'Invalid email or password.',
      }
    }

    const isValid = await verifyPassword(password, foundUser.passwordRecord)
    if (!isValid) {
      const lock = recordFailedAttempt()
      return {
        success: false,
        error: lock.isLocked
          ? `Too many failed attempts. Locked for ${lock.remainingSeconds} seconds.`
          : 'Invalid email or password.',
      }
    }

    // Success - clear lockout counter
    clearLockout()

    const sessionUser: SessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.avatar,
      phone: foundUser.phone,
      address: foundUser.address,
    }

    setSession(sessionUser)
    dispatch({ type: 'LOGIN', payload: foundUser as unknown as User })
    mergeGuestCartOnLogin(state.cart, foundUser)

    // Load orders for this user
    try {
      const ordersRaw = localStorage.getItem(STORAGE_KEYS.ORDERS_PREFIX + foundUser.id)
      if (ordersRaw) {
        dispatch({ type: 'SET_ORDERS', payload: JSON.parse(ordersRaw) })
      } else {
        dispatch({ type: 'SET_ORDERS', payload: [] })
      }
    } catch {
      dispatch({ type: 'SET_ORDERS', payload: [] })
    }

    return { success: true }
  }

  // Logout - fully clears session
  const logout = async (): Promise<void> => {
    if (state.user) {
      try {
        localStorage.setItem(
          `yetaxahai_account_cart_${state.user.id}`,
          JSON.stringify(state.cart.map(i => ({ book: { id: i.book.id }, quantity: i.quantity })))
        )
      } catch {}
    }
    setSession(null)
    dispatch({ type: 'LOGOUT' })
    dispatch({ type: 'CLEAR_CART' })
    dispatch({ type: 'SET_ORDERS', payload: [] })
    try {
      const saved = localStorage.getItem('yetaxahai-store')
      if (saved) {
        const parsed = JSON.parse(saved)
        delete parsed.user
        parsed.cart = []
        localStorage.setItem('yetaxahai-store', JSON.stringify(parsed))
      }
    } catch {}
  }

  // Sign up - creates customer account in localStorage with PBKDF2 hash
  const register = async (data: {
    email: string
    password: string
    name: string
    phone?: string
    address?: string
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase()
    if (!cleanEmail) return { success: false, error: 'Email is required.' }
    if (!data.name.trim()) return { success: false, error: 'Name is required.' }
    if (!data.password || data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' }
    }

    const users = getStoredUsers()
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    const passwordRecord = await hashPassword(data.password)
    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: data.name.trim(),
      email: cleanEmail,
      passwordRecord,
      role: 'customer', // Always customer, ignoring any form/state role tampering
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      createdAt: new Date().toISOString(),
      booksOrdered: 0,
      totalSpent: 0,
    }

    users.push(newUser)
    saveStoredUsers(users)

    const sessionUser: SessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      phone: newUser.phone,
      address: newUser.address,
    }

    setSession(sessionUser)
    dispatch({ type: 'LOGIN', payload: newUser as unknown as User })
    mergeGuestCartOnLogin(state.cart, newUser)
    dispatch({ type: 'SET_ORDERS', payload: [] })

    return { success: true }
  }

  // Update profile in localStorage
  const updateProfile = async (data: { name?: string; phone?: string; address?: unknown }): Promise<boolean> => {
    if (!state.user) return false
    const users = getStoredUsers()
    const idx = users.findIndex(u => u.id === state.user!.id)
    if (idx === -1) return false

    if (data.name) users[idx].name = data.name.trim()
    if (data.phone !== undefined) users[idx].phone = data.phone
    if (data.address !== undefined) users[idx].address = data.address

    saveStoredUsers(users)

    const sessionUser = getSession()
    if (sessionUser) {
      if (data.name) sessionUser.name = data.name.trim()
      if (data.phone !== undefined) sessionUser.phone = data.phone
      if (data.address !== undefined) sessionUser.address = data.address
      setSession(sessionUser)
    }

    dispatch({ type: 'LOGIN', payload: users[idx] as unknown as User })
    return true
  }

  // Upload avatar - saves WebP data URL to user record in localStorage
  const uploadAvatar = async (dataUrl: string): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
    if (!state.user) return { success: false, error: 'Unauthorized' }
    try {
      const users = getStoredUsers()
      const idx = users.findIndex(u => u.id === state.user!.id)
      if (idx === -1) return { success: false, error: 'User not found' }

      users[idx].avatar = dataUrl
      saveStoredUsers(users)

      const session = getSession()
      if (session) {
        session.avatar = dataUrl
        setSession(session)
      }

      dispatch({ type: 'LOGIN', payload: users[idx] as unknown as User })
      return { success: true, avatarUrl: dataUrl }
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        return { success: false, error: 'Browser storage quota reached. Please use a smaller photo.' }
      }
      return { success: false, error: 'Failed to save avatar image.' }
    }
  }

  // Remove avatar - falls back to initials
  const removeAvatar = async (): Promise<boolean> => {
    if (!state.user) return false
    const users = getStoredUsers()
    const idx = users.findIndex(u => u.id === state.user!.id)
    if (idx === -1) return false

    delete users[idx].avatar
    saveStoredUsers(users)

    const session = getSession()
    if (session) {
      delete session.avatar
      setSession(session)
    }

    dispatch({ type: 'LOGIN', payload: users[idx] as unknown as User })
    return true
  }

  const addToCart = (book: Book, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { book, quantity } })
  }

  const removeFromCart = (bookId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: bookId })
  }

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId)
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { bookId, quantity } })
    }
  }

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const getCartTotal = () => {
    // Recalculate totals directly from mockBooks catalog
    const subtotal = state.cart.reduce((sum, item) => {
      const catalogBook = books.find(b => b.id === item.book.id) || item.book
      return sum + catalogBook.price * item.quantity
    }, 0)
    const shippingCost = state.shipping?.method === 'express' ? 200 : state.shipping?.method === 'sameday' ? 300 : 100
    const finalShipping = state.shipping?.method === 'standard' && subtotal >= 1000 ? 0 : shippingCost
    const discount = 0
    const codFee = state.payment.method === 'cod' ? 50 : 0
    return {
      subtotal,
      shipping: finalShipping,
      discount,
      total: subtotal + finalShipping - discount + codFee,
    }
  }

  const addToWishlist = (book: Book) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: book })
  }

  const removeFromWishlist = (bookId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: bookId })
  }

  const moveToCart = (bookId: string) => {
    dispatch({ type: 'MOVE_TO_CART', payload: bookId })
  }

  const isInWishlist = (bookId: string) => {
    return state.wishlist.some(item => item.book.id === bookId || item.book.slug === bookId)
  }

  const setShipping = (info: ShippingInfo) => {
    dispatch({ type: 'SET_SHIPPING', payload: info })
  }

  const setPaymentMethod = (method: 'esewa' | 'khalti' | 'cod') => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method })
  }

  const processPayment = async (): Promise<boolean> => {
    dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'processing' })
    await new Promise(resolve => setTimeout(resolve, 1200))

    if (state.payment.method === 'cod') {
      dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'success' })
      return true
    }
    if (state.payment.method === 'esewa') {
      dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'otp' })
    } else if (state.payment.method === 'khalti') {
      dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'mpin' })
    }
    return true
  }

  const setCheckoutStep = (step: number) => {
    dispatch({ type: 'SET_CHECKOUT_STEP', payload: step })
  }

  // Place order: Demo guard and price recalculation from mockBooks
  const placeOrder = async (
    transactionIdOverride?: string
  ): Promise<{ success: boolean; order?: Order; error?: string; status?: number }> => {
    // Demo only: Client-side purchase check. Real enforcement needs a backend.
    if (!state.user) {
      return { success: false, error: 'Unauthorized. Please sign in to place an order.', status: 401 }
    }

    if (state.cart.length === 0) {
      return { success: false, error: 'Your cart is empty.', status: 400 }
    }

    // Require complete delivery address before placing order
    const userAddr = typeof state.user.address === 'object' && state.user.address !== null
      ? (state.user.address as Record<string, string | undefined>)
      : null

    const addrName = state.shipping?.name || state.user.name || ''
    const addrPhone = state.shipping?.phone || state.user.phone || ''
    const addrLine1 = state.shipping?.line1 || userAddr?.line1 || userAddr?.tole || ''
    const addrCity = state.shipping?.city || userAddr?.city || userAddr?.municipality || ''
    const addrDistrict = state.shipping?.district || userAddr?.district || 'Kathmandu'
    const addrProvince = state.shipping?.province || userAddr?.province || 'Bagmati'

    if (!addrName.trim() || !addrPhone.trim() || !addrLine1.trim() || !addrCity.trim()) {
      return {
        success: false,
        error: 'Please provide a complete delivery address (name, phone, street/tole, city).',
        status: 400,
      }
    }

    // Recalculate totals directly from mockBooks catalog (never trust client prices)
    let subtotal = 0
    const verifiedItems = state.cart.map(item => {
      const catalogBook = books.find(b => b.id === item.book.id || b.slug === item.book.id) || item.book
      const verifiedPrice = catalogBook.price
      subtotal += verifiedPrice * item.quantity
      return {
        bookId: catalogBook.id,
        quantity: item.quantity,
        price: verifiedPrice,
        format: 'Paperback',
      }
    })

    const shippingMethod = state.shipping?.method || 'standard'
    let shippingCost = shippingMethod === 'express' ? 200 : shippingMethod === 'sameday' ? 300 : 100
    if (shippingMethod === 'standard' && subtotal >= 1000) {
      shippingCost = 0
    }
    const codFee = state.payment.method === 'cod' ? 50 : 0
    const total = subtotal + shippingCost + codFee

    const now = new Date()
    const deliveryDays = shippingMethod === 'express' ? 3 : shippingMethod === 'sameday' ? 0 : 7
    const estimatedDelivery = new Date(now.getTime() + deliveryDays * 86400000).toISOString().slice(0, 10)

    const newOrder: Order = {
      id: `Yetaxahai-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: state.user.id,
      items: verifiedItems,
      subtotal,
      shipping: shippingCost,
      discount: 0,
      total,
      status: 'confirmed',
      paymentMethod: state.payment.method || 'cod',
      paymentStatus: state.payment.method === 'cod' ? 'pending' : 'paid',
      transactionId: transactionIdOverride || state.payment.transactionId || `TXN-DEMO-${Date.now()}`,
      createdAt: now.toISOString(),
      estimatedDelivery,
      shippingAddress: {
        name: addrName.trim(),
        phone: addrPhone.trim(),
        line1: addrLine1.trim(),
        line2: state.shipping?.line2 || userAddr?.line2 || '',
        city: addrCity.trim(),
        district: addrDistrict,
        province: addrProvince,
        postalCode: state.shipping?.postalCode || userAddr?.postalCode || '44600',
        notes: state.shipping?.notes || '',
      },
      shippingMethod,
    }

    // Save order in localStorage per user
    try {
      const orderKey = STORAGE_KEYS.ORDERS_PREFIX + state.user.id
      const existingOrdersRaw = localStorage.getItem(orderKey)
      const existingOrders: Order[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : []
      existingOrders.unshift(newOrder)
      localStorage.setItem(orderKey, JSON.stringify(existingOrders))
      dispatch({ type: 'PLACE_ORDER', payload: newOrder })
    } catch (err) {
      console.error('Failed to save order to localStorage:', err)
    }

    return { success: true, order: newOrder }
  }

  // Admin stats
  const adminStats: AdminStats = {
    totalRevenue: 425000,
    totalOrders: 1247,
    totalUsers: 856,
    totalBooks: books.length,
    revenueChange: 12.5,
    ordersChange: 8.3,
    usersChange: 15.2,
    booksChange: 5.1,
  }

  return (
    <StoreContext.Provider
      value={{
        state,
        user: state.user,
        cart: state.cart,
        wishlist: state.wishlist.map(w => w.book),
        orders: state.orders,
        shipping: state.shipping,
        payment: state.payment,
        checkoutStep: state.checkoutStep,
        adminStats,
        dispatch,
        isAuthLoading,
        login,
        logout,
        register,
        updateProfile,
        uploadAvatar,
        removeAvatar,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        isInWishlist,
        setShipping,
        setPaymentMethod,
        setPaymentStatus: (status) => dispatch({ type: 'SET_PAYMENT_STATUS', payload: status }),
        setTransactionId: (id) => dispatch({ type: 'SET_TRANSACTION_ID', payload: id }),
        processPayment,
        setCheckoutStep,
        placeOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
