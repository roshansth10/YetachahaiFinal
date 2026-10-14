"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Camera,
  Trash2,
  Upload,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UserAvatar from "@/components/ui/user-avatar"
import AvatarCropModal from "@/components/ui/avatar-crop-modal"
import { useStore } from "@/lib/store"
import { formatPrice, nepalDistricts, nepalProvinces, mockBooks } from "@/lib/data"
import { toast } from "sonner"

interface ProfilePageProps {
  onNavigate: (page: string, data?: unknown) => void
  initialTab?: "profile" | "orders" | "settings"
}

interface StructuredAddress {
  tole: string
  ward: string
  municipality: string
  district: string
  province: string
}

function parseAddress(addr?: unknown): StructuredAddress {
  if (!addr) {
    return { tole: "", ward: "", municipality: "", district: "Kathmandu", province: "Bagmati" }
  }
  if (typeof addr === "object" && addr !== null) {
    const a = addr as Record<string, string | undefined>
    return {
      tole: a.line1 || "",
      ward: a.ward || "",
      municipality: a.city || a.municipality || "",
      district: a.district || "Kathmandu",
      province: a.province || "Bagmati",
    }
  }
  if (typeof addr === "string") {
    const parts = addr.split(",").map((s) => s.trim())
    return {
      tole: parts[0] || "",
      ward: parts[1] || "",
      municipality: parts[2] || "",
      district: parts[3] || "Kathmandu",
      province: parts[4] || "Bagmati",
    }
  }
  return { tole: "", ward: "", municipality: "", district: "Kathmandu", province: "Bagmati" }
}

