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
}

export default function BookCard({ book, variant = 'default', showRank, onNavigate }: BookCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const inWishlist = isInWishlist(book.id)

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
    if (inWishlist) {
      removeFromWishlist(book.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(book)
      toast.success('Added to wishlist')
    }
  }

  const handleNavigate = () => {
    onNavigate?.('book', book.id)
  }

  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex gap-4 p-4 bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
      >
        {showRank && (
          <div className="flex items-center justify-center w-8 font-mono text-2xl font-bold text-secondary">
            {showRank}
          </div>
        )}
        <button onClick={handleNavigate} className="shrink-0 text-left">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-16 h-24 object-cover rounded-lg"
          />
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={handleNavigate} className="text-left w-full">
            <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
              {book.title}
            </h3>
          </button>
          <p className="text-sm text-muted-foreground truncate">{book.author}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-secondary text-secondary" />
              <span className="text-xs font-medium text-foreground">{book.rating}</span>
            </div>
            <span className="text-sm font-mono font-medium text-primary">{formatPrice(book.price)}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8 }}
        className="group relative bg-card rounded-3xl overflow-hidden shadow-xl cursor-pointer"
        onClick={handleNavigate}
      >
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            {book.isNewArrival && (
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-accent text-accent-foreground rounded">
                NEW
              </span>
            )}
            {book.isBestseller && (
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-secondary text-secondary-foreground rounded">
                BESTSELLER
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-card mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-card/80 mb-3">{book.author}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-card">{formatPrice(book.price)}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="font-mono text-sm text-card/60 line-through">{formatPrice(book.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-card">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span className="text-sm font-medium">{book.rating}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 p-2 bg-card/90 rounded-full hover:bg-card transition-colors"
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-primary text-primary' : 'text-foreground'}`} />
        </button>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      <div onClick={handleNavigate} className="cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {book.isNewArrival && (
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-accent text-accent-foreground rounded">
                NEW
              </span>
            )}
            {book.isBestseller && (
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-secondary text-secondary-foreground rounded">
                BESTSELLER
              </span>
            )}
          </div>
          {/* Quick Actions */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-foreground/60 to-transparent">
            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="flex-1 bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{book.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-primary">{formatPrice(book.price)}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="font-mono text-sm text-muted-foreground line-through">{formatPrice(book.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span className="text-sm font-medium text-foreground">{book.rating}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 p-2 bg-card/90 rounded-full hover:bg-card transition-colors shadow-lg"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
      </button>
    </motion.div>
  )
}
