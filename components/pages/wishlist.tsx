'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface WishlistPageProps {
  onNavigate: (page: string, data?: unknown) => void
}

export default function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { wishlist, removeFromWishlist, addToCart } = useStore()

  const handleRemove = (bookId: string) => {
    removeFromWishlist(bookId)
    toast.success('Removed from wishlist')
  }

  const handleMoveToCart = (book: any) => {
    addToCart(book)
    removeFromWishlist(book.id)
    toast.success('Moved to cart', {
      description: `${book.title} has been moved to your cart.`,
    })
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold italic text-foreground mb-3">
          Your Wishlist is Empty
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Save your favorite titles, upcoming reads, and literary obsessions here to easily find and purchase them later.
        </p>
        <Button
          onClick={() => onNavigate('catalog')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-11 px-8 font-semibold shadow-md"
        >
          Explore Books
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold italic text-foreground tracking-tight">
          My Wishlist
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} saved for later
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence>
          {wishlist.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-border/70 transition-all flex flex-col justify-between"
            >
              {/* Uncropped Cover Box with 2:3 ratio */}
              <div
                onClick={() => onNavigate('book', book.slug || book.id)}
                className="relative aspect-[2/3] w-full bg-[#f6f1e8] dark:bg-muted/40 p-3 sm:p-4 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                  {book.isNewArrival && (
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold bg-emerald-600 text-white rounded-md">
                      NEW
                    </span>
                  )}
                  {book.isBestseller && (
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold bg-primary text-primary-foreground rounded-md">
                      BESTSELLER
                    </span>
                  )}
                </div>

                <img
                  src={book.coverImage}
                  alt={`Cover of ${book.title} by ${book.author}`}
                  width={240}
                  height={360}
                  className="h-full w-auto max-w-full object-contain rounded drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Details */}
              <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
                <div>
                  <button onClick={() => onNavigate('book', book.slug || book.id)} className="text-left w-full">
                    <h3
                      title={book.title}
                      className="font-serif font-semibold text-foreground text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors leading-snug"
                    >
                      {book.title}
                    </h3>
                  </button>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.author}</p>
                </div>

                {/* Price block - single line */}
                <div className="flex flex-wrap items-baseline gap-1.5 pt-1">
                  <span className="font-mono text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                    {formatPrice(book.price)}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="font-mono text-xs text-muted-foreground line-through whitespace-nowrap">
                      {formatPrice(book.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs h-9 font-medium"
                    onClick={() => handleMoveToCart(book)}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                    Move to Cart
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-xl border-border/80 text-muted-foreground hover:text-destructive h-9 w-9 shrink-0"
                    onClick={() => handleRemove(book.id)}
                    aria-label={`Remove ${book.title} from wishlist`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
