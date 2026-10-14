'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Truck, Users, Sparkles, Search, Brain, Heart, Rocket, Clock, Target } from 'lucide-react'
import BookCard from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { books, categories, getBestsellers, getNewArrivals, getFeaturedBooks } from '@/lib/data'

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
  'Fiction': 'bg-primary/10',
  'Mystery': 'bg-secondary/20',
  'Fantasy': 'bg-accent/10',
  'Self-Help': 'bg-primary/5',
  'Philosophy': 'bg-secondary/10',
  'Romance': 'bg-primary/15',
  'Sci-Fi': 'bg-accent/15',
  'History': 'bg-secondary/15',
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const bestsellers = getBestsellers().slice(0, 6)
  const newArrivals = getNewArrivals().slice(0, 8)
  const featured = getFeaturedBooks().slice(0, 4)
  const editorsPicks = books.filter(b => b.isFeatured).slice(0, 4)

  // Marquee content
  const marqueeItems = books.slice(0, 15).map(b => `${b.title} by ${b.author}`)

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold italic text-foreground leading-tight text-balance">
                Find Your Next{' '}
                <span className="text-primary">Obsession</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Discover curated collections, rare finds, and literary treasures. 
                Your journey through worlds of imagination starts here.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 px-8"
                  onClick={() => onNavigate('catalog')}
                >
                  Browse Books
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-xl h-12 px-8 border-foreground/20 hover:border-foreground/40"
                  onClick={() => onNavigate('catalog', 'new')}
                >
                  View New Arrivals
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Featured Book with Parallax Shadow */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 translate-x-4 translate-y-4 bg-foreground/10 rounded-2xl blur-xl" />
                    <img
                      src={featured[0]?.coverImage || books[0].coverImage}
                      alt="Featured Book"
                      className="relative w-64 h-96 object-cover rounded-2xl shadow-xl"
                    />
                  </div>
                </motion.div>
                {/* Decorative Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 right-0 w-32 h-32 border border-secondary/30 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute bottom-10 left-0 w-20 h-20 bg-accent/20 rounded-full blur-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <section className="bg-secondary/30 py-4 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={index} className="mx-8 font-mono text-sm text-foreground/70">
              {item} •
            </span>
          ))}
        </div>
      </section>

      {/* Trending Now - Bento Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Trending Now
            </h2>
            <p className="mt-2 text-muted-foreground">What readers are loving this week</p>
          </div>
          <button 
            onClick={() => onNavigate('catalog')} 
            className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Featured Card */}
          <div className="md:col-span-2 lg:col-span-1 lg:row-span-2">
            <BookCard book={featured[0] || books[0]} variant="featured" onNavigate={onNavigate} />
          </div>
          {/* Regular Cards */}
          {bestsellers.slice(0, 4).map((book) => (
            <BookCard key={book.id} book={book} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* New Arrivals - Horizontal Scroll */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                New Arrivals
              </h2>
              <p className="mt-2 text-muted-foreground">Fresh off the press</p>
            </div>
            <button 
              onClick={() => onNavigate('catalog', 'new')} 
              className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-6 px-4 md:px-8 w-max">
            {newArrivals.map((book) => (
              <div key={book.id} className="w-64 shrink-0">
                <BookCard book={book} onNavigate={onNavigate} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor's Picks */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              {"Editor's Picks"}
            </h2>
            <p className="mt-2 text-muted-foreground">Handpicked by our literary experts</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Large Card */}
          <div className="md:col-span-2 lg:row-span-2">
            <BookCard book={editorsPicks[0] || books[0]} variant="featured" onNavigate={onNavigate} />
          </div>
          {/* Small Cards */}
          {editorsPicks.slice(1, 4).map((book) => (
            <BookCard key={book.id} book={book} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Bestsellers - Ranked List */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                Bestsellers
              </h2>
              <p className="mt-2 text-muted-foreground">Our most popular titles</p>
            </div>
            <button 
              onClick={() => onNavigate('catalog')} 
              className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {bestsellers.map((book, index) => (
              <BookCard key={book.id} book={book} variant="horizontal" showRank={index + 1} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* Genre Cards */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Browse by Genre
          </h2>
          <p className="mt-2 text-muted-foreground">Find your next read by category</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = genreIcons[category.icon] || BookOpen
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onNavigate('catalog', category.slug)}
                  className={`block w-full text-left p-6 rounded-2xl ${genreColors[category.name] || 'bg-muted'} hover:shadow-lg transition-shadow`}
                >
                  <IconComponent className="w-8 h-8 text-foreground mb-3" />
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.bookCount} books</p>
                </button>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-8 md:p-16">
            <div className="relative z-10 max-w-2xl">
              <span className="font-mono text-sm text-primary uppercase tracking-wider">Spring Collection</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold italic text-foreground mt-4 text-balance">
                Stories That Bloom With You
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover our curated spring reading list featuring tales of renewal, growth, and new beginnings.
              </p>
              <Button 
                size="lg" 
                className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                onClick={() => onNavigate('catalog')}
              >
                Explore Collection
              </Button>
            </div>
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
              <div className="absolute top-10 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-40 w-32 h-32 bg-accent rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Yetaxahai */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Why Yetaxahai?
          </h2>
          <p className="mt-2 text-muted-foreground">More than a bookstore, a reading companion</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-card rounded-3xl shadow-lg"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Curated Selection
            </h3>
            <p className="text-muted-foreground">
              Every book in our collection is handpicked by our team of literary enthusiasts for quality and impact.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-card rounded-3xl shadow-lg"
          >
            <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
              <Truck className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Fast Delivery
            </h3>
            <p className="text-muted-foreground">
              Get your books delivered across Nepal with express shipping options including same-day delivery in Kathmandu.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-card rounded-3xl shadow-lg"
          >
            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Reader Community
            </h3>
            <p className="text-muted-foreground">
              Join thousands of book lovers. Share reviews, discover recommendations, and connect with fellow readers.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
