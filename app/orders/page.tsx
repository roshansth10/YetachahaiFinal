"use client"

import { useRouter } from "next/navigation"
import { StoreProvider } from "@/lib/store"
import CustomerLayout from "@/components/layout/customer-layout"
import ProfilePage from "@/components/pages/profile"
import { Toaster } from "sonner"

export default function OrdersRoute() {
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
    else if (page === "login") router.push("/login")
    else if (page === "signup") router.push("/signup")
    else router.push("/")
  }

  return (
    <StoreProvider>
      <CustomerLayout onNavigate={navigate}>
        <ProfilePage onNavigate={navigate} initialTab="orders" />
      </CustomerLayout>
      <Toaster position="bottom-right" richColors />
    </StoreProvider>
  )
}
