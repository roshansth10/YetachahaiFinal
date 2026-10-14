// Yetaxahai Mock Data

export interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  description: string
  genre?: string
  category: string
  language: string
  pages: number
  publisher: string
  isbn: string
  publicationDate?: string
  format: string
  stock: number
  tags?: string[]
  isNewArrival?: boolean
  isBestseller?: boolean
  isFeatured?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'customer' | 'admin'
  avatar?: string
  phone?: string
  address?: string | {
    line1: string
    line2?: string
    city: string
    district: string
    province: string
    postalCode: string
  }
  memberSince: string
  booksOrdered: number
  totalSpent: number
  preferredPayment?: 'esewa' | 'khalti' | 'cod'
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  items: { bookId: string; quantity: number; price: number }[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'esewa' | 'khalti' | 'cod'
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  transactionId?: string
  paymentDate?: string
  shippingAddress: {
    name: string
    phone: string
    line1: string
    line2?: string
    city: string
    district: string
    province: string
    postalCode: string
    notes?: string
  }
  shippingMethod: 'standard' | 'express' | 'sameday'
  createdAt: string
  estimatedDelivery: string
}

export interface Review {
  id: string
  bookId: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  createdAt: string
  helpful: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  bookCount: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: string
  category: string
  createdAt: string
  readTime: number
}

export interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minOrder: number
  maxDiscount?: number
  validFrom: string
  validUntil: string
  usageLimit: number
  usedCount: number
  isActive: boolean
}

