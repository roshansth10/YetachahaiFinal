"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StoreProvider } from "@/lib/store"
import AuthPage from "@/components/pages/auth"
import { Toaster } from "sonner"

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const navigate = (page: string, data?: unknown) => {
    if (page === "home") router.push("/")
    else if (page === "catalog") {
      if (typeof data === "string" && data) router.push(`/browse?genre=${encodeURIComponent(data)}`)
      else router.push("/browse")
    }
    else if (page === "book") router.push(`/book/${data}`)
    else if (page === "cart") router.push("/cart")
    else if (page === "wishlist") router.push("/wishlist")
    else if (page === "checkout") router.push("/checkout")
    else if (page === "profile") router.push("/profile")
    else if (page === "login") router.push("/login")
    else if (page === "signup") router.push("/signup")
    else if (page === "auth") router.push("/login")
    else router.push("/")
  }

  return <AuthPage onNavigate={navigate} initialMode="register" redirectTo={redirect} />
}

export default function SignupPage() {
  return (
    <StoreProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#faf6ee]" />}>
        <SignupContent />
      </Suspense>
      <Toaster position="bottom-right" richColors />
    </StoreProvider>
  )
}
