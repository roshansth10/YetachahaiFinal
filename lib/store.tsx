'use client'

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
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
    case 'PLACE_ORDER':
      return {
        ...state,
        orders: [...state.orders, action.payload],
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
  // Auth
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (data: { email: string; password: string; name: string; phone?: string; address?: string }) => boolean
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => void
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
  placeOrder: () => Order
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yetaxahai-store')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
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

  // Save to localStorage on state change
  useEffect(() => {
    const toSave = {
      user: state.user,
      cart: state.cart.map(item => ({ book: { id: item.book.id }, quantity: item.quantity })),
      wishlist: state.wishlist.map(item => ({ book: { id: item.book.id }, addedAt: item.addedAt })),
      orders: state.orders,
    }
    localStorage.setItem('yetaxahai-store', JSON.stringify(toSave))
  }, [state.user, state.cart, state.wishlist, state.orders])

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
      dispatch({ type: 'LOGIN', payload: user })
      return true
    }
    return false
  }

  const logout = () => dispatch({ type: 'LOGOUT' })

  const register = (data: { email: string; password: string; name: string; phone?: string; address?: string }): boolean => {
    // Check if email already exists
    const existingUser = users.find(u => u.email === data.email)
    if (existingUser) return false

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'customer',
      phone: data.phone,
      memberSince: new Date().toISOString(),
      booksOrdered: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'LOGIN', payload: newUser })
    return true
  }

  const updateProfile = (data: { name?: string; phone?: string; address?: string }) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...data }
      dispatch({ type: 'LOGIN', payload: updatedUser })
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

  const placeOrder = (): Order => {
    const totals = getCartTotal()
    const now = new Date()
    const orderId = `Yetaxahai-${now.getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`
    
    let transactionId: string | undefined
    if (state.payment.method === 'esewa') {
      transactionId = `TXN-ESW-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    } else if (state.payment.method === 'khalti') {
      transactionId = `KHL-TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${now.getFullYear()}`
    }

    const deliveryDays = state.shipping?.method === 'express' ? 3 : state.shipping?.method === 'sameday' ? 0 : 7
    const estimatedDelivery = new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000)

    const order: Order = {
      id: orderId,
      userId: state.user?.id || 'guest',
      items: state.cart.map(item => ({
        bookId: item.book.id,
        quantity: item.quantity,
        price: item.book.price,
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      status: 'confirmed',
      paymentMethod: state.payment.method || 'cod',
      paymentStatus: state.payment.method === 'cod' ? 'pending' : 'paid',
      transactionId,
      paymentDate: state.payment.method !== 'cod' ? now.toISOString() : undefined,
      shippingAddress: {
        name: state.shipping?.name || '',
        phone: state.shipping?.phone || '',
        line1: state.shipping?.line1 || '',
        line2: state.shipping?.line2,
        city: state.shipping?.city || '',
        district: state.shipping?.district || '',
        province: state.shipping?.province || '',
        postalCode: state.shipping?.postalCode || '',
        notes: state.shipping?.notes,
      },
      shippingMethod: state.shipping?.method || 'standard',
      createdAt: now.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString().slice(0, 10),
    }

    dispatch({ type: 'PLACE_ORDER', payload: order })
    return order
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
        // Auth
        login,
        logout,
        register,
        updateProfile,
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