// Mock Books Data
export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    price: 899,
    originalPrice: 1299,
    rating: 4.5,
    reviewCount: 234,
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 304,
    publisher: 'Canongate Books',
    isbn: '978-1786892706',
    format: 'Physical',
    stock: 45,
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    price: 749,
    originalPrice: 999,
    rating: 4.8,
    reviewCount: 567,
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Transform your life with tiny changes that deliver remarkable results.',
    genre: 'Self-Help',
    category: 'Self-Help',
    language: 'English',
    pages: 320,
    publisher: 'Avery',
    isbn: '978-0735211292',
    format: 'Physical',
    stock: 78,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    coverImage: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400&h=600&fit=crop',
    price: 1199,
    originalPrice: 1499,
    rating: 4.7,
    reviewCount: 892,
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',
    genre: 'Sci-Fi',
    category: 'Sci-Fi',
    language: 'English',
    pages: 688,
    publisher: 'Ace',
    isbn: '978-0441172719',
    format: 'Physical',
    stock: 32,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '4',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    price: 649,
    originalPrice: 899,
    rating: 4.3,
    reviewCount: 445,
    description: 'A shocking psychological thriller of a woman\'s act of violence against her husband—and of the therapist obsessed with uncovering her motive.',
    genre: 'Mystery',
    category: 'Mystery',
    language: 'English',
    pages: 336,
    publisher: 'Celadon Books',
    isbn: '978-1250301697',
    format: 'Physical',
    stock: 56,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: true,
  },
  {
    id: '5',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    price: 999,
    originalPrice: 1299,
    rating: 4.9,
    reviewCount: 1203,
    description: 'The tale of Kvothe, a magically gifted young man who grows to be the most notorious wizard his world has ever seen.',
    genre: 'Fantasy',
    category: 'Fantasy',
    language: 'English',
    pages: 662,
    publisher: 'DAW Books',
    isbn: '978-0756404741',
    format: 'Physical',
    stock: 23,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '6',
    title: 'Sapiens: A Brief History',
    author: 'Yuval Noah Harari',
    coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    price: 849,
    originalPrice: 1199,
    rating: 4.6,
    reviewCount: 678,
    description: 'A groundbreaking narrative of humanity\'s creation and evolution that explores how biology and history have defined us.',
    genre: 'History',
    category: 'History',
    language: 'English',
    pages: 443,
    publisher: 'Harper',
    isbn: '978-0062316110',
    format: 'Physical',
    stock: 41,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '7',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    price: 399,
    originalPrice: 599,
    rating: 4.8,
    reviewCount: 2341,
    description: 'The story of Elizabeth Bennet, a spirited young woman who learns about the repercussions of hasty judgments.',
    genre: 'Romance',
    category: 'Romance',
    language: 'English',
    pages: 279,
    publisher: 'Penguin Classics',
    isbn: '978-0141439518',
    format: 'Physical',
    stock: 89,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '8',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    price: 549,
    originalPrice: 749,
    rating: 4.4,
    reviewCount: 1567,
    description: 'A magical fable about following your dreams. Santiago, a shepherd boy, travels from Spain to Egypt searching for treasure.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 208,
    publisher: 'HarperOne',
    isbn: '978-0062315007',
    format: 'Physical',
    stock: 67,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '9',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    price: 449,
    originalPrice: 649,
    rating: 4.7,
    reviewCount: 892,
    description: 'The private thoughts of the world\'s most powerful man giving advice to himself on making it through life.',
    genre: 'Philosophy',
    category: 'Philosophy',
    language: 'English',
    pages: 256,
    publisher: 'Modern Library',
    isbn: '978-0812968255',
    format: 'Physical',
    stock: 34,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: true,
  },
  {
    id: '10',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
    price: 349,
    originalPrice: 499,
    rating: 4.5,
    reviewCount: 3456,
    description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 180,
    publisher: 'Scribner',
    isbn: '978-0743273565',
    format: 'Physical',
    stock: 112,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '11',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    coverImage: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400&h=600&fit=crop',
    price: 1099,
    originalPrice: 1399,
    rating: 4.9,
    reviewCount: 567,
    description: 'A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the author of The Martian.',
    genre: 'Sci-Fi',
    category: 'Sci-Fi',
    language: 'English',
    pages: 496,
    publisher: 'Ballantine Books',
    isbn: '978-0593135204',
    format: 'Physical',
    stock: 28,
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '12',
    title: 'Normal People',
    author: 'Sally Rooney',
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    price: 699,
    originalPrice: 899,
    rating: 4.2,
    reviewCount: 789,
    description: 'An exquisite love story about how a single relationship affects two people over many years.',
    genre: 'Romance',
    category: 'Romance',
    language: 'English',
    pages: 273,
    publisher: 'Hogarth',
    isbn: '978-1984822178',
    format: 'Physical',
    stock: 45,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '13',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop',
    price: 799,
    originalPrice: 999,
    rating: 4.6,
    reviewCount: 432,
    description: 'Timeless lessons on wealth, greed, and happiness. Money isn\'t about what you know, it\'s about how you behave.',
    genre: 'Self-Help',
    category: 'Self-Help',
    language: 'English',
    pages: 256,
    publisher: 'Harriman House',
    isbn: '978-0857197689',
    format: 'Physical',
    stock: 61,
    isNewArrival: true,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '14',
    title: 'And Then There Were None',
    author: 'Agatha Christie',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
    price: 449,
    originalPrice: 649,
    rating: 4.7,
    reviewCount: 2134,
    description: 'Ten strangers are lured to an island mansion off the Devon coast. One by one, the guests share a dark secret.',
    genre: 'Mystery',
    category: 'Mystery',
    language: 'English',
    pages: 272,
    publisher: 'William Morrow',
    isbn: '978-0062073488',
    format: 'Physical',
    stock: 78,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '15',
    title: 'The Way of Kings',
    author: 'Brandon Sanderson',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviewCount: 945,
    description: 'An epic fantasy that has become one of the most beloved books of our time. The Stormlight Archive begins.',
    genre: 'Fantasy',
    category: 'Fantasy',
    language: 'English',
    pages: 1007,
    publisher: 'Tor Books',
    isbn: '978-0765365279',
    format: 'Physical',
    stock: 19,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '16',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
    price: 899,
    originalPrice: 1199,
    rating: 4.5,
    reviewCount: 678,
    description: 'A groundbreaking tour of the mind explaining the two systems that drive the way we think.',
    genre: 'Philosophy',
    category: 'Philosophy',
    language: 'English',
    pages: 499,
    publisher: 'Farrar, Straus and Giroux',
    isbn: '978-0374533557',
    format: 'Physical',
    stock: 37,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '17',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    coverImage: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop',
    price: 599,
    originalPrice: 799,
    rating: 4.8,
    reviewCount: 4567,
    description: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life until the wizard Gandalf arrives.',
    genre: 'Fantasy',
    category: 'Fantasy',
    language: 'English',
    pages: 310,
    publisher: 'Mariner Books',
    isbn: '978-0547928227',
    format: 'Physical',
    stock: 95,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '18',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    coverImage: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400&h=600&fit=crop',
    price: 799,
    originalPrice: 1099,
    rating: 4.6,
    reviewCount: 1234,
    description: 'A coming-of-age novel about a girl abandoned by her family who raises herself in the marshes of North Carolina.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 384,
    publisher: 'G.P. Putnam\'s Sons',
    isbn: '978-0735219090',
    format: 'Physical',
    stock: 52,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '19',
    title: '1984',
    author: 'George Orwell',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    price: 399,
    originalPrice: 549,
    rating: 4.7,
    reviewCount: 5678,
    description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 328,
    publisher: 'Signet Classic',
    isbn: '978-0451524935',
    format: 'Physical',
    stock: 134,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '20',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
    price: 749,
    originalPrice: 999,
    rating: 4.5,
    reviewCount: 876,
    description: 'A reclusive Hollywood icon finally tells her story about the love of her life and the truth about her seven husbands.',
    genre: 'Romance',
    category: 'Romance',
    language: 'English',
    pages: 400,
    publisher: 'Washington Square Press',
    isbn: '978-1501161933',
    format: 'Physical',
    stock: 43,
    isNewArrival: true,
    isBestseller: false,
    isFeatured: true,
  },
  {
    id: '21',
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&sat=-100',
    price: 649,
    originalPrice: 849,
    rating: 4.3,
    reviewCount: 2341,
    description: 'A counterintuitive approach to living a good life that challenges conventional self-help advice.',
    genre: 'Self-Help',
    category: 'Self-Help',
    language: 'English',
    pages: 224,
    publisher: 'Harper',
    isbn: '978-0062457714',
    format: 'Physical',
    stock: 87,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '22',
    title: 'The House in the Cerulean Sea',
    author: 'TJ Klune',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop&hue=180',
    price: 899,
    originalPrice: 1199,
    rating: 4.7,
    reviewCount: 456,
    description: 'A magical story about a caseworker who discovers his heart while investigating an orphanage for magical children.',
    genre: 'Fantasy',
    category: 'Fantasy',
    language: 'English',
    pages: 396,
    publisher: 'Tor Books',
    isbn: '978-1250217288',
    format: 'Physical',
    stock: 31,
    isNewArrival: true,
    isBestseller: false,
    isFeatured: true,
  },
  {
    id: '23',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop',
    price: 699,
    originalPrice: 899,
    rating: 4.6,
    reviewCount: 1876,
    description: 'A landmark volume in science writing exploring the mysteries of the universe for general readers.',
    genre: 'History',
    category: 'History',
    language: 'English',
    pages: 212,
    publisher: 'Bantam',
    isbn: '978-0553380163',
    format: 'Physical',
    stock: 48,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '24',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    coverImage: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400&h=600&fit=crop&hue=30',
    price: 599,
    originalPrice: 799,
    rating: 4.6,
    reviewCount: 2345,
    description: 'A powerful story of friendship, betrayal, and redemption set against the backdrop of Afghanistan.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 371,
    publisher: 'Riverhead Books',
    isbn: '978-1594631931',
    format: 'Physical',
    stock: 56,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '25',
    title: 'Educated',
    author: 'Tara Westover',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop&sat=-50',
    price: 849,
    originalPrice: 1099,
    rating: 4.7,
    reviewCount: 1567,
    description: 'A memoir about a young girl who leaves her survivalist family to earn a PhD from Cambridge.',
    genre: 'History',
    category: 'History',
    language: 'English',
    pages: 334,
    publisher: 'Random House',
    isbn: '978-0399590504',
    format: 'Physical',
    stock: 39,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '26',
    title: 'The Art of War',
    author: 'Sun Tzu',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&hue=350',
    price: 299,
    originalPrice: 449,
    rating: 4.5,
    reviewCount: 3421,
    description: 'Ancient Chinese military treatise that has influenced military strategy and business tactics.',
    genre: 'Philosophy',
    category: 'Philosophy',
    language: 'English',
    pages: 68,
    publisher: 'Shambhala',
    isbn: '978-1590302255',
    format: 'Physical',
    stock: 156,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '27',
    title: 'Circe',
    author: 'Madeline Miller',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop&hue=270',
    price: 799,
    originalPrice: 1049,
    rating: 4.6,
    reviewCount: 789,
    description: 'The story of the witch Circe from Greek mythology, who transforms from an awkward nymph into a formidable goddess.',
    genre: 'Fantasy',
    category: 'Fantasy',
    language: 'English',
    pages: 393,
    publisher: 'Back Bay Books',
    isbn: '978-0316556347',
    format: 'Physical',
    stock: 42,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: true,
  },
  {
    id: '28',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop&hue=200',
    price: 699,
    originalPrice: 899,
    rating: 4.4,
    reviewCount: 1876,
    description: 'A journalist and a computer hacker team up to investigate a decades-old disappearance in Sweden.',
    genre: 'Mystery',
    category: 'Mystery',
    language: 'English',
    pages: 672,
    publisher: 'Vintage Crime/Black Lizard',
    isbn: '978-0307454546',
    format: 'Physical',
    stock: 51,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '29',
    title: 'Beach Read',
    author: 'Emily Henry',
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop&hue=30',
    price: 649,
    originalPrice: 849,
    rating: 4.3,
    reviewCount: 567,
    description: 'Two writers with opposite genres challenge each other to write in their rival\'s style over one summer.',
    genre: 'Romance',
    category: 'Romance',
    language: 'English',
    pages: 361,
    publisher: 'Berkley',
    isbn: '978-1984806734',
    format: 'Physical',
    stock: 63,
    isNewArrival: true,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '30',
    title: 'Becoming',
    author: 'Michelle Obama',
    coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop&hue=180',
    price: 999,
    originalPrice: 1299,
    rating: 4.8,
    reviewCount: 2345,
    description: 'An intimate, powerful, and inspiring memoir by the former First Lady of the United States.',
    genre: 'History',
    category: 'History',
    language: 'English',
    pages: 448,
    publisher: 'Crown',
    isbn: '978-1524763138',
    format: 'Physical',
    stock: 47,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '31',
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop&hue=120',
    price: 549,
    originalPrice: 749,
    rating: 4.4,
    reviewCount: 3456,
    description: 'What the rich teach their kids about money that the poor and middle class do not.',
    genre: 'Self-Help',
    category: 'Self-Help',
    language: 'English',
    pages: 336,
    publisher: 'Plata Publishing',
    isbn: '978-1612680194',
    format: 'Physical',
    stock: 92,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '32',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop&hue=15',
    price: 449,
    originalPrice: 599,
    rating: 4.2,
    reviewCount: 4567,
    description: 'The story of Holden Caulfield, a teenage protagonist who has become an icon of teenage rebellion.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 234,
    publisher: 'Back Bay Books',
    isbn: '978-0316769488',
    format: 'Physical',
    stock: 78,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '33',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    coverImage: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop&hue=30',
    price: 1799,
    originalPrice: 2199,
    rating: 4.9,
    reviewCount: 6789,
    description: 'The complete trilogy following Frodo and the Fellowship on their epic quest to destroy the One Ring.',
    genre: 'Fantasy',
    category: 'Fantasy',
    language: 'English',
    pages: 1178,
    publisher: 'Mariner Books',
    isbn: '978-0544003415',
    format: 'Physical',
    stock: 34,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '34',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&hue=330',
    price: 649,
    originalPrice: 849,
    rating: 4.4,
    reviewCount: 1987,
    description: 'A thriller about a wife who goes missing on her fifth wedding anniversary and the husband who becomes the prime suspect.',
    genre: 'Mystery',
    category: 'Mystery',
    language: 'English',
    pages: 432,
    publisher: 'Crown',
    isbn: '978-0307588371',
    format: 'Physical',
    stock: 67,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '35',
    title: 'Man\'s Search for Meaning',
    author: 'Viktor E. Frankl',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop&hue=240',
    price: 449,
    originalPrice: 599,
    rating: 4.8,
    reviewCount: 2345,
    description: 'A psychiatrist\'s memoir about finding meaning even in the most brutal conditions of Nazi concentration camps.',
    genre: 'Philosophy',
    category: 'Philosophy',
    language: 'English',
    pages: 184,
    publisher: 'Beacon Press',
    isbn: '978-0807014295',
    format: 'Physical',
    stock: 54,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: true,
  },
  {
    id: '36',
    title: 'The Martian',
    author: 'Andy Weir',
    coverImage: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400&h=600&fit=crop&hue=15',
    price: 749,
    originalPrice: 999,
    rating: 4.7,
    reviewCount: 1567,
    description: 'An astronaut stranded on Mars must use his ingenuity to survive and find a way back to Earth.',
    genre: 'Sci-Fi',
    category: 'Sci-Fi',
    language: 'English',
    pages: 369,
    publisher: 'Crown',
    isbn: '978-0553418026',
    format: 'Physical',
    stock: 58,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
  },
  {
    id: '37',
    title: 'Little Women',
    author: 'Louisa May Alcott',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop&hue=330',
    price: 349,
    originalPrice: 499,
    rating: 4.6,
    reviewCount: 2876,
    description: 'The beloved story of the four March sisters growing up during the Civil War era.',
    genre: 'Fiction',
    category: 'Fiction',
    language: 'English',
    pages: 449,
    publisher: 'Penguin Classics',
    isbn: '978-0143106654',
    format: 'Physical',
    stock: 71,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '38',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&hue=60',
    price: 699,
    originalPrice: 899,
    rating: 4.5,
    reviewCount: 1234,
    description: 'A guide to spiritual enlightenment that shows readers how to live in the present moment.',
    genre: 'Self-Help',
    category: 'Self-Help',
    language: 'English',
    pages: 236,
    publisher: 'New World Library',
    isbn: '978-1577314806',
    format: 'Physical',
    stock: 45,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '39',
    title: 'Sherlock Holmes: Complete Collection',
    author: 'Arthur Conan Doyle',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop&hue=45',
    price: 999,
    originalPrice: 1399,
    rating: 4.8,
    reviewCount: 3456,
    description: 'The complete adventures of the world\'s greatest detective, Sherlock Holmes.',
    genre: 'Mystery',
    category: 'Mystery',
    language: 'English',
    pages: 1122,
    publisher: 'Bantam Classics',
    isbn: '978-0553328257',
    format: 'Physical',
    stock: 38,
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
  },
  {
    id: '40',
    title: 'A Court of Thorns and Roses',
    author: 'Sarah J. Maas',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop&hue=300',
    price: 849,
    originalPrice: 1099,
    rating: 4.6,
    reviewCount: 987,
    description: 'A fantasy romance retelling of Beauty and the Beast set in a land of immortal faeries.',
    genre: 'Fantasy',
    category: 'Fantasy',
    language: 'English',
    pages: 419,
    publisher: 'Bloomsbury',
    isbn: '978-1619634459',
    format: 'Physical',
    stock: 52,
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
  },
]

