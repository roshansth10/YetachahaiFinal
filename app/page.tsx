"use client"

import { useState, useEffect, useCallback } from "react"
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

  // Synchronize route from window.location
  const syncFromLocation = useCallback(() => {
    if (typeof window === "undefined") return
    const pathname = window.location.pathname
    const search = window.location.search

    if (pathname.startsWith("/book/")) {
      const slug = pathname.replace("/book/", "")
      setCurrentPage("book")
      setPageData(slug)
    } else if (pathname === "/browse" || pathname === "/catalog") {
      setCurrentPage("catalog")
      const params = new URLSearchParams(search)
      const genre = params.get("genre")
      const q = params.get("q") || params.get("search")
      if (genre) {
        setPageData(genre)
      } else if (q) {
        setPageData({ search: q })
      } else {
        setPageData(null)
      }
    } else if (pathname === "/cart") {
      setCurrentPage("cart")
      setPageData(null)
    } else if (pathname === "/wishlist") {
      setCurrentPage("wishlist")
      setPageData(null)
    } else if (pathname === "/checkout") {
      setCurrentPage("checkout")
      setPageData(null)
    } else if (pathname === "/profile") {
      setCurrentPage("profile")
      setPageData(null)
    } else if (pathname === "/auth") {
      setCurrentPage("auth")
      setPageData(null)
    } else if (pathname === "/admin") {
      setCurrentPage("admin")
      setPageData(null)
    } else {
      setCurrentPage("home")
      setPageData(null)
    }
  }, [])

  // Listen to popstate for browser back/forward navigation
  useEffect(() => {
    syncFromLocation()
    const handlePopState = () => {
      syncFromLocation()
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [syncFromLocation])

  const navigate = (page: string, data?: unknown) => {
    setCurrentPage(page)
    setPageData(data || null)
    window.scrollTo({ top: 0, behavior: "smooth" })

    if (typeof window !== "undefined") {
      let url = "/"
      if (page === "catalog") {
        if (typeof data === "string" && data) {
          url = `/browse?genre=${encodeURIComponent(data)}`
        } else if (typeof data === "object" && data !== null && "search" in data) {
          url = `/browse?q=${encodeURIComponent(String((data as { search: string }).search))}`
        } else {
          url = "/browse"
        }
      } else if (page === "book") {
        url = `/book/${data}`
      } else if (page === "cart") {
        url = "/cart"
      } else if (page === "wishlist") {
        url = "/wishlist"
      } else if (page === "checkout") {
        url = "/checkout"
      } else if (page === "profile") {
        url = "/profile"
      } else if (page === "auth") {
        url = "/auth"
      } else if (page === "admin") {
        url = "/admin"
      }

      window.history.pushState({ page, data }, "", url)
    }
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
        content = <CatalogPage onNavigate={navigate} initialCategory={pageData as any} />
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
