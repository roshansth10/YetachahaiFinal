"use client"

import { useState } from "react"
import { Save, Store, CreditCard, Truck, Bell, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsSaving(false)
  }

  const tabs = [
    { id: "store", label: "Store Info", icon: Store },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your store configuration</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <nav className="bg-card rounded-2xl border border-border p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "store" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Store Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" defaultValue="Yetaxahai Bookstore" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Contact Email</Label>
                  <Input id="storeEmail" type="email" defaultValue="hello@yetaxahai.com.np" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input id="storePhone" defaultValue="+977-01-4123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Address</Label>
                  <Input id="storeAddress" defaultValue="Thamel, Kathmandu, Nepal" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <textarea
                  id="storeDescription"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg min-h-[100px]"
                  defaultValue="Yetaxahai is Nepal's premier online bookstore, offering a curated selection of books across all genres. From bestsellers to rare finds, we bring the world of literature to your doorstep."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    defaultValue="NPR"
                  >
                    <option value="NPR">NPR - Nepalese Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    defaultValue="Asia/Kathmandu"
                  >
                    <option value="Asia/Kathmandu">Asia/Kathmandu (UTC+5:45)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>

                {/* eSewa */}
                <div className="p-4 border border-border rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#60B158] rounded-xl flex items-center justify-center text-white font-bold">
                        e
                      </div>
                      <div>
                        <p className="font-medium text-foreground">eSewa</p>
                        <p className="text-sm text-muted-foreground">Digital wallet payments</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Merchant Code</Label>
                      <Input type="password" defaultValue="EPAYTEST" />
                    </div>
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <Input type="password" defaultValue="••••••••" />
                    </div>
                  </div>
                </div>

                {/* Khalti */}
                <div className="p-4 border border-border rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#5C2D91] rounded-xl flex items-center justify-center text-white font-bold">
                        K
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Khalti</p>
                        <p className="text-sm text-muted-foreground">Digital wallet & bank payments</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Public Key</Label>
                      <Input type="password" defaultValue="test_public_key" />
                    </div>
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <Input type="password" defaultValue="••••••••" />
                    </div>
                  </div>
                </div>

                {/* COD */}
                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center text-white">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Shipping Settings</h3>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-foreground">Kathmandu Valley</p>
                      <p className="text-sm text-muted-foreground">Kathmandu, Lalitpur, Bhaktapur</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">Rs. 100</p>
                        <p className="text-sm text-muted-foreground">2-3 days</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shipping Cost (NPR)</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Input defaultValue="2-3 business days" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-foreground">Outside Valley</p>
                      <p className="text-sm text-muted-foreground">Rest of Nepal</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">Rs. 200</p>
                        <p className="text-sm text-muted-foreground">5-7 days</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shipping Cost (NPR)</Label>
                      <Input type="number" defaultValue="200" />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Input defaultValue="5-7 business days" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <p className="font-medium text-foreground">Free Shipping Threshold</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Orders above this amount get free shipping
                  </p>
                  <div className="flex items-center gap-4">
                    <Input type="number" defaultValue="2000" className="max-w-[200px]" />
                    <span className="text-muted-foreground">NPR</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Notification Settings</h3>

              <div className="space-y-4">
                {[
                  { label: "New order notifications", desc: "Get notified when a new order is placed" },
                  { label: "Low stock alerts", desc: "Alert when book stock falls below threshold" },
                  { label: "Customer reviews", desc: "Notify when customers leave reviews" },
                  { label: "Payment confirmations", desc: "Confirm when payments are received" },
                  { label: "Daily sales summary", desc: "Receive daily sales report via email" },
                  { label: "Weekly analytics", desc: "Get weekly performance insights" },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors"
                  >
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
          )}

          {activeTab === "security" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button>Update Password</Button>
              </div>

              <div className="pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">Current Session</p>
                      <p className="text-sm text-muted-foreground">Chrome on Windows - Kathmandu, Nepal</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
