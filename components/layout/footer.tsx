'use client'

import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FooterProps {
  onNavigate: (page: string, data?: unknown) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h3 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground mb-4">
            Join the Yetaxahai Community
          </h3>
          <p className="text-muted-foreground mb-6">
            Get curated book recommendations, exclusive offers, and literary news delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-background"
            />
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Subscribe
            </Button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border">
          {/* About */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">About</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Story
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Team
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => onNavigate('catalog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Books
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Bestsellers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'new')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wishlist')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => onNavigate('catalog', 'Fiction')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Fiction
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'Mystery')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mystery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'Fantasy')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Fantasy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', 'Self-Help')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Self-Help
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Thamel, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+977-1-4123456</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span>hello@yetaxahai.com.np</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-4">
              <span className="font-serif text-xl font-bold italic text-foreground">Yetaxahai</span>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Policy Links */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-foreground transition-colors">
                Terms of Service
              </button>
              <button className="hover:text-foreground transition-colors">
                Shipping
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
