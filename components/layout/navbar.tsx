'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, Settings, Package, ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { categories } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserAvatar from '@/components/ui/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavbarProps {
  onNavigate: (page: string, data?: unknown) => void
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const { user, cart, wishlist, logout, isAuthLoading } = useStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlist.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery.trim() })
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    onNavigate('home')
  }

  const handleNavClick = (page: string, data?: unknown) => {
    onNavigate(page, data)
    setMobileMenuOpen(false)
    setMobileCategoriesOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#faf6ee]/95 dark:bg-card/95 backdrop-blur-md border-b border-border/80">
      <nav className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary rounded-lg py-1"
            aria-label="Yetaxahai Bookstore Home"
          >
            <span className="font-serif text-2xl md:text-3xl font-bold italic text-foreground tracking-tight group-hover:text-primary transition-colors">
              Yetaxahai
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate('catalog')}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors min-h-[44px] flex items-center"
            >
              Browse
            </button>

            {/* Categories Dropdown - All 8 Genres with full click, tap and keyboard navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2"
                aria-label="Categories menu"
              >
                <span>Categories</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-card border-border/80 shadow-xl rounded-xl p-1.5">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => onNavigate('catalog', category.name)}
                    className="cursor-pointer py-2 px-3 rounded-lg flex items-center justify-between text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">({category.bookCount})</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books, authors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/80 border-border/80 focus:border-primary h-10 text-sm rounded-xl"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground hover:text-primary transition-colors rounded-lg"
              aria-label="Toggle search input"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground hover:text-primary transition-colors rounded-lg"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground hover:text-primary transition-colors rounded-lg"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu on Desktop */}
            {isAuthLoading ? (
              // Skeleton placeholder — prevents sign-in flash for logged-in users
              <div className="hidden md:block w-8 h-8 rounded-full bg-muted animate-pulse" aria-hidden="true" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 min-w-[44px] min-h-[44px] justify-center p-1 text-foreground hover:text-primary transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="User account menu"
                  >
                    <UserAvatar user={user} size="sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-card border-border/80 shadow-xl rounded-xl p-1.5">
                  <div className="px-3 py-2.5 flex items-center gap-3">
                    <UserAvatar user={user} size="md" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate('admin')} className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => onNavigate('profile', { tab: 'profile' })} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('profile', { tab: 'orders' })} className="cursor-pointer">
                    <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('wishlist')} className="cursor-pointer">
                    <Heart className="w-4 h-4 mr-2 text-muted-foreground" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex h-9 px-4 rounded-xl font-medium border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onNavigate('login')}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground hover:text-primary transition-colors rounded-lg"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Full-Width Mobile Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/60 py-3"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search books, authors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border focus:border-primary text-base h-11 rounded-xl"
                  autoFocus
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Accordion Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/70 py-4"
            >
              <div className="space-y-1">
                <button
                  onClick={() => handleNavClick('catalog')}
                  className="flex items-center w-full min-h-[44px] px-4 py-2.5 text-base font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-colors text-left"
                >
                  Browse All Books
                </button>

                {/* Categories Accordion */}
                <div className="pt-1">
                  <button
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    className="flex items-center justify-between w-full min-h-[44px] px-4 py-2.5 text-base font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-colors text-left"
                    aria-expanded={mobileCategoriesOpen}
                  >
                    <span>Categories (All 8)</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {mobileCategoriesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-2 py-1 space-y-1"
                      >
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleNavClick('catalog', category.name)}
                            className="flex items-center justify-between w-full min-h-[40px] px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors text-left"
                          >
                            <span>{category.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">({category.bookCount})</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-3 border-t border-border/60 mt-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-muted/30 rounded-xl">
                        <UserAvatar user={user} size="sm" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNavClick('profile', { tab: 'profile' })}
                        className="flex items-center w-full min-h-[44px] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10 rounded-xl transition-colors text-left"
                      >
                        <User className="w-4 h-4 mr-3 text-muted-foreground" />
                        My Profile
                      </button>
                      <button
                        onClick={() => handleNavClick('profile', { tab: 'orders' })}
                        className="flex items-center w-full min-h-[44px] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10 rounded-xl transition-colors text-left"
                      >
                        <Package className="w-4 h-4 mr-3 text-muted-foreground" />
                        My Orders
                      </button>
                      <button
                        onClick={() => handleNavClick('wishlist')}
                        className="flex items-center w-full min-h-[44px] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10 rounded-xl transition-colors text-left"
                      >
                        <Heart className="w-4 h-4 mr-3 text-muted-foreground" />
                        Wishlist
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full min-h-[44px] px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 px-1">
                      <Button
                        variant="outline"
                        className="w-full min-h-[44px] rounded-xl font-medium border-primary/30"
                        onClick={() => handleNavClick('login')}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full min-h-[44px] rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleNavClick('signup')}
                      >
                        Register
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
