'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, ShoppingCart, Share2, Star, Minus, Plus, ChevronRight, 
  BookOpen, Package, Clock, Check, Truck, Globe, Calendar, Hash, ArrowLeft, ArrowRight
} from 'lucide-react'
import BookCard from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { books, reviews as allReviews, formatPrice, getBookBySlug, getBookById } from '@/lib/data'
import { toast } from 'sonner'
import UserAvatar from '@/components/ui/user-avatar'

interface BookDetailPageProps {
  bookId: string
  onNavigate: (page: string, data?: unknown) => void
}

export default function BookDetailPage({ bookId, onNavigate }: BookDetailPageProps) {
  const { user, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [quantity, setQuantity] = useState(1)

  // Find book by slug or by id
  const book = getBookBySlug(bookId) || getBookById(bookId) || books.find(b => b.slug === bookId || b.id === bookId)
  const [selectedFormat, setSelectedFormat] = useState(book?.format || 'Physical')

  const inWishlist = book ? (isInWishlist(book.id) || isInWishlist(book.slug)) : false
  const reviews = book ? allReviews.filter(r => r.bookId === book.id) : []
  
  // Related books from same genre (excluding current book)
  const relatedBooks = book 
    ? books.filter(b => b.id !== book.id && b.genres.some(g => book.genres.includes(g))).slice(0, 4)
    : []

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Book not found</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          The requested title could not be found or may have been moved.
        </p>
        <Button
          onClick={() => onNavigate('catalog')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Browse Catalogue
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(book, quantity)
    toast.success('Added to cart', {
      description: `${quantity}x ${book.title} (${selectedFormat}) added to your cart.`,
      action: {
        label: 'View Cart',
        onClick: () => onNavigate('cart'),
      },
    })
  }

  const handleWishlistToggle = () => {
    if (!user) {
      toast.info('Please sign in to save books to your wishlist', {
        action: {
          label: 'Sign In',
          onClick: () => onNavigate('login'),
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

  const handleBuyNow = () => {
    addToCart(book, quantity)
    if (!user) {
      toast.info('Please sign in to place your order.')
      onNavigate('login', { redirect: '/checkout' })
      return
    }
    onNavigate('checkout')
  }

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Check out ${book.title} by ${book.author} on Yetaxahai!`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or unsupported
      }
    } else if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6 md:mb-8 flex-wrap">
        <button onClick={() => onNavigate('home')} className="hover:text-foreground transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('catalog')} className="hover:text-foreground transition-colors">
          Books
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('catalog', book.genre)} className="hover:text-foreground transition-colors">
          {book.genre}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{book.title}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">
        {/* Left Column: Large Uncropped Book Cover (2:3 aspect ratio on soft background) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none"
        >
          <div className="relative aspect-[2/3] w-full bg-[#f6f1e8] dark:bg-muted/40 rounded-3xl p-6 sm:p-10 flex items-center justify-center border border-border/80 shadow-md">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              {book.isNewArrival && (
                <span className="px-3 py-1 text-xs font-mono font-bold bg-emerald-600 text-white rounded-full shadow-sm">
                  NEW ARRIVAL
                </span>
              )}
              {book.isBestseller && (
                <span className="px-3 py-1 text-xs font-mono font-bold bg-primary text-primary-foreground rounded-full shadow-sm">
                  BESTSELLER
                </span>
              )}
            </div>

            {/* Real Cover Image: Full, Uncropped with natural book shadow */}
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title} by ${book.author}`}
              loading="eager"
              width={400}
              height={600}
              className="h-full w-auto max-w-full object-contain drop-shadow-2xl rounded-md transition-transform duration-300 hover:scale-102"
            />
          </div>
        </motion.div>

        {/* Right Column: Title, Author, Price, Format Chooser, Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 flex flex-col justify-between"
        >
          <div>
            {/* Genre and Year */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {book.genres.map(g => (
                <span
                  key={g}
                  onClick={() => onNavigate('catalog', g)}
                  className="px-2.5 py-0.5 text-xs font-mono font-medium bg-primary/10 text-primary rounded-full cursor-pointer hover:bg-primary/20"
                >
                  {g}
                </span>
              ))}
              <span className="text-xs text-muted-foreground font-mono ml-auto">
                Published {book.publishedYear}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold italic text-foreground tracking-tight leading-tight">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-base sm:text-lg text-muted-foreground mt-1 font-serif italic">
                {book.subtitle}
              </p>
            )}

            <p className="text-base font-medium text-foreground/80 mt-2">
              by <span className="font-semibold text-primary">{book.author}</span>
            </p>

            {/* Ratings Bar */}
            <div className="flex items-center gap-3 my-4 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(book.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-sm font-bold text-foreground">{book.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({book.reviewCount} customer reviews)
              </span>
              <span className="text-xs text-emerald-600 font-medium ml-auto flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock ({book.stock} copies available)
              </span>
            </div>

            {/* Price Box */}
            <div className="flex flex-wrap items-baseline gap-3 my-4 p-4 bg-card rounded-2xl border border-border/80">
              <span className="font-mono text-3xl sm:text-4xl font-bold text-primary">
                {formatPrice(book.price)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <>
                  <span className="font-mono text-lg text-muted-foreground line-through">
                    {formatPrice(book.originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md">
                    SAVE {Math.round((1 - book.price / book.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Format Chooser */}
            <div className="my-5">
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Select Format:
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {book.formats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${
                      selectedFormat === fmt
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-card text-foreground hover:border-primary/40'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>{fmt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed my-5">
              {book.description}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-border/70">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Quantity:
                </span>
                <div className="flex items-center border border-border rounded-xl bg-card">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-muted transition-colors rounded-l-xl"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-muted transition-colors rounded-r-xl"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="flex-1 min-w-[140px] min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl shadow-md text-sm"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 min-w-[130px] min-h-[48px] border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-2xl text-sm"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className="min-w-[48px] min-h-[48px] rounded-2xl border-border hover:border-primary/40 text-muted-foreground hover:text-primary"
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleShare}
                  className="min-w-[48px] min-h-[48px] rounded-2xl border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  aria-label="Share book"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Delivery info card */}
              <div className="flex items-center gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl text-xs sm:text-sm text-foreground">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <span>
                  <strong>Nepal-wide delivery:</strong> 1-2 days within Kathmandu Valley, 3-5 days across all provinces. Cash on Delivery, eSewa, and Khalti accepted.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Details Table & Reviews Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 gap-6">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-serif text-lg font-bold py-3 px-1"
            >
              Book Specifications
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-serif text-lg font-bold py-3 px-1"
            >
              Full Synopsis
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-serif text-lg font-bold py-3 px-1"
            >
              Reader Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Details Table */}
          <TabsContent value="details" className="pt-6">
            <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-3xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/60">
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground w-1/3">Full Title</td>
                    <td className="py-3 font-semibold text-foreground">{book.title}</td>
                  </tr>
                  {book.subtitle && (
                    <tr className="py-2.5">
                      <td className="py-3 font-medium text-muted-foreground">Subtitle</td>
                      <td className="py-3 text-foreground">{book.subtitle}</td>
                    </tr>
                  )}
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">Author</td>
                    <td className="py-3 font-medium text-foreground">{book.author}</td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">ISBN-13 / ISBN-10</td>
                    <td className="py-3 font-mono text-foreground">{book.isbn} {book.isbn10 ? `(${book.isbn10})` : ''}</td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">Publisher</td>
                    <td className="py-3 text-foreground">{book.publisher}</td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">Published Year</td>
                    <td className="py-3 font-mono text-foreground">{book.publishedYear}</td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">Page Count</td>
                    <td className="py-3 font-mono text-foreground">{book.pages} pages</td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">Language</td>
                    <td className="py-3 text-foreground">{book.language} {book.languages ? `(Available in: ${book.languages.join(', ')})` : ''}</td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">Available Formats</td>
                    <td className="py-3 text-foreground">{book.formats.join(', ')}</td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-3 font-medium text-muted-foreground">Genres</td>
                    <td className="py-3 text-foreground">{book.genres.join(', ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Synopsis */}
          <TabsContent value="description" className="pt-6">
            <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-3xl">
              <p className="text-foreground leading-relaxed text-base">
                {book.description}
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                Yetaxahai guarantees 100% genuine copies imported directly from accredited international and regional publishers. Each edition is carefully inspected prior to packaging and dispatch from our Kathmandu fulfillment center.
              </p>
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="pt-6">
            <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-3xl space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="pb-4 border-b border-border/60 last:border-b-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={rev.userName}
                          avatar={user && (rev.userId === user.id || rev.userName === user.name) ? user.avatar : undefined}
                          size="xs"
                        />
                        <span className="font-semibold text-foreground text-sm">{rev.userName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-medium text-sm text-foreground mt-1">{rev.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rev.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No community reviews yet for this title. Be the first to leave your thoughts after purchase!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <section className="pt-8 border-t border-border/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold italic text-foreground tracking-tight">
              More in {book.genre}
            </h2>
            <button
              onClick={() => onNavigate('catalog', book.genre)}
              className="text-primary hover:underline text-sm font-semibold flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
