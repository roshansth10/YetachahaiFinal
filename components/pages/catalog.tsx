'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Grid3X3, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import BookCard from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { books, categories } from '@/lib/data'

interface CatalogPageProps {
  onNavigate: (page: string, data?: unknown) => void
  initialCategory?: string
}

export default function CatalogPage({ onNavigate, initialCategory }: CatalogPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [authorSearch, setAuthorSearch] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books]

    // Genre filter
    if (selectedGenres.length > 0) {
      result = result.filter(book => 
        selectedGenres.some(g => book.category?.toLowerCase() === g.toLowerCase())
      )
    }

    // Format filter
    if (selectedFormats.length > 0) {
      result = result.filter(book => selectedFormats.includes(book.format))
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      result = result.filter(book => selectedLanguages.includes(book.language))
    }

    // Price filter
    result = result.filter(book => 
      book.price >= priceRange[0] && book.price <= priceRange[1]
    )

    // Rating filter
    if (minRating > 0) {
      result = result.filter(book => book.rating >= minRating)
    }

    // Author search
    if (authorSearch.trim()) {
      result = result.filter(book => 
        book.author.toLowerCase().includes(authorSearch.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0))
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }

    return result
  }, [selectedGenres, selectedFormats, selectedLanguages, priceRange, minRating, authorSearch, sortBy])

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    )
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedFormats([])
    setSelectedLanguages([])
    setPriceRange([0, 5000])
    setMinRating(0)
    setAuthorSearch('')
  }

  const hasActiveFilters = selectedGenres.length > 0 || selectedFormats.length > 0 || 
    selectedLanguages.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000 || 
    minRating > 0 || authorSearch.trim()

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Genre Filter */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Genre</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedGenres.includes(category.name)}
                onCheckedChange={() => toggleGenre(category.name)}
              />
              <span className="text-sm text-foreground">{category.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">({category.bookCount})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={5000}
          step={100}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Rs {priceRange[0]}</span>
          <span>Rs {priceRange[1]}</span>
        </div>
      </div>

      {/* Format Filter */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Format</h4>
        <div className="space-y-2">
          {['Physical', 'Ebook', 'Audiobook'].map((format) => (
            <label key={format} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedFormats.includes(format)}
                onCheckedChange={() => toggleFormat(format)}
              />
              <span className="text-sm text-foreground">{format}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language Filter */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Language</h4>
        <div className="space-y-2">
          {['English', 'Nepali', 'Hindi'].map((lang) => (
            <label key={lang} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedLanguages.includes(lang)}
                onCheckedChange={() => toggleLanguage(lang)}
              />
              <span className="text-sm text-foreground">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Minimum Rating</h4>
        <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Author Search */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Author</h4>
        <Input
          placeholder="Search by author..."
          value={authorSearch}
          onChange={(e) => setAuthorSearch(e.target.value)}
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          {initialCategory ? initialCategory : 'All Books'}
        </h1>
        <p className="text-muted-foreground">
          {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Mobile Filters */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {selectedGenres.length + selectedFormats.length + selectedLanguages.length + (minRating > 0 ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Active Filters Pills */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {selectedGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full hover:bg-primary/20"
              >
                {genre}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="hidden sm:flex items-center border border-border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-muted' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Books Grid */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {filteredBooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <p className="text-xl text-muted-foreground mb-4">No books found matching your criteria</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredBooks.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    onNavigate={onNavigate}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
