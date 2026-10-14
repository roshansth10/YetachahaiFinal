'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, ShoppingCart, Share2, Star, Minus, Plus, ChevronRight, 
  BookOpen, Package, Clock, Check, Truck
} from 'lucide-react'
import BookCard from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { books, reviews as allReviews, formatPrice } from '@/lib/data'
import { toast } from 'sonner'

interface BookDetailPageProps {
  bookId: string
  onNavigate: (page: string, data?: unknown) => void
}

export default function BookDetailPage({ bookId, onNavigate }: BookDetailPageProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [quantity, setQuantity] = useState(1)

  const book = books.find(b => b.id === bookId)
  const inWishlist = book ? isInWishlist(book.id) : false
  const reviews = allReviews.filter(r => r.bookId === bookId)
  const relatedBooks = books.filter(b => b.category === book?.category && b.id !== bookId).slice(0, 4)

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Book not found</h1>
        <p className="text-muted-foreground mb-8">The book you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => onNavigate('catalog')}>Browse All Books</Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(book, quantity)
    toast.success('Added to cart', {
      description: `${quantity}x ${book.title} added to your cart.`,
      action: {
        label: 'View Cart',
        onClick: () => onNavigate('cart'),
      },
    })
  }

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(book.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(book)
      toast.success('Added to wishlist')
    }
  }

  const handleBuyNow = () => {
    addToCart(book, quantity)
    onNavigate('checkout')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button onClick={() => onNavigate('home')} className="hover:text-foreground transition-colors">
          Home
        </button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => onNavigate('catalog')} className="hover:text-foreground transition-colors">
          Books
        </button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => onNavigate('catalog', book.category)} className="hover:text-foreground transition-colors">
          {book.category}
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{book.title}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="relative aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            {book.isNewArrival && (
              <span className="absolute top-4 left-4 px-3 py-1 text-sm font-mono font-medium bg-accent text-accent-foreground rounded">
                NEW
              </span>
            )}
            {book.isBestseller && (
              <span className="absolute top-4 right-4 px-3 py-1 text-sm font-mono font-medium bg-secondary text-secondary-foreground rounded">
                BESTSELLER
              </span>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="flex-1">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">by {book.author}</p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(book.rating) 
                        ? 'fill-secondary text-secondary' 
                        : 'text-muted'
                    }`}
                  />
                ))}
                <span className="ml-2 font-medium text-foreground">{book.rating}</span>
              </div>
              <span className="text-muted-foreground">({book.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-mono text-3xl font-bold text-primary">{formatPrice(book.price)}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <>
                  <span className="font-mono text-xl text-muted-foreground line-through">{formatPrice(book.originalPrice)}</span>
                  <span className="px-2 py-1 text-sm font-medium bg-accent/10 text-accent rounded">
                    {Math.round((1 - book.price / book.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              {book.description}
            </p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-medium text-foreground">{book.pages}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium text-foreground">{book.format}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium text-foreground">{book.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-medium text-foreground">
                    {book.stock > 10 ? 'In Stock' : book.stock > 0 ? `Only ${book.stock} left` : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="flex-1 min-w-[140px] bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={book.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 min-w-[140px]"
                  onClick={handleBuyNow}
                  disabled={book.stock === 0}
                >
                  Buy Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="flex items-center gap-2 p-4 bg-accent/10 rounded-xl text-sm">
                <Truck className="w-5 h-5 text-accent" />
                <span className="text-foreground">
                  Free delivery on orders over Rs 1,000 | Express delivery available in Kathmandu
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
          <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Description
          </TabsTrigger>
          <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Details
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-6">
          <div className="prose prose-neutral max-w-none">
            <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              A beautifully written story that will captivate readers from the first page to the last. 
              This book has been praised by critics and readers alike for its compelling narrative and 
              memorable characters.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="details" className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Publisher</span>
                <span className="font-medium text-foreground">{book.publisher}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">ISBN</span>
                <span className="font-mono text-foreground">{book.isbn}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Pages</span>
                <span className="font-medium text-foreground">{book.pages}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground">{book.format}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium text-foreground">{book.language}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Genre</span>
                <span className="font-medium text-foreground">{book.category}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="pt-6">
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-6 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary">{review.userName[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{review.userName}</p>
                        <p className="text-sm text-muted-foreground">{review.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-secondary text-secondary' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                  <p className="text-muted-foreground">{review.content}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relatedBook) => (
              <BookCard key={relatedBook.id} book={relatedBook} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
