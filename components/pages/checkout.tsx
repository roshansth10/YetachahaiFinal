'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, ChevronRight, Truck, CreditCard, MapPin, ShieldCheck, Lock, 
  Banknote, Package, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import { nepalCities, nepalDistricts, nepalProvinces } from '@/lib/data'
import { toast } from 'sonner'

// Payment Modal Components
import EsewaPaymentModal from '@/components/payment/esewa-modal'
import KhaltiPaymentModal from '@/components/payment/khalti-modal'
import OrderConfirmation from '@/components/payment/order-confirmation'

interface CheckoutPageProps {
  onNavigate: (page: string, data?: unknown) => void
}

export default function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { state, setShipping, setPaymentMethod, setCheckoutStep, getCartTotal, placeOrder, dispatch } = useStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEsewaModal, setShowEsewaModal] = useState(false)
  const [showKhaltiModal, setShowKhaltiModal] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<ReturnType<typeof placeOrder> | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    notes: '',
    shippingMethod: 'standard' as 'standard' | 'express' | 'sameday',
  })

  // Form validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({})

  // Payment form state
  const [esewaId, setEsewaId] = useState('')
  const [khaltiNumber, setKhaltiNumber] = useState('')
  const [paymentErrors, setPaymentErrors] = useState<{ esewa?: string; khalti?: string }>({})

  const totals = getCartTotal()
  const isEmpty = state?.cart?.length === 0

  // Populate form data with user info when state is ready
  useEffect(() => {
    if (state?.user) {
      setFormData(prev => ({
        ...prev,
        name: state.user?.name || '',
        email: state.user?.email || '',
        phone: state.user?.phone || '',
        line1: state.user?.address?.line1 || '',
        line2: state.user?.address?.line2 || '',
        city: state.user?.address?.city || '',
        district: state.user?.address?.district || '',
        province: state.user?.address?.province || '',
        postalCode: state.user?.address?.postalCode || '',
      }))
    }
  }, [state?.user])

  useEffect(() => {
    if (isEmpty) {
      onNavigate('cart')
    }
  }, [isEmpty, onNavigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof typeof errors]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof typeof errors]
        return newErrors
      })
    }
  }

  const validateShippingForm = () => {
    const newErrors: typeof errors = {}
    
    if (!formData.name?.trim()) newErrors.name = 'Full name is required'
    if (!formData.email?.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\+?977[-\s]?9[78]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid Nepal phone number (e.g., 98XXXXXXXX or +977-98XXXXXXXX)'
    }
    
    if (!formData.line1?.trim()) newErrors.line1 = 'Address is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    if (!formData.district?.trim()) newErrors.district = 'District is required'
    if (!formData.province?.trim()) newErrors.province = 'Province is required'
    if (!formData.postalCode?.trim()) newErrors.postalCode = 'Postal code is required'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix all errors before continuing')
      return false
    }
    return true
  }

  const handleShippingSubmit = () => {
    if (!validateShippingForm()) return
    setShipping({
      ...formData,
      method: formData.shippingMethod,
    })
    setCheckoutStep(2)
  }

  const handlePaymentSelect = (method: 'esewa' | 'khalti' | 'cod') => {
    setPaymentMethod(method)
  }

  const handleProceedToPayment = () => {
    if (!state?.payment?.method) {
      toast.error('Please select a payment method')
      return
    }

    if (state?.payment?.method === 'esewa') {
      if (!esewaId) {
        toast.error('Please enter your eSewa ID')
        return
      }
      setShowEsewaModal(true)
    } else if (state?.payment?.method === 'khalti') {
      if (!khaltiNumber || !/^98\d{8}$/.test(khaltiNumber)) {
        toast.error('Please enter a valid Khalti mobile number')
        return
      }
      setShowKhaltiModal(true)
    } else {
      // COD
      handleCODPayment()
    }
  }

  const handleCODPayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      const order = placeOrder()
      setCompletedOrder(order)
      setCheckoutStep(3)
      setIsProcessing(false)
    }, 1500)
  }

  const handlePaymentSuccess = (transactionId: string) => {
    dispatch({ type: 'SET_TRANSACTION_ID', payload: transactionId })
    dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'success' })
    const order = placeOrder()
    setCompletedOrder(order)
    setCheckoutStep(3)
    setShowEsewaModal(false)
    setShowKhaltiModal(false)
  }

  // Calculate shipping cost based on method
  const getShippingCost = (method: string) => {
    switch (method) {
      case 'express': return 200
      case 'sameday': return 300
      default: return 100
    }
  }

  const currentShippingCost = getShippingCost(formData.shippingMethod)
  const codFee = state?.payment?.method === 'cod' ? 50 : 0
  const finalTotal = totals.subtotal + currentShippingCost + codFee

  // Step indicator
  const steps = [
    { number: 1, label: 'Shipping' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Confirmation' },
  ]

  if (state?.checkoutStep === 3 && completedOrder) {
    return <OrderConfirmation order={completedOrder} />
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-medium transition-colors ${
                  (state?.checkoutStep ?? 0) >= step.number 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {(state?.checkoutStep ?? 0) > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  (state?.checkoutStep ?? 0) >= step.number ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping */}
              {state?.checkoutStep === 1 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card rounded-2xl shadow-warm p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Shipping Information
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
                        Personal Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className={errors.name ? 'text-red-500' : ''}>Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={`mt-2 bg-background ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <Label htmlFor="email" className={errors.email ? 'text-red-500' : ''}>Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                            className={`mt-2 bg-background ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="phone" className={errors.phone ? 'text-red-500' : ''}>Phone Number *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+977-98XXXXXXXX"
                            className={`mt-2 bg-background ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                          {!errors.phone && <p className="text-xs text-muted-foreground mt-1">
                            Nepal format: +977-98XXXXXXXX or 98XXXXXXXX
                          </p>}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Section */}
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
                        Shipping Address
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="line1" className={errors.line1 ? 'text-red-500' : ''}>Street Address *</Label>
                          <Input
                            id="line1"
                            name="line1"
                            value={formData.line1}
                            onChange={handleInputChange}
                            placeholder="Street address"
                            className={`mt-2 bg-background ${errors.line1 ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                          <Input
                            id="line2"
                            name="line2"
                            value={formData.line2}
                            onChange={handleInputChange}
                            placeholder="Apartment, suite, etc."
                            className="mt-2 bg-background"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city" className={errors.city ? 'text-red-500' : ''}>City *</Label>
                          <Select value={formData.city} onValueChange={(v) => handleSelectChange('city', v)}>
                            <SelectTrigger className={`mt-2 bg-background ${errors.city ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {nepalCities.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <Label htmlFor="district" className={errors.district ? 'text-red-500' : ''}>District *</Label>
                          <Select value={formData.district} onValueChange={(v) => handleSelectChange('district', v)}>
                            <SelectTrigger className={`mt-2 bg-background ${errors.district ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              {nepalDistricts.map(district => (
                                <SelectItem key={district} value={district}>{district}</SelectItem>
                              ))}
                            </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <Select value={formData.province} onValueChange={(v) => handleSelectChange('province', v)}>
                        <SelectTrigger className="mt-1 bg-background">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {nepalProvinces.map(province => (
                            <SelectItem key={province} value={province}>{province}</SelectItem>
                          ))}
                            </SelectContent>
                          </Select>
                          {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                        </div>
                        <div>
                          <Label htmlFor="province" className={errors.province ? 'text-red-500' : ''}>Province *</Label>
                          <Select value={formData.province} onValueChange={(v) => handleSelectChange('province', v)}>
                            <SelectTrigger className={`mt-2 bg-background ${errors.province ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent>
                              {nepalProvinces.map(province => (
                                <SelectItem key={province} value={province}>{province}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                        </div>
                        <div>
                          <Label htmlFor="postalCode" className={errors.postalCode ? 'text-red-500' : ''}>Postal Code *</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            placeholder="44600"
                            className={`mt-2 bg-background ${errors.postalCode ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Any special instructions for delivery (e.g., 'Please call before delivery', 'Leave at gate')"
                            className="mt-2 bg-background resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Method Section */}
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
                        Shipping Method
                      </h3>
                      <div className="space-y-3">
                        {[
                          { id: 'standard', label: 'Standard Delivery', price: 100, time: '5-7 days', icon: Package },
                          { id: 'express', label: 'Express Delivery', price: 200, time: '2-3 days', icon: Truck },
                          { id: 'sameday', label: 'Same Day (Kathmandu Valley)', price: 300, time: 'Today', icon: Truck },
                        ].map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                              formData.shippingMethod === method.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <input
                            type="radio"
                            name="shippingMethod"
                            value={method.id}
                            checked={formData.shippingMethod === method.id}
                            onChange={(e) => handleSelectChange('shippingMethod', e.target.value)}
                            className="sr-only"
                          />
                          <method.icon className="w-6 h-6 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{method.label}</p>
                            <p className="text-sm text-muted-foreground">{method.time}</p>
                          </div>
                            <span className="font-mono font-medium text-foreground">Rs {method.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      size="lg"
                      onClick={handleShippingSubmit}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8"
                    >
                      Continue to Payment
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {state?.checkoutStep === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Shipping
                  </button>

                  <div className="bg-card rounded-2xl shadow-warm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-display text-xl font-semibold text-foreground">
                        Payment Method
                      </h2>
                    </div>

                    {/* eSewa */}
                    <div className={`mb-4 rounded-2xl border-2 transition-colors overflow-hidden ${
                      state?.payment?.method === 'esewa' ? 'border-esewa' : 'border-border'
                    }`}>
                      <label
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                          state?.payment?.method === 'esewa' ? 'bg-esewa/5' : 'hover:bg-muted'
                        }`}
                        style={{ borderLeft: state?.payment?.method === 'esewa' ? '4px solid #60BB46' : '4px solid transparent' }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="esewa"
                          checked={state?.payment?.method === 'esewa'}
                          onChange={() => handlePaymentSelect('esewa')}
                          className="sr-only"
                        />
                        <div className="w-12 h-12 bg-esewa/10 rounded-xl flex items-center justify-center">
                          <span className="font-bold text-esewa text-lg">e</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Pay with eSewa</p>
                          <p className="text-sm text-muted-foreground">{"Nepal's most trusted digital wallet"}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          state?.payment?.method === 'esewa' ? 'border-esewa bg-esewa' : 'border-muted-foreground'
                        }`}>
                          {state?.payment?.method === 'esewa' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </label>

                      <AnimatePresence>
                        {state?.payment?.method === 'esewa' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 space-y-4">
                              <div>
                                <Label htmlFor="esewaId">eSewa ID</Label>
                                <Input
                                  id="esewaId"
                                  value={esewaId}
                                  onChange={(e) => setEsewaId(e.target.value)}
                                  placeholder="9800000000 or your registered email"
                                  className="mt-1 bg-background"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Enter your eSewa registered mobile number or email
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Lock className="w-3 h-3" />
                                <span>Secured by eSewa payment gateway</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Khalti */}
                    <div className={`mb-4 rounded-2xl border-2 transition-colors overflow-hidden ${
                      state?.payment?.method === 'khalti' ? 'border-khalti' : 'border-border'
                    }`}>
                      <label
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                          state?.payment?.method === 'khalti' ? 'bg-khalti/5' : 'hover:bg-muted'
                        }`}
                        style={{ borderLeft: state?.payment?.method === 'khalti' ? '4px solid #5C2D91' : '4px solid transparent' }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="khalti"
                          checked={state?.payment?.method === 'khalti'}
                          onChange={() => handlePaymentSelect('khalti')}
                          className="sr-only"
                        />
                        <div className="w-12 h-12 bg-khalti/10 rounded-xl flex items-center justify-center">
                          <span className="font-bold text-khalti text-lg">K</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Pay with Khalti</p>
                          <p className="text-sm text-muted-foreground">Fast, secure digital payments</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          state?.payment?.method === 'khalti' ? 'border-khalti bg-khalti' : 'border-muted-foreground'
                        }`}>
                          {state?.payment?.method === 'khalti' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </label>

                      <AnimatePresence>
                        {state?.payment?.method === 'khalti' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 space-y-4">
                              <div>
                                <Label htmlFor="khaltiNumber">Khalti Mobile Number</Label>
                                <Input
                                  id="khaltiNumber"
                                  value={khaltiNumber}
                                  onChange={(e) => setKhaltiNumber(e.target.value)}
                                  placeholder="98XXXXXXXX"
                                  className="mt-1 bg-background"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Enter your Khalti registered mobile number
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Lock className="w-3 h-3" />
                                <span>Secured by Khalti payment gateway</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* COD */}
                    <div className={`rounded-2xl border-2 transition-colors overflow-hidden ${
                      state?.payment?.method === 'cod' ? 'border-primary' : 'border-border'
                    }`}>
                      <label
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                          state?.payment?.method === 'cod' ? 'bg-primary/5' : 'hover:bg-muted'
                        }`}
                        style={{ borderLeft: state?.payment?.method === 'cod' ? '4px solid #D4522A' : '4px solid transparent' }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={state?.payment?.method === 'cod'}
                          onChange={() => handlePaymentSelect('cod')}
                          className="sr-only"
                        />
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Banknote className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when your books arrive</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          state?.payment?.method === 'cod' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {state?.payment?.method === 'cod' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </label>

                      <AnimatePresence>
                        {state?.payment?.method === 'cod' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0">
                              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                                COD available for orders up to Rs 5,000. Extra Rs 50 COD handling fee applies.
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Security Badges */}
                    <div className="mt-8 p-4 bg-muted rounded-xl">
                      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          <span>SSL Secured</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          <span>256-bit Encryption</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          <span>NRB Licensed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          <span>PCI DSS Compliant</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button
                        size="lg"
                        onClick={handleProceedToPayment}
                        disabled={!state?.payment?.method || isProcessing}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : state?.payment?.method === 'cod' ? (
                          'Place Order'
                        ) : (
                          `Pay Rs ${finalTotal}`
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl shadow-warm p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {state?.cart?.map((item) => (
                  <div key={item.book.id} className="flex gap-3">
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.book.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-mono text-sm font-medium text-foreground">
                      Rs {item.book.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono text-foreground">Rs {totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono text-foreground">Rs {currentShippingCost}</span>
                </div>
                {state?.payment?.method === 'cod' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">COD Fee</span>
                    <span className="font-mono text-foreground">Rs 50</span>
                  </div>
                )}
                <div className="h-px bg-border my-3" />
                <div className="flex justify-between">
                  <span className="font-display font-semibold text-foreground">Total</span>
                  <span className="font-mono text-xl font-bold text-primary">Rs {finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modals */}
      <EsewaPaymentModal
        isOpen={showEsewaModal}
        onClose={() => setShowEsewaModal(false)}
        amount={finalTotal}
        esewaId={esewaId}
        onSuccess={handlePaymentSuccess}
      />

      <KhaltiPaymentModal
        isOpen={showKhaltiModal}
        onClose={() => setShowKhaltiModal(false)}
        amount={finalTotal}
        khaltiNumber={khaltiNumber}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}
