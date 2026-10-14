"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  ArrowUpRight,
  MoreHorizontal,
  LogOut,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore, type AdminStats } from "@/lib/store"
import { formatPrice, mockBooks } from "@/lib/data"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Sub-components
import { AdminBooks } from "./admin-books"
import { AdminOrders } from "./admin-orders"
import { AdminUsers } from "./admin-users"
import { AdminAnalytics } from "./admin-analytics"
import { AdminSettings } from "./admin-settings"

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

const revenueData = [
  { name: "Jan", revenue: 45000, orders: 120 },
  { name: "Feb", revenue: 52000, orders: 145 },
  { name: "Mar", revenue: 48000, orders: 132 },
  { name: "Apr", revenue: 61000, orders: 165 },
  { name: "May", revenue: 55000, orders: 150 },
  { name: "Jun", revenue: 67000, orders: 180 },
  { name: "Jul", revenue: 72000, orders: 195 },
]

const categoryData = [
  { name: "Fiction", value: 35, color: "#1a365d" },
  { name: "Non-Fiction", value: 25, color: "#c9a227" },
  { name: "Academic", value: 20, color: "#2d3748" },
  { name: "Children", value: 12, color: "#718096" },
  { name: "Others", value: 8, color: "#a0aec0" },
]

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user, logout, adminStats } = useStore()
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Button onClick={() => onNavigate("home")}>Go Home</Button>
        </div>
      </div>
    )
  }

  const stats: AdminStats = adminStats || {
    totalRevenue: 425000,
    totalOrders: 1247,
    totalUsers: 856,
    totalBooks: mockBooks.length,
    revenueChange: 12.5,
    ordersChange: 8.3,
    usersChange: 15.2,
    booksChange: 5.1,
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: stats.usersChange,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Total Books",
      value: stats.totalBooks.toLocaleString(),
      change: stats.booksChange,
      icon: BookOpen,
      color: "bg-amber-500",
    },
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "Ram Sharma", amount: 2450, status: "delivered", date: "2024-01-15" },
    { id: "ORD-002", customer: "Sita Thapa", amount: 1890, status: "shipped", date: "2024-01-15" },
    { id: "ORD-003", customer: "Hari Gurung", amount: 3200, status: "processing", date: "2024-01-14" },
    { id: "ORD-004", customer: "Maya Rai", amount: 1560, status: "pending", date: "2024-01-14" },
    { id: "ORD-005", customer: "Binod KC", amount: 4100, status: "delivered", date: "2024-01-13" },
  ]

  const topBooks = mockBooks.slice(0, 5).map((book, i) => ({
    ...book,
    sales: Math.floor(Math.random() * 100) + 50,
    rank: i + 1,
  }))

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        className="bg-card border-r border-border flex flex-col fixed h-full z-40"
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 w-full"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div className="text-left">
                <span className="text-xl font-serif font-bold text-foreground">Yetaxahai</span>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => onNavigate("home")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Back to Store</span>}
          </button>
          <button
            onClick={() => {
              logout()
              onNavigate("home")
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
      >
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground capitalize">
                {activeSection === "overview" ? "Dashboard" : activeSection}
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-64" />
              </div>

              {/* Notifications */}
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-foreground hidden sm:block">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          stat.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(stat.change)}%
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
                      <p className="text-sm text-muted-foreground">Monthly revenue for 2024</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Report <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1a365d" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1a365d" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `Rs.${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                          }}
                          formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#1a365d"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Sales by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm text-muted-foreground">{cat.name}</span>
                        <span className="text-sm font-medium ml-auto">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tables Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSection("orders")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{order.customer}</p>
                            <p className="text-sm text-muted-foreground">{order.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{formatPrice(order.amount)}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "processing"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Selling Books */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Top Selling Books</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSection("books")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {topBooks.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                      >
                        <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {book.rank}
                        </span>
                        <div
                          className="w-10 h-14 rounded bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${book.coverImage})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{book.title}</p>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{book.sales} sold</p>
                          <p className="text-sm text-primary">{formatPrice(book.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "books" && <AdminBooks />}
          {activeSection === "orders" && <AdminOrders />}
          {activeSection === "users" && <AdminUsers />}
          {activeSection === "analytics" && <AdminAnalytics />}
          {activeSection === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  )
}
