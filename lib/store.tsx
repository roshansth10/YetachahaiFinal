'use client'

import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react'
import { mockBooks as books, mockUsers as users, type Book, type User, type Order } from './data'

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
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (data: { email: string; password: string; name: string; phone?: string; address?: string }) => Promise<boolean>
  updateProfile: (data: { name?: string; phone?: string; address?: unknown }) => Promise<boolean>
  uploadAvatar: (file: Blob | File) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>
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
  const mergeGuestCartOnLogin = (guestCart: CartItem[], loggedInUser: User) => {
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

  // 1. Check authenticated session from secure httpOnly cookie on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          dispatch({ type: 'LOGIN', payload: data.user })
          // Restore user's orders from server
          fetch('/api/orders')
            .then(r => r.json())
            .then(orderData => {
              if (orderData?.orders) {
                dispatch({ type: 'SET_ORDERS', payload: orderData.orders })
              }
            })
            .catch(() => {})
        }
      })
      .catch(err => {
        console.error('Failed to restore session:', err)
      })
      .finally(() => {
        setIsAuthLoading(false)
      })
  }, [])

  // 2. Load cart, wishlist, and orders from localStorage on mount (NEVER restore user from localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('yetaxahai-store')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Strictly remove any legacy user to prevent automatic login
        delete parsed.user
        // Rehydrate book references
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

  // 3. Save to localStorage on state change (ONLY cart, wishlist, orders - NEVER user)
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        dispatch({ type: 'LOGIN', payload: data.user })
        mergeGuestCartOnLogin(state.cart, data.user)
        fetch('/api/orders')
          .then(r => r.json())
          .then(orderData => {
            if (orderData?.orders) {
              dispatch({ type: 'SET_ORDERS', payload: orderData.orders })
            }
          })
          .catch(() => {})
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    if (state.user) {
      try {
        localStorage.setItem(
          `yetaxahai_account_cart_${state.user.id}`,
          JSON.stringify(state.cart.map(i => ({ book: { id: i.book.id }, quantity: i.quantity })))
        )
      } catch {}
    }
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
    } catch {
      // ignore
    }
  }

  const register = async (data: { email: string; password: string; name: string; phone?: string; address?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result.user) {
        dispatch({ type: 'LOGIN', payload: result.user })
        mergeGuestCartOnLogin(state.cart, result.user)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const updateProfile = async (data: { name?: string; phone?: string; address?: unknown }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result.user) {
        dispatch({ type: 'LOGIN', payload: result.user })
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const uploadAvatar = async (file: Blob | File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.user) {
        dispatch({ type: 'LOGIN', payload: data.user })
        return { success: true, avatarUrl: data.avatarUrl }
      }
      return { success: false, error: data.error || 'Failed to upload photo.' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while uploading.' }
    }
  }

  const removeAvatar = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/avatar', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.user) {
        dispatch({ type: 'LOGIN', payload: data.user })
        return true
      }
      return false
    } catch {
      return false
    }
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
    const subtotal = state.cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0)
    const shippingCost = state.shipping?.method === 'express' ? 200 : state.shipping?.method === 'sameday' ? 300 : 100
    const discount = 0 // Could be calculated from coupons
    const codFee = state.payment.method === 'cod' ? 50 : 0
    return {
      subtotal,
      shipping: shippingCost,
      discount,
      total: subtotal + shippingCost - discount + codFee,
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

  const isInWishlist = (bookIdOrSlug: string) => {
    return state.wishlist.some(item => item.book.id === bookIdOrSlug || item.book.slug === bookIdOrSlug)
  }

  const setShipping = (info: ShippingInfo) => {
    dispatch({ type: 'SET_SHIPPING', payload: info })
  }

  const setPaymentMethod = (method: 'esewa' | 'khalti' | 'cod') => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method })
  }

  const processPayment = async (): Promise<boolean> => {
    // Simulate payment processing
    dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'processing' })
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (state.payment.method === 'cod') {
      dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'success' })
      return true
    }
    
    // For eSewa/Khalti, move to OTP/MPIN step
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

  const placeOrder = async (
    transactionIdOverride?: string
  ): Promise<{ success: boolean; order?: Order; error?: string; status?: number }> => {
    if (!state.user) {
      return { success: false, error: 'Unauthorized. Please sign in to place an order.', status: 401 }
    }

    try {
      const payload = {
        items: state.cart.map(item => ({
          bookId: item.book.id,
          quantity: item.quantity,
          format: 'Paperback',
        })),
        shippingAddress: {
          name: state.shipping?.name || state.user.name || '',
          phone: state.shipping?.phone || state.user.phone || '',
          line1: state.shipping?.line1 || '',
          line2: state.shipping?.line2 || '',
          city: state.shipping?.city || '',
          district: state.shipping?.district || '',
          province: state.shipping?.province || '',
          postalCode: state.shipping?.postalCode || '44600',
          notes: state.shipping?.notes || '',
        },
        shippingMethod: state.shipping?.method || 'standard',
        paymentMethod: state.payment.method || 'cod',
        transactionId: transactionIdOverride || state.payment.transactionId,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success && data.order) {
        dispatch({ type: 'PLACE_ORDER', payload: data.order })
        return { success: true, order: data.order }
      }

      return {
        success: false,
        error: data.error || 'Failed to place order.',
        status: res.status,
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error while placing order.',
      }
    }
  }

  // Admin stats computed
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
        // State access
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
        // Auth
        login,
        logout,
        register,
        updateProfile,
        uploadAvatar,
        removeAvatar,
        // Cart
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        // Wishlist
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        isInWishlist,
        // Checkout
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
