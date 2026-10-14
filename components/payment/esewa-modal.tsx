'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EsewaPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  esewaId: string
  onSuccess: (transactionId: string) => void
}

export default function EsewaPaymentModal({
  isOpen,
  onClose,
  amount,
  esewaId,
  onSuccess,
}: EsewaPaymentModalProps) {
  const [step, setStep] = useState<'verify' | 'otp' | 'success'>('verify')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!isOpen) {
      setStep('verify')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      setCanResend(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [step, countdown])

  // Auto-fill OTP after 3 seconds for demo
  useEffect(() => {
    if (step === 'otp') {
      const timer = setTimeout(() => {
        setOtp(['1', '2', '3', '4', '5', '6'])
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleVerify = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setStep('otp')
    }, 1500)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleConfirmPayment = () => {
    if (otp.some(digit => !digit)) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setStep('success')
      const transactionId = `TXN-ESW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setTimeout(() => {
        onSuccess(transactionId)
      }, 2000)
    }, 1500)
  }

  const handleResendOtp = () => {
    setCountdown(60)
    setCanResend(false)
    setOtp(['', '', '', '', '', ''])
  }

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
          <div className="bg-esewa p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="font-bold text-esewa text-xl">e</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">eSewa</h3>
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
              {/* Verify Step */}
              {step === 'verify' && (
                <motion.div
                  key="verify"
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
                    <p className="text-sm text-muted-foreground mb-1">eSewa ID</p>
                    <p className="font-medium text-foreground">{esewaId}</p>
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={isProcessing}
                    className="w-full h-12 bg-esewa hover:bg-esewa/90 text-white rounded-xl font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Pay'
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Secured by eSewa payment gateway</span>
                  </div>
                </motion.div>
              )}

              {/* OTP Step */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h4 className="font-display font-semibold text-foreground text-lg">
                      OTP Verification
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      OTP sent to your eSewa registered number
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold bg-muted border-2 focus:border-esewa rounded-xl"
                      />
                    ))}
                  </div>

                  {/* Countdown & Resend */}
                  <div className="text-center">
                    {!canResend ? (
                      <p className="text-sm text-muted-foreground">
                        Resend OTP in <span className="font-mono font-medium text-esewa">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        className="text-sm text-esewa hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Demo: OTP will auto-fill in 3 seconds
                  </p>

                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing || otp.some(d => !d)}
                    className="w-full h-12 bg-esewa hover:bg-esewa/90 text-white rounded-xl font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Payment'
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
                    className="w-20 h-20 bg-esewa rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h4 className="font-display font-semibold text-foreground text-xl mb-2">
                    eSewa Payment Successful
                  </h4>
                  <p className="font-mono text-sm text-muted-foreground mb-4">
                    TXN-ESW-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-XXXXXX
                  </p>
                  <p className="text-muted-foreground">
                    Amount deducted: <span className="font-mono font-bold text-foreground">Rs {amount.toLocaleString()}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
