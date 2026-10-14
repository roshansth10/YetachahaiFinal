'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Grid3X3, List, SlidersHorizontal, X, RotateCcw, Search } from 'lucide-react'
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
import { books, categories, type Book } from '@/lib/data'

interface CatalogPageProps {
  onNavigate: (page: string, data?: unknown) => void
  initialCategory?: string | { search?: string; genre?: string }
}

export default function CatalogPage({ onNavigate, initialCategory }: CatalogPageProps) {
  // Read initial params from window URL if available
  const [isClient, setIsClient] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [authorSearch, setAuthorSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Parse URL on client mount
  useEffect(() => {
    setIsClient(true)
    const params = new URLSearchParams(window.location.search)
    
    // Check initialCategory prop or URL param
    let initialGenreList: string[] = []
    if (typeof initialCategory === 'string' && initialCategory) {
      if (initialCategory === 'new') {
        setSortBy('newest')
      } else {
        initialGenreList = [initialCategory]
      }
    } else if (typeof initialCategory === 'object' && initialCategory) {
      if (initialCategory.genre) initialGenreList = [initialCategory.genre]
      if (initialCategory.search) setSearchQuery(initialCategory.search)
    }

    const urlGenres = params.get('genre')
    if (urlGenres) {
      initialGenreList = urlGenres.split(',').filter(Boolean)
    }
    if (initialGenreList.length > 0) {
      setSelectedGenres(initialGenreList)
    }

    const urlFormats = params.get('format')
    if (urlFormats) setSelectedFormats(urlFormats.split(',').filter(Boolean))

    const urlLanguages = params.get('lang')
    if (urlLanguages) setSelectedLanguages(urlLanguages.split(',').filter(Boolean))

    const urlMinPrice = params.get('minPrice')
    const urlMaxPrice = params.get('maxPrice')
    if (urlMinPrice !== null || urlMaxPrice !== null) {
      setPriceRange([
        urlMinPrice ? parseInt(urlMinPrice, 10) : 0,
        urlMaxPrice ? parseInt(urlMaxPrice, 10) : 5000,
      ])
    }

    const urlRating = params.get('rating')
    if (urlRating) setMinRating(parseFloat(urlRating))

    const urlAuthor = params.get('author')
    if (urlAuthor) setAuthorSearch(urlAuthor)

    const urlSearch = params.get('q') || params.get('search')
    if (urlSearch) setSearchQuery(urlSearch)

    const urlSort = params.get('sort')
    if (urlSort) setSortBy(urlSort)

    const urlView = params.get('view')
    if (urlView === 'list' || urlView === 'grid') setViewMode(urlView)
  }, [initialCategory])

  // Synchronize state with URL search params
  const updateUrlParams = useCallback((newParams: Record<string, string | null>) => {
    if (typeof window === 'undefined') return
    const currentUrl = new URL(window.location.href)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === '0') {
        currentUrl.searchParams.delete(key)
      } else {
        currentUrl.searchParams.set(key, value)
      }
    })
    window.history.replaceState({}, '', currentUrl.toString())
  }, [])

  // Sync state changes to URL
  useEffect(() => {
    if (!isClient) return
    updateUrlParams({
      genre: selectedGenres.length > 0 ? selectedGenres.join(',') : null,
      format: selectedFormats.length > 0 ? selectedFormats.join(',') : null,
      lang: selectedLanguages.length > 0 ? selectedLanguages.join(',') : null,
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 5000 ? priceRange[1].toString() : null,
      rating: minRating > 0 ? minRating.toString() : null,
      author: authorSearch.trim() || null,
      q: searchQuery.trim() || null,
      sort: sortBy !== 'featured' ? sortBy : null,
      view: viewMode !== 'grid' ? viewMode : null,
    })
  }, [selectedGenres, selectedFormats, selectedLanguages, priceRange, minRating, authorSearch, searchQuery, sortBy, viewMode, isClient, updateUrlParams])

  // Compute live genre counts directly from source of truth
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    categories.forEach(cat => {
      counts[cat.name] = books.filter(b =>
        b.genres.some(g => g.toLowerCase() === cat.name.toLowerCase()) ||
        b.category?.toLowerCase() === cat.name.toLowerCase()
      ).length
    })
    return counts
  }, [])

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books]

    // Multi-genre filter as OR (union) with de-duplication
    if (selectedGenres.length > 0) {
      const lowerSelected = selectedGenres.map(g => g.toLowerCase())
      result = result.filter(book =>
        book.genres.some(g => lowerSelected.includes(g.toLowerCase())) ||
        lowerSelected.includes(book.category?.toLowerCase())
      )
    }

    // Format filter
    if (selectedFormats.length > 0) {
      result = result.filter(book =>
        selectedFormats.some(f => book.formats?.includes(f) || book.format === f)
      )
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      result = result.filter(book =>
        selectedLanguages.some(l => book.languages?.includes(l) || book.language === l)
      )
    }

    // Price filter (Rs 0 - 5000)
    result = result.filter(book =>
      book.price >= priceRange[0] && book.price <= priceRange[1]
    )

    // Rating filter
    if (minRating > 0) {
      result = result.filter(book => book.rating >= minRating)
    }

    // Author search
    if (authorSearch.trim()) {
      const query = authorSearch.toLowerCase().trim()
      result = result.filter(book => book.author.toLowerCase().includes(query))
    }

    // Global Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(book =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.genres.some(g => g.toLowerCase().includes(q)) ||
        book.description.toLowerCase().includes(q)
      )
    }

    // Sort options
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
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0) || b.publishedYear - a.publishedYear)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        // Featured
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
    }

    return result
  }, [selectedGenres, selectedFormats, selectedLanguages, priceRange, minRating, authorSearch, searchQuery, sortBy])

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    )
  }

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }

  // Clear all filters and completely reset state and URL query params
  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedFormats([])
    setSelectedLanguages([])
    setPriceRange([0, 5000])
    setMinRating(0)
    setAuthorSearch('')
    setSearchQuery('')
    setSortBy('featured')
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    selectedFormats.length > 0 ||
    selectedLanguages.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000 ||
    minRating > 0 ||
    authorSearch.trim().length > 0 ||
    searchQuery.trim().length > 0

  // Filter content component for both Desktop Sidebar and Mobile Drawer
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-6">
      {/* Search within results */}
      <div>
        <h4 className="font-semibold text-foreground text-sm mb-2.5">Search Keywords</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter by title, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm bg-background/80 rounded-xl"
          />
        </div>
      </div>

      {/* Genre Filter with Computed Counts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground text-sm">Genre (Multi-select)</h4>
          {selectedGenres.length > 0 && (
            <button
              onClick={() => setSelectedGenres([])}
              className="text-xs text-primary hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {categories.map((category) => {
            const count = genreCounts[category.name] ?? 0
            const isChecked = selectedGenres.includes(category.name)
            return (
              <label
                key={category.id}
                className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-sm"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleGenre(category.name)}
                  id={`cat-${category.name}`}
                />
                <span className={`text-sm ${isChecked ? 'font-semibold text-primary' : 'text-foreground'}`}>
                  {category.name}
                </span>
                <span className="text-xs font-mono text-muted-foreground ml-auto">({count})</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-foreground text-sm">Price Range</h4>
          <span className="font-mono text-xs font-semibold text-primary">
            Rs. {priceRange[0]} - Rs. {priceRange[1]}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={(val) => setPriceRange([val[0], val[1]])}
          min={0}
          max={5000}
          step={50}
          className="my-3"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Rs. 0</span>
          <span>Rs. 2,500</span>
          <span>Rs. 5,000</span>
        </div>
      </div>

      {/* Format Filter */}
      <div>
        <h4 className="font-semibold text-foreground text-sm mb-2.5">Format</h4>
        <div className="space-y-2">
          {['Physical', 'Ebook', 'Audiobook'].map((format) => (
            <label
              key={format}
              className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-sm"
            >
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
        <h4 className="font-semibold text-foreground text-sm mb-2.5">Language</h4>
        <div className="space-y-2">
          {['English', 'Nepali', 'Hindi'].map((lang) => (
            <label
              key={lang}
              className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-sm"
            >
              <Checkbox
                checked={selectedLanguages.includes(lang)}
                onCheckedChange={() => toggleLanguage(lang)}
              />
              <span className="text-sm text-foreground">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <h4 className="font-semibold text-foreground text-sm mb-2.5">Minimum Rating</h4>
        <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger className="w-full bg-background/80 rounded-xl">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="4.0">★ 4.0 and above</SelectItem>
            <SelectItem value="4.5">★ 4.5 and above</SelectItem>
            <SelectItem value="4.8">★ 4.8 and above</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Author Search */}
      <div>
        <h4 className="font-semibold text-foreground text-sm mb-2.5">Author Filter</h4>
        <Input
          placeholder="e.g. Tolkien, Clear..."
          value={authorSearch}
          onChange={(e) => setAuthorSearch(e.target.value)}
          className="h-10 text-sm bg-background/80 rounded-xl"
        />
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col gap-2">
        {isMobile && (
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl"
            onClick={() => setMobileFiltersOpen(false)}
          >
            Apply Filters ({filteredBooks.length} books)
          </Button>
        )}
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="w-full rounded-xl border-border text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors h-10"
            onClick={clearFilters}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold italic text-foreground tracking-tight">
          {selectedGenres.length === 1
            ? `${selectedGenres[0]} Books`
            : selectedGenres.length > 1
            ? `Books (${selectedGenres.join(' + ')})`
            : searchQuery
            ? `Search: "${searchQuery}"`
            : 'Explore All Books'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredBooks.length}</span> {filteredBooks.length === 1 ? 'book' : 'books'} found in the catalogue
        </p>
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-16 md:top-20 z-30 bg-[#faf6ee]/95 dark:bg-card/95 backdrop-blur-md py-3 mb-6 border-y border-border/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Mobile Filter Button & Active Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Mobile Filter Sheet Button (< 1024px) */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden min-h-[44px] px-3.5 rounded-xl border-primary/40 font-medium"
              >
                <Filter className="w-4 h-4 mr-2 text-primary" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {selectedGenres.length +
                      selectedFormats.length +
                      selectedLanguages.length +
                      (minRating > 0 ? 1 : 0) +
                      (authorSearch ? 1 : 0) +
                      (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto bg-card p-6">
              <SheetHeader className="mb-4">
                <SheetTitle className="font-serif text-2xl font-bold italic text-foreground">
                  Filter Books
                </SheetTitle>
              </SheetHeader>
              <FilterContent isMobile={true} />
            </SheetContent>
          </Sheet>

          {/* Active Filter Chips with click-to-remove */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors focus:outline-none"
                title={`Remove ${genre} filter`}
              >
                <span>{genre}</span>
                <X className="w-3 h-3" />
              </button>
            ))}

            {selectedFormats.map((format) => (
              <button
                key={format}
                onClick={() => toggleFormat(format)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full hover:bg-amber-500/20 transition-colors focus:outline-none"
                title={`Remove ${format} format`}
              >
                <span>{format}</span>
                <X className="w-3 h-3" />
              </button>
            ))}

            {selectedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full hover:bg-blue-500/20 transition-colors focus:outline-none"
                title={`Remove ${lang} language`}
              >
                <span>{lang}</span>
                <X className="w-3 h-3" />
              </button>
            ))}

            {minRating > 0 && (
              <button
                onClick={() => setMinRating(0)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full hover:bg-emerald-500/20 transition-colors focus:outline-none"
                title="Remove rating filter"
              >
                <span>★ {minRating}+</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {authorSearch && (
              <button
                onClick={() => setAuthorSearch('')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full hover:bg-purple-500/20 transition-colors focus:outline-none"
                title="Remove author filter"
              >
                <span>Author: {authorSearch}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-primary underline ml-1 font-medium py-1 px-1.5"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Sort dropdown and Grid/List view toggle */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 sm:h-10 min-w-[140px] sm:min-w-[160px] bg-background/90 rounded-xl text-xs sm:text-sm">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="featured">Featured & Popular</SelectItem>
                <SelectItem value="newest">New Arrivals First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="title">Title: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center border border-border/80 rounded-xl overflow-hidden bg-background/80 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="List view"
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar (Desktop) + Content (Books) */}
      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar (visible on lg: >= 1024px) */}
        <aside className="hidden lg:block w-72 shrink-0 bg-card/60 backdrop-blur-xs p-6 rounded-3xl border border-border/70 shadow-sm sticky top-36">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
            <h3 className="font-serif text-lg font-bold italic text-foreground">
              Filter Books
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterContent isMobile={false} />
        </aside>

        {/* Books Display Grid / List */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {filteredBooks.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="text-center py-16 px-4 bg-card/50 rounded-3xl border border-dashed border-border p-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                  No books match your criteria
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  Try adjusting your filters, expanding your price range, or clearing current selections to explore our full catalogue.
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 px-6 font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Filters
                </Button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    variant="default"
                    onNavigate={onNavigate}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    variant="horizontal"
                    onNavigate={onNavigate}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
