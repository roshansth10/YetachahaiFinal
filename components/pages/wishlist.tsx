'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'
import { toast } from 'sonner'

interface WishlistPageProps {
  onNavigate: (page: string, data?: unknown) => void
}

export default function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { wishlist, removeFromWishlist, moveToCart } = useStore()
  const isEmpty = wishlist.length === 0

  const handleMoveToCart = (bookId: string, title: string) => {
    moveToCart(bookId)
    toast.success('Moved to cart', {
      description: `${title} has been added to your cart.`,
    })
  }

  const handleRemove = (bookId: string) => {
    removeFromWishlist(bookId)
    toast.success('Removed from wishlist')
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold italic text-foreground mb-4">
            Your wishlist is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Save books you love for later. Start exploring our collection!
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            onClick={() => onNavigate('catalog')}
          >
            Browse Books
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground">
          My Wishlist
        </h1>
        <p className="mt-2 text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} saved for later
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {wishlist.map((book) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Cover Image */}
              <button 
                onClick={() => onNavigate('book', book.id)} 
                className="block relative aspect-[3/4] overflow-hidden w-full"
              >
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
              </button>

              {/* Details */}
              <div className="p-4">
                <button onClick={() => onNavigate('book', book.id)} className="text-left w-full">
                  <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                </button>
                <p className="text-sm text-muted-foreground mb-3">{book.author}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-primary">
                      {formatPrice(book.price)}
                    </span>
                    {book.originalPrice && book.originalPrice > book.price && (
                      <span className="font-mono text-sm text-muted-foreground line-through">
                        {formatPrice(book.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                    onClick={() => handleMoveToCart(book.id, book.title)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => handleRemove(book.id)}
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