// Categories
export const categories: Category[] = [
  { id: '1', name: 'Fiction', slug: 'fiction', description: 'Imaginative narratives and stories', icon: 'book-open', bookCount: 12 },
  { id: '2', name: 'Mystery', slug: 'mystery', description: 'Suspenseful tales of crime and detection', icon: 'search', bookCount: 8 },
  { id: '3', name: 'Fantasy', slug: 'fantasy', description: 'Magical worlds and epic adventures', icon: 'sparkles', bookCount: 10 },
  { id: '4', name: 'Self-Help', slug: 'self-help', description: 'Personal growth and development', icon: 'target', bookCount: 6 },
  { id: '5', name: 'Philosophy', slug: 'philosophy', description: 'Wisdom and deep thinking', icon: 'brain', bookCount: 4 },
  { id: '6', name: 'Romance', slug: 'romance', description: 'Love stories and relationships', icon: 'heart', bookCount: 5 },
  { id: '7', name: 'Sci-Fi', slug: 'sci-fi', description: 'Science fiction and futuristic tales', icon: 'rocket', bookCount: 4 },
  { id: '8', name: 'History', slug: 'history', description: 'Stories from the past', icon: 'clock', bookCount: 4 },
]

// Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@yetaxahai.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    memberSince: '2023-01-15',
    booksOrdered: 0,
    totalSpent: 0,
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Avid Reader',
    email: 'customer@yetaxahai.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    phone: '+977-9841234567',
    address: 'Thamel Marg 45, Kathmandu',
    memberSince: '2023-06-20',
    booksOrdered: 12,
    totalSpent: 8750,
    preferredPayment: 'esewa',
    createdAt: '2023-06-20T00:00:00Z',
  },
]

