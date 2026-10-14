"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/data"

interface OrderItem {
  bookId: string
  title: string
  author: string
  price: number
  quantity: number
  coverImage: string
}

interface Order {
  id: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod: string
  paymentStatus: "paid" | "pending" | "failed"
  createdAt: string
  updatedAt: string
}

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    customer: {
      name: "Ram Sharma",
      email: "ram@example.com",
      phone: "9841234567",
      address: "Kathmandu, Thamel",
    },
    items: [
      {
        bookId: "1",
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 850,
        quantity: 2,
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      },
    ],
    total: 1700,
    status: "delivered",
    paymentMethod: "esewa",
    paymentStatus: "paid",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:00:00Z",
  },
  {
    id: "ORD-2024-002",
    customer: {
      name: "Sita Thapa",
      email: "sita@example.com",
      phone: "9851234567",
      address: "Pokhara, Lakeside",
    },
    items: [
      {
        bookId: "2",
        title: "Atomic Habits",
        author: "James Clear",
        price: 1200,
        quantity: 1,
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
      },
      {
        bookId: "3",
        title: "1984",
        author: "George Orwell",
        price: 750,
        quantity: 1,
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
      },
    ],
    total: 1950,
    status: "shipped",
    paymentMethod: "khalti",
    paymentStatus: "paid",
    createdAt: "2024-01-15T14:20:00Z",
    updatedAt: "2024-01-15T16:00:00Z",
  },
  {
    id: "ORD-2024-003",
    customer: {
      name: "Hari Gurung",
      email: "hari@example.com",
      phone: "9861234567",
      address: "Butwal, Traffic Chowk",
    },
    items: [
      {
        bookId: "4",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: 650,
        quantity: 3,
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
      },
    ],
    total: 1950,
    status: "processing",
    paymentMethod: "cod",
    paymentStatus: "pending",
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-14T09:15:00Z",
  },
  {
    id: "ORD-2024-004",
    customer: {
      name: "Maya Rai",
      email: "maya@example.com",
      phone: "9871234567",
      address: "Biratnagar, Main Road",
    },
    items: [
      {
        bookId: "5",
        title: "Sapiens",
        author: "Yuval Noah Harari",
        price: 1500,
        quantity: 1,
        coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
      },
    ],
    total: 1500,
    status: "pending",
    paymentMethod: "esewa",
    paymentStatus: "paid",
    createdAt: "2024-01-14T16:45:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
  },
  {
    id: "ORD-2024-005",
    customer: {
      name: "Binod KC",
      email: "binod@example.com",
      phone: "9801234567",
      address: "Lalitpur, Jawalakhel",
    },
    items: [
      {
        bookId: "6",
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        price: 890,
        quantity: 2,
        coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
      },
      {
        bookId: "7",
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        price: 950,
        quantity: 1,
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      },
    ],
    total: 2730,
    status: "delivered",
    paymentMethod: "khalti",
    paymentStatus: "paid",
    createdAt: "2024-01-13T11:30:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
]

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700"
      case "shipped":
        return "bg-blue-100 text-blue-700"
      case "processing":
        return "bg-amber-100 text-amber-700"
      case "pending":
        return "bg-gray-100 text-gray-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
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

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      )
    )
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Orders</h2>
          <p className="text-muted-foreground">{orders.length} total orders</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: orderStats.total, color: "bg-primary/10 text-primary" },
          { label: "Pending", value: orderStats.pending, color: "bg-gray-100 text-gray-700" },
          { label: "Processing", value: orderStats.processing, color: "bg-amber-100 text-amber-700" },
          { label: "Shipped", value: orderStats.shipped, color: "bg-blue-100 text-blue-700" },
          { label: "Delivered", value: orderStats.delivered, color: "bg-green-100 text-green-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color} rounded-lg inline-block px-3 py-1`}>
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Items</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-medium text-foreground">{order.id}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-foreground">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-foreground">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="capitalize text-foreground">{order.paymentMethod}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No orders found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{selectedOrder.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Update */}
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Update Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order["status"])}
                    className="px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Customer Info */}
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-3">Customer Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedOrder.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedOrder.customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 md:col-span-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{selectedOrder.customer.address}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground capitalize">{selectedOrder.paymentMethod}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Status: {selectedOrder.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.bookId}
                        className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl"
                      >
                        <div
                          className="w-12 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${item.coverImage})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{formatPrice(item.price)}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-lg font-medium text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