function formatNepalAddress(addr: StructuredAddress): string {
  const parts = [
    addr.tole,
    addr.ward ? `Ward ${addr.ward}` : "",
    addr.municipality,
    addr.district,
    addr.province,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "No delivery address provided"
}

export default function ProfilePage({ onNavigate, initialTab = "profile" }: ProfilePageProps) {
  const { user, orders, wishlist, logout, updateProfile, uploadAvatar, removeAvatar, isAuthLoading } = useStore()
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "settings">(initialTab)
  const [isEditing, setIsEditing] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Address and personal details
  const [addressData, setAddressData] = useState<StructuredAddress>(parseAddress(user?.address))
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  })

  // Photo upload & crop state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false)

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        phone: user.phone || "",
      })
      setAddressData(parseAddress(user.address))
    }
  }, [user])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-serif">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-background flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md bg-card border border-border p-8 rounded-2xl shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Sign in to your account</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please sign in to view and manage your profile, orders, and delivery addresses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => onNavigate("login", { redirect: "/profile" })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl min-h-[44px] px-6"
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("signup", { redirect: "/profile" })}
              className="rounded-xl min-h-[44px] px-6"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // File selection validation (JPG, PNG, WebP up to 5 MB)
  const handleFileValidateAndOpen = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file type", {
        description: "Please select a JPG, PNG, or WebP image.",
      })
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      toast.error("Image file too large", {
        description: `Your image is ${sizeMb} MB. Please upload an image 5 MB or smaller.`,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setRawImageSrc(reader.result as string)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidateAndOpen(e.target.files[0])
    }
    // Reset file input so user can choose same file again if desired
    e.target.value = ""
  }

  // Desktop Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidateAndOpen(e.dataTransfer.files[0])
    }
  }

  // Save cropped photo to server
  const handleSaveCroppedPhoto = async (croppedBlob: Blob) => {
    setIsUploadingPhoto(true)
    try {
      const res = await uploadAvatar(croppedBlob)
      if (res.success) {
        toast.success("Profile photo updated", {
          description: "Your new avatar is live across Yetaxahai.",
        })
        setCropModalOpen(false)
        setRawImageSrc(null)
      } else {
        toast.error("Upload failed", {
          description: res.error || "Unable to save profile photo. Please try again.",
          action: {
            label: "Retry",
            onClick: () => handleSaveCroppedPhoto(croppedBlob),
          },
        })
      }
    } catch (err: any) {
      toast.error("Upload error", {
        description: err.message || "Failed to upload photo.",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // Remove photo confirmation & execution
  const handleRemovePhoto = async () => {
    setIsRemovingPhoto(true)
    try {
      const success = await removeAvatar()
      if (success) {
        toast.success("Profile photo removed", {
          description: "Your avatar has been reset to your initials.",
        })
        setConfirmRemoveOpen(false)
      } else {
        toast.error("Failed to remove photo", {
          description: "Please check your network and try again.",
        })
      }
    } catch (err: any) {
      toast.error("Removal error", {
        description: err.message || "Could not delete profile photo.",
      })
    } finally {
      setIsRemovingPhoto(false)
    }
  }

  // Save profile information
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      const success = await updateProfile({
        name: editData.name,
        phone: editData.phone,
        address: addressData,
      })
      if (success) {
        toast.success("Profile updated", {
          description: "Your personal and delivery details have been saved.",
        })
        setIsEditing(false)
      } else {
        toast.error("Update failed", {
          description: "Could not save your changes. Please try again.",
        })
      }
    } catch {
      toast.error("Network error while saving profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package, count: orders.length },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 sticky top-24 shadow-xs"
            >
              {/* User Avatar & Photo Controls */}
              <div
                className={`text-center mb-6 p-4 rounded-xl transition-all ${
                  isDragging ? "border-2 border-dashed border-primary bg-primary/5" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="relative inline-block mb-3">
                  <UserAvatar user={user} size="xl" className="shadow-sm" />

                  {/* Photo picker trigger button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-md hover:bg-primary/90 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Change profile photo"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h2 className="text-xl font-semibold text-foreground tracking-tight">{user.name}</h2>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>

                {user.role === "admin" && (
                  <span className="inline-block mt-2 px-3 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    Administrator
                  </span>
                )}

                {/* Avatar Action Buttons */}
                <div className="mt-4 flex flex-col gap-2">
                  {/* Hidden file input supporting camera/gallery on mobile and desktop file selection */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full text-xs font-medium rounded-xl min-h-[40px] border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Change Photo
                  </Button>

                  {user.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRemoveOpen(true)}
                      disabled={isRemovingPhoto || isUploadingPhoto}
                      className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl min-h-[40px]"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Remove Photo
                    </Button>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    JPG, PNG, or WebP up to 5 MB
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => onNavigate("wishlist")}
                  className="p-3 bg-muted/40 rounded-xl text-center hover:bg-muted/70 transition-colors min-h-[44px]"
                  aria-label={`View wishlist, ${wishlist.length} saved books`}
                >
                  <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
                  <span className="text-lg font-bold text-foreground">{wishlist.length}</span>
                  <p className="text-xs text-muted-foreground">Wishlist</p>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="p-3 bg-muted/40 rounded-xl text-center hover:bg-muted/70 transition-colors min-h-[44px]"
                  aria-label={`View orders, ${orders.length} orders`}
                >
                  <Package className="w-4 h-4 text-primary mx-auto mb-1" />
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
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors min-h-[44px] ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted text-foreground font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          activeTab === tab.id ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
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
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted text-foreground transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Admin Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}

                <button
                  onClick={async () => {
                    await logout()
                    onNavigate("home")
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">Personal Information</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage your profile and delivery address in Nepal
                    </p>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="rounded-xl min-h-[44px] px-4 font-medium border-primary/20 hover:bg-primary/5 hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditData({ name: user.name || "", phone: user.phone || "" })
                          setAddressData(parseAddress(user.address))
                        }}
                        disabled={isSavingProfile}
                        className="rounded-xl min-h-[44px] px-4"
                      >
                        <X className="w-4 h-4 mr-1.5" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl min-h-[44px] px-5 font-semibold"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1.5" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Form / Profile Display */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name" className="text-xs font-semibold flex items-center gap-2 text-foreground">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="profile-name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="h-11 rounded-xl text-base"
                          placeholder="Your full name"
                          required
                        />
                      ) : (
                        <p className="text-foreground font-medium p-3 bg-muted/30 border border-border/50 rounded-xl text-sm">
                          {user.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold flex items-center gap-2 text-foreground">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email Address
                        <span className="ml-auto text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          Read-only
                        </span>
                      </Label>
                      <p className="text-foreground font-medium p-3 bg-muted/30 border border-border/50 rounded-xl text-sm truncate">
                        {user.email}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Used for order receipts and notifications.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-phone" className="text-xs font-semibold flex items-center gap-2 text-foreground">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone Number (Nepal)
                      </Label>
                      {isEditing ? (
                        <Input
                          id="profile-phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          placeholder="98XXXXXXXX"
                          className="h-11 rounded-xl text-base"
                        />
                      ) : (
                        <p className="text-foreground font-medium p-3 bg-muted/30 border border-border/50 rounded-xl text-sm">
                          {user.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Nepal Delivery Address */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        Delivery Address (Nepal)
                      </h3>
                    </div>

                    {isEditing ? (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/70">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="addr-tole" className="text-xs font-medium">Tole / Street Address</Label>
                          <Input
                            id="addr-tole"
                            value={addressData.tole}
                            onChange={(e) => setAddressData({ ...addressData, tole: e.target.value })}
                            placeholder="e.g. Thamel Marg 45 / New Road"
                            className="h-11 rounded-xl text-base"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="addr-ward" className="text-xs font-medium">Ward No.</Label>
                          <Input
                            id="addr-ward"
                            value={addressData.ward}
                            onChange={(e) => setAddressData({ ...addressData, ward: e.target.value })}
                            placeholder="e.g. 16"
                            className="h-11 rounded-xl text-base"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="addr-muni" className="text-xs font-medium">Municipality / City</Label>
                          <Input
                            id="addr-muni"
                            value={addressData.municipality}
                            onChange={(e) => setAddressData({ ...addressData, municipality: e.target.value })}
                            placeholder="e.g. Kathmandu Metropolitan"
                            className="h-11 rounded-xl text-base"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="addr-dist" className="text-xs font-medium">District</Label>
                          <select
                            id="addr-dist"
                            value={addressData.district}
                            onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
                            className="w-full h-11 px-3 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {nepalDistricts.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="addr-prov" className="text-xs font-medium">Province</Label>
                          <select
                            id="addr-prov"
                            value={addressData.province}
                            onChange={(e) => setAddressData({ ...addressData, province: e.target.value })}
                            className="w-full h-11 px-3 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {nepalProvinces.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/30 border border-border/50 rounded-xl">
                        <p className="text-foreground font-medium text-sm">
                          {formatNepalAddress(addressData)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Account Metadata */}
                  <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>
                      Member since:{" "}
                      <span className="text-foreground font-semibold">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recent"}
                      </span>
                    </p>
                    <p>
                      Books ordered:{" "}
                      <span className="text-foreground font-semibold">{user.booksOrdered || 0}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Order History</h2>

                {orders.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-xs">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Start browsing our curated Nepali and international titles to place your first order.
                    </p>
                    <Button
                      onClick={() => onNavigate("catalog")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl min-h-[44px] px-6"
                    >
                      Browse Books
                    </Button>
                  </div>
                ) : (
                  orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      pending:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
                      confirmed:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                      processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                      shipped:    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
                      delivered:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                      cancelled:  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    }
                    const badgeClass = statusColors[order.status] || statusColors.pending

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden"
                      >
                        {/* Order header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 p-5 border-b border-border/70 bg-muted/20">
                          <div>
                            <p className="text-[11px] text-muted-foreground font-mono mb-0.5">ORDER ID</p>
                            <p className="font-mono font-semibold text-foreground text-sm">{order.id}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground mb-0.5">DATE</p>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground mb-0.5">PAYMENT</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground uppercase">{order.paymentMethod}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground mb-0.5">STATUS</p>
                            <span className={`inline-block mt-0.5 px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${badgeClass}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="p-5 space-y-3">
                          {order.items.map((item, idx) => {
                            const book = mockBooks.find(b => b.id === item.bookId || b.slug === item.bookId)
                            return (
                              <div key={idx} className="flex items-center gap-3">
                                {book?.coverImage && (
                                  <div className="w-10 h-14 shrink-0 bg-muted/40 rounded-lg overflow-hidden flex items-center justify-center p-0.5">
                                    <img
                                      src={book.coverImage}
                                      alt={book.title}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-serif font-semibold text-foreground text-sm line-clamp-1">
                                    {book?.title || item.bookId}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {book?.author || ''} {item.format ? `· ${item.format}` : ''}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                                  <p className="text-sm font-semibold text-foreground font-mono">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Order totals */}
                        <div className="px-5 pb-5 pt-3 border-t border-border/60 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {order.discount > 0 && (
                              <p>Discount: <span className="text-green-600 font-semibold">−{formatPrice(order.discount)}</span></p>
                            )}
                            <p>Shipping: {order.shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : formatPrice(order.shipping)}</p>
                            {order.estimatedDelivery && (
                              <p className="flex items-center gap-1 mt-1">
                                <Truck className="w-3 h-3" />
                                {order.status === 'delivered' ? 'Delivered' : `Est. delivery: ${new Date(order.estimatedDelivery).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-lg font-bold text-primary font-mono">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Account Settings</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Manage session preferences and security settings.
                  </p>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Session</p>
                      <p className="text-xs text-muted-foreground">
                        Your session is secured with an encrypted httpOnly cookie.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await logout()
                        onNavigate("home")
                      }}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl min-h-[44px]"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Crop Modal using react-easy-crop */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => {
          setCropModalOpen(false)
          setRawImageSrc(null)
        }}
        onSave={handleSaveCroppedPhoto}
        isSaving={isUploadingPhoto}
      />

      {/* Confirmation Dialog for Remove Photo */}
      <AnimatePresence>
        {confirmRemoveOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-photo-title"
          >
            <div className="bg-card w-full max-w-sm rounded-2xl border border-border p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                <h3 id="remove-photo-title" className="font-serif text-lg font-bold text-foreground">
                  Remove Profile Photo?
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your profile picture will be deleted from storage and replaced with your initials.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmRemoveOpen(false)}
                  disabled={isRemovingPhoto}
                  className="rounded-xl min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isRemovingPhoto}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl min-h-[44px] font-semibold"
                >
                  {isRemovingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove Photo"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