// Sample Orders
export const orders: Order[] = [
  {
    id: 'Yetaxahai-2024-00001',
    userId: '2',
    items: [
      { bookId: '1', quantity: 1, price: 899 },
      { bookId: '2', quantity: 2, price: 749 },
    ],
    subtotal: 2397,
    shipping: 100,
    discount: 200,
    total: 2297,
    status: 'delivered',
    paymentMethod: 'esewa',
    paymentStatus: 'paid',
    transactionId: 'TXN-ESW-20240510-ABC123',
    paymentDate: '2024-05-10T10:30:00Z',
    shippingAddress: {
      name: 'Avid Reader',
      phone: '+977-9841234567',
      line1: 'Thamel Marg 45',
      line2: 'Near Garden of Dreams',
      city: 'Kathmandu',
      district: 'Kathmandu',
      province: 'Bagmati',
      postalCode: '44600',
    },
    shippingMethod: 'standard',
    createdAt: '2024-05-10T10:25:00Z',
    estimatedDelivery: '2024-05-17',
  },
  {
    id: 'Yetaxahai-2024-00002',
    userId: '2',
    items: [
      { bookId: '5', quantity: 1, price: 999 },
    ],
    subtotal: 999,
    shipping: 200,
    discount: 0,
    total: 1199,
    status: 'shipped',
    paymentMethod: 'khalti',
    paymentStatus: 'paid',
    transactionId: 'KHL-TXN-XYZ789-2024',
    paymentDate: '2024-05-12T14:15:00Z',
    shippingAddress: {
      name: 'Avid Reader',
      phone: '+977-9841234567',
      line1: 'Thamel Marg 45',
      city: 'Kathmandu',
      district: 'Kathmandu',
      province: 'Bagmati',
      postalCode: '44600',
    },
    shippingMethod: 'express',
    createdAt: '2024-05-12T14:10:00Z',
    estimatedDelivery: '2024-05-15',
  },
  {
    id: 'Yetaxahai-2024-00003',
    userId: '2',
    items: [
      { bookId: '11', quantity: 1, price: 1099 },
      { bookId: '15', quantity: 1, price: 1299 },
    ],
    subtotal: 2398,
    shipping: 100,
    discount: 0,
    total: 2548,
    status: 'processing',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    shippingAddress: {
      name: 'Avid Reader',
      phone: '+977-9841234567',
      line1: 'Thamel Marg 45',
      city: 'Kathmandu',
      district: 'Kathmandu',
      province: 'Bagmati',
      postalCode: '44600',
      notes: 'Please call before delivery',
    },
    shippingMethod: 'standard',
    createdAt: '2024-05-14T09:00:00Z',
    estimatedDelivery: '2024-05-21',
  },
]

