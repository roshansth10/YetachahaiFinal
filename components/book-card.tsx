'use client'

import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useStore } from '@/lib/store'
import { type Book, formatPrice } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BookCardProps {
  book: Book
  variant?: 'default' | 'horizontal' | 'featured'
  showRank?: number
  onNavigate?: (page: string, data?: unknown) => void
  priority?: boolean
}

export default function BookCard({ book, variant = 'default', showRank, onNavigate, priority = false }: BookCardProps) {
  const { user, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const inWishlist = isInWishlist(book.id) || isInWishlist(book.slug)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(book)
    toast.success('Added to cart', {
      description: `${book.title} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.info('Please sign in to save books to your wishlist', {
        action: {
          label: 'Sign In',
          onClick: () => onNavigate?.('login'),
        },
      })
      return
    }
    if (inWishlist) {
      removeFromWishlist(book.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(book)
      toast.success('Added to wishlist')
    }
  }

  const handleNavigate = () => {
    onNavigate?.('book', book.slug || book.id)
  }

  // Horizontal variant (e.g. for ranked lists, list view, bestsellers)
  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="group flex gap-4 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md border border-border/60 transition-all hover:border-primary/20"
      >
        {showRank && (
          <div className="flex items-center justify-center w-8 shrink-0 font-serif text-2xl font-bold text-primary/80">
            {showRank}
          </div>
        )}
        <button
          onClick={handleNavigate}
          className="shrink-0 relative w-20 h-28 sm:w-24 sm:h-36 bg-[#f7f3eb] dark:bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center p-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`View details for ${book.title}`}
        >
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title} by ${book.author}`}
            loading={priority ? 'eager' : 'lazy'}
            width={120}
            height={180}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </button>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <button onClick={handleNavigate} className="text-left focus:outline-none">
                <h3
                  title={book.title}
                  className="font-serif font-semibold text-foreground text-base sm:text-lg line-clamp-1 group-hover:text-primary transition-colors"
                >
                  {book.title}
                </h3>
              </button>
              <button
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0 text-muted-foreground hover:text-primary"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{book.author}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-foreground">{book.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({book.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/40">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-sm sm:text-base font-bold text-primary">
                {formatPrice(book.price)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="font-mono text-xs text-muted-foreground line-through">
                  {formatPrice(book.originalPrice)}
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              variant="outline"
              className="h-8 px-2.5 sm:px-3 text-xs rounded-lg hover:bg-primary hover:text-primary-foreground border-primary/30"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Featured variant (bento / hero spotlight)
  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative bg-card rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-border/60 transition-all flex flex-col justify-between"
      >
        <div
          onClick={handleNavigate}
          className="cursor-pointer relative aspect-[3/4] bg-[#f5efe4] dark:bg-muted/40 p-6 flex items-center justify-center overflow-hidden"
        >
          {/* Subtle warm backdrop glow */}
          <div className="absolute inset-0 bg-radial from-amber-50/40 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
            {book.isNewArrival && (
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-emerald-600 text-white rounded-full shadow-sm">
                NEW
              </span>
            )}
            {book.isBestseller && (
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-primary text-primary-foreground rounded-full shadow-sm">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-4 right-4 z-10 p-2.5 bg-card/90 backdrop-blur-sm rounded-full shadow-md hover:bg-card hover:scale-105 transition-all"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : 'text-foreground/70'}`} />
          </button>

          {/* Real Full Uncropped Cover */}
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title} by ${book.author}`}
            loading={priority ? 'eager' : 'lazy'}
            width={300}
            height={450}
            className="h-full w-auto max-w-full object-contain rounded-md drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content details */}
        <div className="p-5 sm:p-6 bg-card flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">{book.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({book.reviewCount} reviews)</span>
              <span className="ml-auto text-xs font-mono text-muted-foreground uppercase">{book.genre}</span>
            </div>
            <h3
              title={book.title}
              onClick={handleNavigate}
              className="font-serif text-xl font-bold text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer"
            >
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
            <p className="text-xs text-muted-foreground/90 line-clamp-2 mt-2 leading-relaxed">
              {book.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-primary">
                {formatPrice(book.price)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="font-mono text-sm text-muted-foreground line-through">
                  {formatPrice(book.originalPrice)}
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default Grid Card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-border/70 hover:border-primary/30 transition-all flex flex-col h-full"
    >
      {/* Cover Image Box - Fixed 2:3 aspect ratio on soft background */}
      <div className="relative aspect-[2/3] w-full bg-[#f6f1e8] dark:bg-muted/40 p-3 sm:p-4 flex items-center justify-center overflow-hidden cursor-pointer" onClick={handleNavigate}>
        {/* Single Badge - BESTSELLER takes priority over NEW, positioned away from heart */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          {book.isBestseller ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold bg-primary text-primary-foreground rounded-md shadow-xs">
              BESTSELLER
            </span>
          ) : book.isNewArrival ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold bg-emerald-700 text-white rounded-md shadow-xs">
              NEW
            </span>
          ) : null}
        </div>

        {/* Wishlist Toggle Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-card hover:scale-110 transition-all text-muted-foreground hover:text-primary"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
        </button>

        {/* Real Cover Image: Full, Uncropped, Contained with authentic book shadow/spine effect */}
        <div className="relative h-full flex items-center justify-center">
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title} by ${book.author}`}
            loading={priority ? 'eager' : 'lazy'}
            width={240}
            height={360}
            className="h-full w-auto max-w-full object-contain rounded drop-shadow-[2px_4px_10px_rgba(0,0,0,0.18)] group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Rating Row */}
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-foreground">{book.rating.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground">({book.reviewCount})</span>
            <span className="ml-auto text-[11px] font-mono text-muted-foreground/80 truncate max-w-[80px]">
              {book.genre}
            </span>
          </div>

          {/* Title - Truncates to 2 lines with consistent min-height for equal card heights */}
          <button onClick={handleNavigate} className="text-left w-full focus:outline-none">
            <h3
              title={book.title}
              className="font-serif font-semibold text-foreground text-sm sm:text-base line-clamp-2 min-h-[2.5rem] leading-snug hover:text-primary transition-colors"
            >
              {book.title}
            </h3>
          </button>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.author}</p>
        </div>

        {/* Price & Action Row - Always single line with always-visible Add to Cart button */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
            <span className="font-mono text-sm sm:text-base font-bold text-primary whitespace-nowrap">
              {formatPrice(book.price)}
            </span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="font-mono text-[11px] sm:text-xs text-muted-foreground line-through whitespace-nowrap">
                {formatPrice(book.originalPrice)}
              </span>
            )}
          </div>

          {/* Always Visible Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="h-8 px-3 rounded-lg text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 shrink-0 shadow-xs"
            aria-label={`Add ${book.title} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
