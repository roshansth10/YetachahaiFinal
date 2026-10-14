"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StoreProvider } from "@/lib/store"
import CustomerLayout from "@/components/layout/customer-layout"
import BookDetailPage from "@/components/pages/book-detail"
import { Toaster } from "sonner"

export default function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
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
    else if (page === "login" || page === "auth") {
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
        <BookDetailPage bookId={resolvedParams.slug} onNavigate={navigate} />
      </CustomerLayout>
      <Toaster position="bottom-right" richColors />
    </StoreProvider>
  )
}