// Utility functions
export function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString('en-NP')}`
}

// Export aliases for compatibility
export { mockBooks as books }
export { mockUsers as users }

// Reviews
export const reviews: Review[] = [
  {
    id: '1',
    bookId: '1',
    userId: '2',
    userName: 'Avid Reader',
    rating: 5,
    title: 'A life-changing read!',
    content: 'This book completely changed my perspective on life. The concept of the Midnight Library is so beautiful and thought-provoking. Highly recommend!',
    createdAt: '2024-05-15',
    helpful: 24,
  },
  {
    id: '2',
    bookId: '2',
    userId: '2',
    userName: 'Avid Reader',
    rating: 5,
    title: 'Practical and transformative',
    content: 'James Clear breaks down habit formation in such a clear and actionable way. I have already started implementing the strategies and seeing results.',
    createdAt: '2024-05-10',
    helpful: 45,
  },
]

// Coupons
export const coupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    discount: 10,
    type: 'percentage',
    minOrder: 500,
    maxDiscount: 200,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    usageLimit: 1000,
    usedCount: 234,
    isActive: true,
  },
  {
    id: '2',
    code: 'FLAT100',
    discount: 100,
    type: 'fixed',
    minOrder: 1000,
    validFrom: '2024-05-01',
    validUntil: '2024-05-31',
    usageLimit: 500,
    usedCount: 123,
    isActive: true,
  },
]

// Blog Posts
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of Slow Reading in a Fast World',
    slug: 'art-of-slow-reading',
    excerpt: 'Discover why taking your time with books can transform your reading experience and deepen your understanding.',
    content: 'In our fast-paced digital age, the practice of slow reading has become a revolutionary act...',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop',
    author: 'Yetaxahai Editorial',
    category: 'Reading Tips',
    createdAt: '2024-05-10',
    readTime: 5,
  },
  {
    id: '2',
    title: '10 Must-Read Books for Spring 2024',
    slug: 'must-read-spring-2024',
    excerpt: 'Our curated selection of the best new releases and timeless classics perfect for the season.',
    content: 'Spring is the perfect time to refresh your reading list with new adventures and stories...',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=400&fit=crop',
    author: 'Yetaxahai Editorial',
    category: 'Book Lists',
    createdAt: '2024-05-05',
    readTime: 8,
  },
]

// Nepal Locations
export const nepalCities = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Butwal', 
  'Biratnagar', 'Dharan', 'Hetauda', 'Birgunj', 'Janakpur', 'Nepalgunj',
  'Dhangadhi', 'Itahari', 'Bharatpur', 'Damak', 'Tulsipur', 'Lahan'
]

export const nepalDistricts = [
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke', 'Bara',
  'Bardiya', 'Bhaktapur', 'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh', 'Dang', 'Darchula',
  'Dhading', 'Dhankuta', 'Dhanusa', 'Dholkha', 'Dolpa', 'Doti', 'Gorkha', 'Gulmi',
  'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla', 'Kailali', 'Kalikot', 'Kanchanpur',
  'Kapilvastu', 'Kaski', 'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung', 'Mahottari',
  'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi', 'Nawalpur', 'Nuwakot',
  'Okhaldhunga', 'Palpa', 'Panchthar', 'Parasi', 'Parbat', 'Parsa', 'Pyuthan', 'Ramechhap',
  'Rasuwa', 'Rautahat', 'Rolpa', 'Rukum East', 'Rukum West', 'Rupandehi', 'Salyan', 'Sankhuwasabha',
  'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha', 'Solukhumbu', 'Sunsari', 'Surkhet',
  'Syangja', 'Tanahu', 'Taplejung', 'Terhathum', 'Udayapur'
]

export const nepalProvinces = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'
]

// Helper functions
export function getBookById(id: string): Book | undefined {
  return mockBooks.find(book => book.id === id)
}

export function getBooksByGenre(genre: string): Book[] {
  return mockBooks.filter(book => book.genre.toLowerCase() === genre.toLowerCase())
}

export function getBestsellers(): Book[] {
  return mockBooks.filter(book => book.isBestseller)
}

export function getNewArrivals(): Book[] {
  return mockBooks.filter(book => book.isNewArrival)
}

export function getFeaturedBooks(): Book[] {
  return mockBooks.filter(book => book.isFeatured)
}

export function searchBooks(query: string): Book[] {
  const lowerQuery = query.toLowerCase()
  return mockBooks.filter(book => 
    book.title.toLowerCase().includes(lowerQuery) ||
    book.author.toLowerCase().includes(lowerQuery) ||
    book.genre.toLowerCase().includes(lowerQuery)
  )
}
