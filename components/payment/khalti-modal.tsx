'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Check, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KhaltiPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  khaltiNumber: string
  onSuccess: (transactionId: string) => void
}

export default function KhaltiPaymentModal({
  isOpen,
  onClose,
  amount,
  khaltiNumber,
  onSuccess,
}: KhaltiPaymentModalProps) {
  const [step, setStep] = useState<'initiate' | 'mpin' | 'success'>('initiate')
  const [mpin, setMpin] = useState(['', '', '', '', '', ''])
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!isOpen) {
      setStep('initiate')
      setMpin(['', '', '', '', '', ''])
    }
  }, [isOpen])

  const handleInitiate = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setStep('mpin')
    }, 1500)
  }

  const handleMpinChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newMpin = [...mpin]
    newMpin[index] = value
    setMpin(newMpin)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleMpinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleConfirmPayment = () => {
    if (mpin.some(digit => !digit)) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setStep('success')
      const transactionId = `KHL-TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`
      setTimeout(() => {
        onSuccess(transactionId)
      }, 2500)
    }, 1500)
  }

  const cashback = Math.floor(amount * 0.02) // 2% cashback

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-warm-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-khalti p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="font-bold text-khalti text-xl">K</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Khalti</h3>
                <p className="text-sm text-white/80">Digital Wallet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Initiate Step */}
              {step === 'initiate' && (
                <motion.div
                  key="initiate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-muted-foreground">You are paying</p>
                    <p className="font-mono text-3xl font-bold text-foreground mt-1">
                      Rs {amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">to Yetaxahai Bookstore</p>
                  </div>

                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Khalti Number</p>
                    <p className="font-medium text-foreground">{khaltiNumber}</p>
                  </div>

                  {/* Cashback Banner */}
                  <div className="p-3 bg-khalti/10 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-khalti/20 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-khalti" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-khalti">2% Cashback</p>
                      <p className="text-xs text-muted-foreground">Earn Rs {cashback} on this transaction</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleInitiate}
                    disabled={isProcessing}
                    className="w-full h-12 bg-khalti hover:bg-khalti/90 text-white rounded-xl font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Initiating...
                      </>
                    ) : (
                      'Pay with Khalti'
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Secured by Khalti payment gateway</span>
                  </div>
                </motion.div>
              )}

              {/* MPIN Step */}
              {step === 'mpin' && (
                <motion.div
                  key="mpin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Khalti-style MPIN header */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-khalti/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-khalti" />
                    </div>
                    <h4 className="font-display font-semibold text-foreground text-lg">
                      Enter your 6-digit MPIN
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Confirm payment of Rs {amount.toLocaleString()}
                    </p>
                  </div>

                  {/* MPIN Input - Dot style like Khalti */}
                  <div className="flex justify-center gap-3">
                    {mpin.map((digit, index) => (
                      <div key={index} className="relative">
                        <input
                          ref={(el) => { inputRefs.current[index] = el }}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleMpinChange(index, e.target.value)}
                          onKeyDown={(e) => handleMpinKeyDown(index, e)}
                          className="w-12 h-12 text-center text-2xl font-bold bg-muted border-2 border-transparent focus:border-khalti rounded-full outline-none transition-colors"
                        />
                        {digit && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-3 h-3 bg-foreground rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button className="block mx-auto text-sm text-khalti hover:underline">
                    Forgot MPIN?
                  </button>

                  <p className="text-xs text-center text-muted-foreground">
                    Demo: Enter any 6 digits to continue
                  </p>

                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing || mpin.some(d => !d)}
                    className="w-full h-12 bg-khalti hover:bg-khalti/90 text-white rounded-xl font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Success Step */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 bg-khalti rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h4 className="font-display font-semibold text-foreground text-xl mb-2">
                    Payment Successful via Khalti
                  </h4>
                  <p className="font-mono text-sm text-muted-foreground mb-4">
                    KHL-TXN-XXXXXX-{new Date().getFullYear()}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Merchant: <span className="text-foreground">Yetaxahai Bookstore</span>
                    </p>
                    <p className="text-muted-foreground">
                      Amount paid: <span className="font-mono font-bold text-foreground">Rs {amount.toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Cashback Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-khalti/10 rounded-full"
                  >
                    <Gift className="w-4 h-4 text-khalti" />
                    <span className="text-sm font-medium text-khalti">
                      You earned Rs {cashback} cashback!
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
