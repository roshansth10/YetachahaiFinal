'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { formatPrice, books } from '@/lib/data'
import { toast } from 'sonner'

interface CartPageProps {
  onNavigate: (page: string, data?: unknown) => void
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useStore()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const totals = getCartTotal()
  const isEmpty = cart.length === 0

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'WELCOME10') {
      setAppliedCoupon('WELCOME10')
      toast.success('Coupon applied!', {
        description: '10% discount has been applied to your order.',
      })
    } else if (couponCode.trim().toUpperCase() === 'FLAT100') {
      setAppliedCoupon('FLAT100')
      toast.success('Coupon applied!', {
        description: 'Rs 100 off has been applied to your order.',
      })
    } else {
      toast.error('Invalid coupon code')
    }
    setCouponCode('')
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    toast.success('Coupon removed')
  }

  // Calculate discount based on coupon
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon === 'WELCOME10') {
      return Math.min(totals.subtotal * 0.1, 200)
    }
    if (appliedCoupon === 'FLAT100' && totals.subtotal >= 1000) {
      return 100
    }
    return 0
  }

  const discount = calculateDiscount()
  const finalTotal = totals.subtotal + totals.shipping - discount

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added any books to your cart yet. Start browsing and find your next great read!
          </p>
          <Button onClick={() => onNavigate('catalog')} className="bg-primary hover:bg-primary/90">
            Browse Books
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-4xl font-bold text-foreground mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
            <AnimatePresence>
              {cart.map((item) => {
                const book = books.find(b => b.id === item.bookId)
                if (!book) return null
                return (
                  <motion.div
                    key={item.bookId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 p-6 border-b border-border last:border-b-0"
                  >
                    <button 
                      onClick={() => onNavigate('book', book.id)}
                      className="shrink-0"
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-24 h-36 object-cover rounded-lg"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button 
                        onClick={() => onNavigate('book', book.id)}
                        className="text-left"
                      >
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                          {book.title}
                        </h3>
                      </button>
                      <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                      <p className="font-mono text-lg font-bold text-primary">{formatPrice(book.price)}</p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Remove */}
                        <button
                          onClick={() => {
                            removeFromCart(item.bookId)
                            toast.success('Item removed from cart')
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-mono font-bold text-foreground">
                        {formatPrice(book.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Clear Cart */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => onNavigate('catalog')}
              className="text-primary hover:underline text-sm"
            >
              Continue Shopping
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearCart()
                toast.success('Cart cleared')
              }}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 className="font-semibold text-lg text-foreground mb-6">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-accent" />
                    <span className="font-medium text-foreground">{appliedCoupon}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-mono">{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount</span>
                  <span className="font-mono">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-mono text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              size="lg"
              onClick={() => onNavigate('checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Free shipping on orders over Rs 1,000
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
