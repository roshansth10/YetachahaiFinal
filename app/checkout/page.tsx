"use client"

import { useRouter } from "next/navigation"
import { StoreProvider } from "@/lib/store"
import CustomerLayout from "@/components/layout/customer-layout"
import CheckoutPage from "@/components/pages/checkout"
import { Toaster } from "sonner"

export default function CheckoutRoute() {
  const router = useRouter()

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
    else if (page === "login") {
      const redirect = (data as { redirect?: string })?.redirect
      router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login")
    }
    else if (page === "signup") {
      const redirect = (data as { redirect?: string })?.redirect
      router.push(redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup")
    }
    else router.push("/")
  }

  return (
    <StoreProvider>
      <CustomerLayout onNavigate={navigate}>
        <CheckoutPage onNavigate={navigate} />
      </CustomerLayout>
      <Toaster position="bottom-right" richColors />
    </StoreProvider>
  )
}
