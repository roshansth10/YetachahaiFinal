"use client";

import { useState } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  FileText,
  Truck,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FooterProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState("");
  const [activeModal, setActiveModal] = useState<
    "privacy" | "terms" | "shipping" | null
  >(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing to Yetaxahai!", {
      description:
        "You will receive curated book lists and exclusive offers in your inbox.",
    });
    setEmail("");
  };

  return (
    <footer className="bg-card border-t border-border/80">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h3 className="font-serif text-3xl md:text-4xl font-bold italic text-foreground mb-3">
            Join the Yetaxahai Community
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
            Get curated book recommendations, exclusive Nepali literary events,
            and special reader discounts delivered to your inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
            onSubmit={handleSubscribe}
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background text-sm h-11 rounded-xl"
              required
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11 px-6 shadow-sm"
            >
              Subscribe
            </Button>
          </form>
        </div>

        {/* Footer Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/70">
          {/* About */}
          <div>
            <h4 className="font-serif font-bold text-base text-foreground mb-4">
              About Yetaxahai
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Why Yetaxahai?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("catalog")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Authentic Editions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("shipping")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Shipping Across Nepal
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-base text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate("catalog")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  All 40 Books
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onNavigate("catalog", { search: "bestseller" })
                  }
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Top Bestsellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("catalog", "new")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("wishlist")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  My Wishlist
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("cart")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Shopping Cart
                </button>
              </li>
            </ul>
          </div>

          {/* All 8 Categories */}
          <div>
            <h4 className="font-serif font-bold text-base text-foreground mb-4">
              All 8 Genres
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onNavigate("catalog", cat.name)}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors text-left truncate"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Thamel Address */}
          <div>
            <h4 className="font-serif font-bold text-base text-foreground mb-4">
              Visit & Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>Thamel Marg 45, Kathmandu 44600, Nepal</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>+977-1-4123456</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <span>hello@yetaxahai.com.np</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/80 bg-[#f7f2e7]/40 dark:bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl font-bold italic text-foreground">
                Yetaxahai
              </span>
              <span className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Yetaxahai Online Bookstore.
              </span>
            </div>

            {/* Social Links with accessible labels */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full"
                aria-label="Yetaxahai on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full"
                aria-label="Yetaxahai on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full"
                aria-label="Yetaxahai on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* Valid Policy Links */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button
                onClick={() => setActiveModal("privacy")}
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal("terms")}
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal("shipping")}
                className="hover:text-primary transition-colors"
              >
                Shipping Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      <Dialog
        open={activeModal !== null}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="max-w-lg bg-card rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold italic text-foreground">
              {activeModal === "privacy" && "Privacy Policy"}
              {activeModal === "terms" && "Terms of Service"}
              {activeModal === "shipping" && "Shipping & Delivery in Nepal"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-3 leading-relaxed">
              {activeModal === "privacy" && (
                <>
                  Yetaxahai values your privacy. We store your contact details
                  and order addresses securely solely for order fulfillment
                  across Nepal. We never sell or share customer data with
                  third-party advertisers.
                </>
              )}
              {activeModal === "terms" && (
                <>
                  All prices listed on Yetaxahai are in Nepali Rupees (Rs., NPR)
                  inclusive of taxes. Books are guaranteed 100% genuine
                  printings. If a book arrives damaged or misprinted, we offer a
                  hassle-free 7-day replacement guarantee.
                </>
              )}
              {activeModal === "shipping" && (
                <>
                  We deliver to all 77 districts of Nepal. Within Kathmandu,
                  Lalitpur, and Bhaktapur, delivery takes 24–48 hours. Outside
                  the Valley, delivery takes 3–5 business days. Free delivery on
                  orders over Rs. 1,000. Payment methods include Cash on
                  Delivery (COD), eSewa, and Khalti.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => setActiveModal(null)}
              className="bg-primary text-primary-foreground rounded-xl text-xs h-9"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
