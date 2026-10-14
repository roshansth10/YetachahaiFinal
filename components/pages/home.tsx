'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Truck, Users, Sparkles, Search, Brain, Heart, Rocket, Clock, Target, Star, ChevronRight } from 'lucide-react'
import BookCard from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { books, categories, getBestsellers, getNewArrivals, getFeaturedBooks, getBookById } from '@/lib/data'

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void
}

const genreIcons: Record<string, React.ElementType> = {
  'book-open': BookOpen,
  'search': Search,
  'sparkles': Sparkles,
  'target': Target,
  'brain': Brain,
  'heart': Heart,
  'rocket': Rocket,
  'clock': Clock,
}

const genreColors: Record<string, string> = {
  'Fiction': 'bg-primary/10 hover:bg-primary/15 border-primary/20',
  'Mystery': 'bg-amber-600/10 hover:bg-amber-600/15 border-amber-600/20',
  'Fantasy': 'bg-purple-600/10 hover:bg-purple-600/15 border-purple-600/20',
  'Self-Help': 'bg-emerald-600/10 hover:bg-emerald-600/15 border-emerald-600/20',
  'Philosophy': 'bg-stone-500/10 hover:bg-stone-500/15 border-stone-500/20',
  'Romance': 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20',
  'Sci-Fi': 'bg-cyan-600/10 hover:bg-cyan-600/15 border-cyan-600/20',
  'History': 'bg-yellow-700/10 hover:bg-yellow-700/15 border-yellow-700/20',
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const bestsellers = getBestsellers().slice(0, 6)
  const newArrivals = getNewArrivals().slice(0, 8)
  const featured = getFeaturedBooks()

  // 3 prominent real books for the hero showcase composition
  const heroBook1 = getBookById('1') || books[0] // The Midnight Library
  const heroBook2 = getBookById('2') || books[1] // Atomic Habits
  const heroBook3 = getBookById('11') || books[2] // Project Hail Mary

  // Marquee items
  const marqueeItems = books.slice(0, 16).map(b => `${b.title} by ${b.author}`)

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center overflow-hidden py-12 lg:py-20 bg-gradient-to-b from-[#f7f2e7] via-[#faf6ee] to-background dark:from-background dark:to-background">
        {/* Soft background ambient circles */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading and CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-mono font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nepal's Premier Curated Bookstore • Delivery across Nepal</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold italic text-foreground leading-[1.1] tracking-tight">
                Find Your Next{' '}
                <span className="text-primary not-italic font-serif underline decoration-primary/30 decoration-wavy decoration-2">
                  Obsession
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Discover authentic editions, timeless classics, and contemporary bestsellers. From Thamel to your doorstep, priced in Nepali Rupees (Rs.).
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 px-7 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                  onClick={() => onNavigate('catalog')}
                >
                  Browse Books
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl h-12 px-7 text-sm font-semibold border-border hover:bg-card hover:border-primary/40 transition-all"
                  onClick={() => onNavigate('catalog', 'new')}
                >
                  View New Arrivals
                </Button>
              </div>

              {/* Quick Trust Badges */}
              <div className="mt-10 pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Cash on Delivery / eSewa / Khalti</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>100% Authentic Covers & Editions</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Composition with 3 Real Book Covers */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none"
            >
              <div className="relative py-6 sm:py-10 flex items-center justify-center">
                {/* Book Trio Showcase Composition */}
                <div className="relative w-full max-w-md h-[340px] sm:h-[400px] flex items-center justify-center">
                  {/* Left Book: Atomic Habits (angled left) */}
                  <motion.div
                    whileHover={{ scale: 1.05, zIndex: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => onNavigate('book', heroBook2.slug)}
                    className="absolute left-2 sm:left-6 top-8 sm:top-12 w-36 sm:w-44 -rotate-12 cursor-pointer z-10 transition-transform duration-300"
                    title={`${heroBook2.title} by ${heroBook2.author}`}
                  >
                    <div className="p-2 bg-[#f8f5ee] dark:bg-card rounded-2xl shadow-xl border border-border/70 hover:border-primary/50">
                      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted/30">
                        <img
                          src={heroBook2.coverImage}
                          alt={`Cover of ${heroBook2.title} by ${heroBook2.author}`}
                          loading="eager"
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <p className="font-serif font-semibold text-xs text-foreground truncate">{heroBook2.title}</p>
                        <p className="font-mono text-[11px] font-bold text-primary">Rs. {heroBook2.price}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Book: Project Hail Mary (angled right) */}
                  <motion.div
                    whileHover={{ scale: 1.05, zIndex: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => onNavigate('book', heroBook3.slug)}
                    className="absolute right-2 sm:right-6 top-8 sm:top-12 w-36 sm:w-44 rotate-12 cursor-pointer z-10 transition-transform duration-300"
                    title={`${heroBook3.title} by ${heroBook3.author}`}
                  >
                    <div className="p-2 bg-[#f8f5ee] dark:bg-card rounded-2xl shadow-xl border border-border/70 hover:border-primary/50">
                      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted/30">
                        <img
                          src={heroBook3.coverImage}
                          alt={`Cover of ${heroBook3.title} by ${heroBook3.author}`}
                          loading="eager"
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <p className="font-serif font-semibold text-xs text-foreground truncate">{heroBook3.title}</p>
                        <p className="font-mono text-[11px] font-bold text-primary">Rs. {heroBook3.price}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Center Star Book: The Midnight Library (front and center) */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => onNavigate('book', heroBook1.slug)}
                    className="relative w-44 sm:w-52 cursor-pointer z-20 shadow-2xl rounded-2xl transition-transform duration-300"
                    title={`${heroBook1.title} by ${heroBook1.author}`}
                  >
                    <div className="p-2.5 bg-card rounded-2xl shadow-2xl border-2 border-primary/40">
                      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted/20">
                        <img
                          src={heroBook1.coverImage}
                          alt={`Cover of ${heroBook1.title} by ${heroBook1.author}`}
                          loading="eager"
                          className="w-full h-full object-contain drop-shadow-lg"
                        />
                      </div>
                      <div className="mt-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-primary text-primary-foreground rounded-full mb-1">
                          FEATURED
                        </span>
                        <p className="font-serif font-bold text-sm text-foreground truncate">{heroBook1.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{heroBook1.author}</p>
                        <p className="font-mono text-xs font-bold text-primary mt-0.5">Rs. {heroBook1.price}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <section className="bg-primary/5 border-y border-border/80 py-3 overflow-hidden" aria-label="Book titles ticker">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={index} className="mx-6 font-serif italic text-sm text-foreground/80 flex items-center gap-4">
              <span>{item}</span>
              <span className="text-primary text-xs">•</span>
            </span>
          ))}
        </div>
      </section>

      {/* Trending Now - Bento Grid */}
      <section className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-border/60">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground tracking-tight">
              Trending Now
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">The most read and discussed titles in Kathmandu</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-primary hover:underline text-sm font-semibold flex items-center gap-1 min-h-[44px] focus:outline-none"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Bento featured tile */}
          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <BookCard book={featured[0] || books[0]} variant="featured" onNavigate={onNavigate} />
          </div>

          {/* Additional trending books */}
          {bestsellers.slice(0, 4).map((book) => (
            <div key={book.id} className="col-span-1">
              <BookCard book={book} variant="default" onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals - Horizontal Touch Carousel with Scroll-Snap */}
      <section className="py-12 md:py-20 bg-card/60 border-y border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-border/60">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground tracking-tight">
                New Arrivals
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Fresh imports and latest releases</p>
            </div>
            <button
              onClick={() => onNavigate('catalog', 'new')}
              className="text-primary hover:underline text-sm font-semibold flex items-center gap-1 min-h-[44px] focus:outline-none"
            >
              <span>View All New</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel with touch-swipe, scroll-snap, and visible card peeking */}
          <div className="overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4 sm:gap-6 w-max">
              {newArrivals.map((book) => (
                <div key={book.id} className="w-48 sm:w-60 shrink-0 snap-start">
                  <BookCard book={book} onNavigate={onNavigate} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers - Ranked List 1-6 */}
      <section className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-border/60">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground tracking-tight">
              Top Bestsellers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Ranked 1 to 6 by readers across Nepal</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-primary hover:underline text-sm font-semibold flex items-center gap-1 min-h-[44px] focus:outline-none"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {bestsellers.slice(0, 6).map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              variant="horizontal"
              showRank={index + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* Browse by Genre Tiles with Computed Counts */}
      <section className="py-12 md:py-20 bg-card/40 border-y border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground tracking-tight">
              Browse by Genre
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore curated titles across all 8 major literary categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
            {categories.map((category) => {
              const IconComponent = genreIcons[category.icon] || BookOpen
              const style = genreColors[category.name] || 'bg-muted/50 border-border/50'
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => onNavigate('catalog', category.name)}
                    className={`block w-full text-left p-4 sm:p-6 rounded-2xl border ${style} shadow-xs hover:shadow-md transition-all min-h-[110px] focus:outline-none focus:ring-2 focus:ring-primary`}
                  >
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-foreground mb-2 sm:mb-3" />
                    <h3 className="font-serif font-bold text-base sm:text-lg text-foreground">{category.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{category.bookCount} books</p>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Yetaxahai? */}
      <section className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground tracking-tight">
            Why Yetaxahai?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A boutique bookstore rooted in Kathmandu, designed for genuine book lovers
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 bg-card rounded-3xl border border-border/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Curated Selections</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every title is verified for authentic print editions, accurate cover artwork, and literary depth.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-card rounded-3xl border border-border/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-5">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Nepal-Wide Delivery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fast shipping across Kathmandu Valley, Pokhara, Chitwan, and all 77 districts with flexible local payments.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-card rounded-3xl border border-border/80 shadow-xs flex flex-col justify-between sm:col-span-2 md:col-span-1">
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Nepali Reader Community</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Local book clubs, honest member reviews, and transparent pricing directly in NPR (Rs.).
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
