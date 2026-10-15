"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { ADMIN_CREDENTIALS } from "@/lib/auth-constants"
import { toast } from "sonner"

interface AuthPageProps {
  onNavigate: (page: string, data?: unknown) => void
  initialMode?: "login" | "register" | "forgot"
  redirectTo?: string
}

export function validateRedirect(target?: string | null): string {
  if (!target) return "/"
  // Security: only allow internal relative paths. Strictly deny external URLs or protocol-relative URLs
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\") || target.includes("://")) {
    return "/"
  }
  return target
}

export default function AuthPage({ onNavigate, initialMode = "login", redirectTo }: AuthPageProps) {
  const { login, register, user } = useStore()
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state starts completely empty
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    address: "",
  })

  // Synchronize initialMode if it changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const validTarget = validateRedirect(redirectTo)
      if (validTarget.startsWith("/book/")) {
        onNavigate("book", validTarget.replace("/book/", ""))
      } else if (validTarget === "/cart") {
        onNavigate("cart")
      } else if (validTarget === "/wishlist") {
        onNavigate("wishlist")
      } else if (validTarget === "/checkout") {
        onNavigate("checkout")
      } else if (validTarget === "/profile") {
        onNavigate("profile")
      } else if (validTarget === "/browse" || validTarget === "/catalog") {
        onNavigate("catalog")
      } else {
        onNavigate("home")
      }
    }
  }, [user, redirectTo, onNavigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Error disappears when user edits a field
    setError("")
  }

  const handlePostAuthRedirect = () => {
    const validTarget = validateRedirect(redirectTo)
    if (validTarget.startsWith("/book/")) {
      onNavigate("book", validTarget.replace("/book/", ""))
    } else if (validTarget === "/cart") {
      onNavigate("cart")
    } else if (validTarget === "/wishlist") {
      onNavigate("wishlist")
    } else if (validTarget === "/checkout") {
      onNavigate("checkout")
    } else if (validTarget === "/profile") {
      onNavigate("profile")
    } else if (validTarget === "/browse" || validTarget === "/catalog") {
      onNavigate("catalog")
    } else {
      onNavigate("home")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.email.trim() || !formData.password) {
      setError("Invalid email or password.")
      setIsLoading(false)
      return
    }

    try {
      const result = await login(formData.email.trim(), formData.password)
      if (result.success) {
        toast.success("Welcome back!", {
          description: "You have signed in successfully.",
        })
        handlePostAuthRedirect()
      } else {
        // Red error box reads exactly "Invalid email or password."
        setError(result.error && result.error.includes("locked") ? result.error : "Invalid email or password.")
      }
    } catch {
      setError("Invalid email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.name.trim()) {
      setError("Please enter your full name.")
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.")
      setIsLoading(false)
      return
    }

    try {
      const result = await register({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      })

      if (result.success) {
        toast.success("Account created successfully!", {
          description: "Welcome to Yetaxahai bookstore.",
        })
        handlePostAuthRedirect()
      } else {
        setError(result.error || "An account with this email already exists.")
      }
    } catch {
      setError("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.email.trim()) {
      setError("Please enter your email address.")
      setIsLoading(false)
      return
    }

    await new Promise((r) => setTimeout(r, 600))
    setSuccess(`A password reset link has been dispatched to ${formData.email.trim()}.`)
    setIsLoading(false)
  }

  return (
    <div className="min-h-[100dvh] bg-[#faf6ee] dark:bg-background flex overflow-x-hidden">
      {/* Left Panel - Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden text-primary-foreground min-h-[100dvh]">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 max-w-xl mx-auto py-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-3 mb-6 group text-left"
              aria-label="Back to Yetaxahai Home"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center border border-white/20">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <span className="text-3xl font-serif font-bold italic tracking-tight text-white group-hover:text-accent transition-colors">
                  Yetaxahai
                </span>
                <p className="text-xs text-white/70 tracking-widest uppercase">Kathmandu, Nepal</p>
              </div>
            </button>

            <h1 className="text-3xl xl:text-4xl font-serif font-bold text-white mb-4 leading-tight">
              Curated Stories for
              <br />
              <span className="text-accent italic">Every Nepali Reader</span>
            </h1>

            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Sign in to manage your book orders across Nepal, track deliveries, save to your personal wishlist, and enjoy express Kathmandu delivery.
            </p>

            <div className="space-y-3">
              {[
                "100% Genuine, verified editions with real covers",
                "Cash on Delivery, eSewa & Khalti supported",
                "Fast door-to-door delivery across all 7 provinces",
                "Curated fiction, philosophy, sci-fi & non-fiction",
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-2.5 text-xs text-white/90"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Panel - Login & Register Forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[100dvh]">
        <div className="w-full max-w-md bg-card border border-border/80 p-6 sm:p-8 rounded-3xl shadow-xl my-auto">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 min-h-[44px]"
              aria-label="Back to Yetaxahai Home"
            >
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-2xl font-serif font-bold italic text-foreground">Yetaxahai</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN FORM */}
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">Sign In</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Enter your email and password to access your account
                  </p>
                  {redirectTo && redirectTo !== "/" && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs">
                      Redirecting to <span className="font-mono font-semibold ml-1">{validateRedirect(redirectTo)}</span> after sign in
                    </div>
                  )}
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="login-email" className="text-xs font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-11 rounded-xl text-base"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs font-semibold">Password</Label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot")
                          setError("")
                        }}
                        className="text-xs text-primary hover:underline font-medium min-h-[32px] flex items-center"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-11 h-11 rounded-xl text-base"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full min-h-[44px] h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Demo Account Quick-Fill */}
                  <div className="relative my-3 pt-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2.5 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                        Demo Accounts
                      </span>
                    </div>
                  </div>

                  {/* Single Full-Width Admin Demo Chip */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full min-h-[44px] h-auto py-2 px-3 flex flex-col items-start text-left rounded-xl border-border/80 hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        email: ADMIN_CREDENTIALS.email,
                        password: ADMIN_CREDENTIALS.password,
                      }))
                      setError("")
                    }}
                  >
                    <span className="font-semibold text-xs text-foreground">Admin Demo</span>
                    <span className="text-[11px] text-muted-foreground truncate w-full">{ADMIN_CREDENTIALS.email}</span>
                  </Button>

                  <p className="text-center text-xs text-muted-foreground pt-2">
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register")
                        setError("")
                      }}
                      className="text-primary font-semibold hover:underline min-h-[44px] inline-flex items-center px-1"
                    >
                      Create an account
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* REGISTER FORM */}
            {mode === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login")
                      setError("")
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 font-medium min-h-[36px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </button>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">Create Account</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Join Yetaxahai to track orders and save your favorite books
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name" className="text-xs font-semibold">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="reg-name"
                        name="name"
                        type="text"
                        placeholder="Ram Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 h-10 rounded-xl text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-xs font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-10 rounded-xl text-base"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="reg-phone" className="text-xs font-semibold">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="reg-phone"
                          name="phone"
                          type="tel"
                          placeholder="98XXXXXXXX"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-8 h-10 rounded-xl text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-address" className="text-xs font-semibold">City (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="reg-address"
                          name="address"
                          type="text"
                          placeholder="Kathmandu"
                          value={formData.address}
                          onChange={handleChange}
                          className="pl-8 h-10 rounded-xl text-base"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="reg-password" className="text-xs font-semibold">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="reg-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 characters"
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-8 pr-7 h-10 rounded-xl text-base"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-confirm" className="text-xs font-semibold">Confirm</Label>
                      <div className="relative">
                        <Input
                          id="reg-confirm"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pr-7 h-10 rounded-xl text-base"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full min-h-[44px] h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground pt-1">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login")
                        setError("")
                      }}
                      className="text-primary font-semibold hover:underline min-h-[44px] inline-flex items-center px-1"
                    >
                      Sign In
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login")
                      setError("")
                      setSuccess("")
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 font-medium min-h-[36px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </button>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">Reset Password</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Enter your email to receive password reset instructions
                  </p>
                </div>

                {success ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-xs rounded-xl flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                    <Button
                      onClick={() => {
                        setMode("login")
                        setSuccess("")
                      }}
                      className="w-full min-h-[44px] rounded-xl"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="forgot-email" className="text-xs font-semibold">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="forgot-email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10 h-11 rounded-xl text-base"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div role="alert" className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full min-h-[44px] h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper Line Matching Existing Style */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          Accounts in this demo are saved only in this browser.
        </p>
      </div>
    </div>
  )
}
