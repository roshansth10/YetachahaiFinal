'use client'

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Package, Mail, MapPin, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Order } from '@/lib/data'
import confetti from 'canvas-confetti'

interface OrderConfirmationProps {
  order: Order
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  useEffect(() => {
    // Fire confetti
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#D4522A', '#C9973A', '#00C49A', '#60BB46', '#5C2D91'],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#D4522A', '#C9973A', '#00C49A', '#60BB46', '#5C2D91'],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const getPaymentBadge = () => {
    switch (order.paymentMethod) {
      case 'esewa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-esewa/10 text-esewa text-sm font-medium rounded-full">
            <span className="w-4 h-4 bg-esewa rounded flex items-center justify-center text-white text-xs font-bold">e</span>
            eSewa
          </span>
        )
      case 'khalti':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-khalti/10 text-khalti text-sm font-medium rounded-full">
            <span className="w-4 h-4 bg-khalti rounded flex items-center justify-center text-white text-xs font-bold">K</span>
            Khalti
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            <CreditCard className="w-4 h-4" />
            Cash on Delivery
          </span>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, bounce: 0.5 }}
          className="relative w-28 h-28 mx-auto mb-8"
        >
          {/* Animated Circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#D4522A"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ strokeLinecap: 'round' }}
            />
          </svg>
          {/* Check Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-primary-foreground" strokeWidth={3} />
            </div>
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-3xl md:text-4xl font-bold italic text-foreground mb-4"
        >
          Order Placed Successfully!
        </motion.h1>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-muted-foreground mb-2">Order Number</p>
          <p className="font-mono text-xl font-bold text-foreground">{order.id}</p>
        </motion.div>

        {/* Payment Method Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mb-8"
        >
          {getPaymentBadge()}
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl shadow-warm p-6 text-left space-y-6 mb-8"
        >
          {/* Estimated Delivery */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium text-foreground">
                {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Items ({order.items.length})</p>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    Book #{item.bookId} x {item.quantity}
                  </span>
                  <span className="font-mono text-foreground">Rs {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-medium">
                <span className="text-foreground">Total</span>
                <span className="font-mono text-primary">Rs {order.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="flex items-start gap-4 pt-4 border-t border-border">
            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Address</p>
              <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.district}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.province} - {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Transaction ID */}
          {order.transactionId && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-sm text-foreground">{order.transactionId}</p>
            </div>
          )}
        </motion.div>

        {/* Confirmation Email Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8"
        >
          <Mail className="w-4 h-4" />
          <span>A confirmation has been sent to your email</span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/books">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl h-12 px-8">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/orders">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 px-8">
              Track Order
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
