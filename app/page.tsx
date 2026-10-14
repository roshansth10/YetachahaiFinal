"use client"

import { useState } from "react"
import { StoreProvider } from "@/lib/store"
import { Toaster } from "sonner"

// Layout
import CustomerLayout from "@/components/layout/customer-layout"

// Customer Pages
import HomePage from "@/components/pages/home"
import CatalogPage from "@/components/pages/catalog"
import BookDetailPage from "@/components/pages/book-detail"
import CartPage from "@/components/pages/cart"
import WishlistPage from "@/components/pages/wishlist"
import CheckoutPage from "@/components/pages/checkout"
import ProfilePage from "@/components/pages/profile"
import AuthPage from "@/components/pages/auth"

// Admin Pages
import AdminDashboard from "@/components/pages/admin/dashboard"

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [pageData, setPageData] = useState<unknown>(null)

  const navigate = (page: string, data?: unknown) => {
    setCurrentPage(page)
    setPageData(data || null)
    window.scrollTo(0, 0)
  }

  const renderPage = () => {
    // Admin pages don't use CustomerLayout
    if (currentPage === "admin") {
      return <AdminDashboard onNavigate={navigate} />
    }

    // Auth page has its own layout
    if (currentPage === "auth") {
      return <AuthPage onNavigate={navigate} />
    }

    // Customer pages with layout
    let content
    switch (currentPage) {
      case "home":
        content = <HomePage onNavigate={navigate} />
        break
      case "catalog":
        content = <CatalogPage onNavigate={navigate} initialCategory={pageData as string | undefined} />
        break
      case "book":
        content = <BookDetailPage bookId={pageData as string} onNavigate={navigate} />
        break
      case "cart":
        content = <CartPage onNavigate={navigate} />
        break
      case "wishlist":
        content = <WishlistPage onNavigate={navigate} />
        break
      case "checkout":
        content = <CheckoutPage onNavigate={navigate} />
        break
      case "profile":
        content = <ProfilePage onNavigate={navigate} />
        break
      default:
        content = <HomePage onNavigate={navigate} />
    }

    return <CustomerLayout onNavigate={navigate}>{content}</CustomerLayout>
  }

  return (
    <StoreProvider>
      {renderPage()}
      <Toaster position="bottom-right" richColors />
    </StoreProvider>
  )
}
