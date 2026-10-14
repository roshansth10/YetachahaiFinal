"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit2,
  Save,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { formatPrice, getBookById } from "@/lib/data"

interface ProfilePageProps {
  onNavigate: (page: string, data?: unknown) => void
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, orders, wishlist, logout, updateProfile } = useStore()
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "settings">("profile")
  const [isEditing, setIsEditing] = useState(false)
  const formatAddress = (addr?: unknown): string => {
    if (!addr) return ""
    if (typeof addr === "string") return addr
    if (typeof addr === "object" && addr !== null) {
      const a = addr as Record<string, string | undefined>
      return [a.line1, a.line2, a.city, a.district, a.province].filter(Boolean).join(", ")
    }
    return ""
  }
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: formatAddress(user?.address),
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => onNavigate("auth")}>Sign In</Button>
        </div>
      </div>
    )
  }

  const handleSaveProfile = () => {
    updateProfile(editData)
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50"
      case "shipped":
        return "text-blue-600 bg-blue-50"
      case "processing":
        return "text-amber-600 bg-amber-50"
      case "pending":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "processing":
        return <Package className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package, count: orders.length },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 sticky top-24"
            >
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-serif font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.role === "admin" && (
                  <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    Administrator
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => onNavigate("wishlist")}
                  className="p-3 bg-muted/50 rounded-xl text-center hover:bg-muted transition-colors"
                >
                  <Heart className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-lg font-bold text-foreground">{wishlist.length}</span>
                  <p className="text-xs text-muted-foreground">Wishlist</p>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="p-3 bg-muted/50 rounded-xl text-center hover:bg-muted transition-colors"
                >
                  <Package className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-lg font-bold text-foreground">{orders.length}</span>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </button>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          activeTab === tab.id ? "bg-primary-foreground/20" : "bg-muted"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}

                {user.role === "admin" && (
                  <button
                    onClick={() => onNavigate("admin")}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Admin Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    logout()
                    onNavigate("home")
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold text-foreground">Personal Information</h2>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="h-12"
                      />
                    ) : (
                      <p className="text-foreground font-medium p-3 bg-muted/50 rounded-lg">{user.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email Address
                    </Label>
                    <p className="text-foreground font-medium p-3 bg-muted/50 rounded-lg">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="h-12"
                      />
                    ) : (
                      <p className="text-foreground font-medium p-3 bg-muted/50 rounded-lg">
                        {user.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Delivery Address
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="h-12"
                      />
                    ) : (
                      <p className="text-foreground font-medium p-3 bg-muted/50 rounded-lg">
                        {formatAddress(user.address) || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Member Since */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Member since:{" "}
                    <span className="text-foreground font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Order History</h2>

                {orders.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start shopping to see your order history here
                    </p>
                    <Button onClick={() => onNavigate("catalog")}>Browse Books</Button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl border border-border p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-mono font-medium text-foreground">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment</p>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground capitalize">{order.paymentMethod}</span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="space-y-3">
                          {order.items.map((item) => {
                            const book = getBookById(item.bookId)
                            return (
                              <div key={item.bookId} className="flex items-center gap-4">
                                <div className="w-12 h-16 rounded-lg bg-[#f6f1e8] dark:bg-muted/40 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={book?.coverImage || '/books/the-midnight-library.jpg'}
                                    alt={book?.title || 'Book'}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">{book?.title || 'Book'}</p>
                                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium text-foreground">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                          <span className="text-muted-foreground">Total</span>
                          <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Account Settings</h2>

                {/* Notification Settings */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Order updates", desc: "Get notified about your order status" },
                      { label: "New arrivals", desc: "Be the first to know about new books" },
                      { label: "Promotions", desc: "Receive special offers and discounts" },
                      { label: "Newsletter", desc: "Weekly book recommendations" },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-destructive/5 rounded-2xl border border-destructive/20 p-6">
                  <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
