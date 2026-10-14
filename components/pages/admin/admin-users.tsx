"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  X,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/data"

interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: "customer" | "admin"
  status: "active" | "inactive" | "banned"
  totalOrders: number
  totalSpent: number
  createdAt: string
  lastLogin: string
}

const mockUsers: User[] = [
  {
    id: "usr-001",
    name: "Ram Sharma",
    email: "ram@example.com",
    phone: "9841234567",
    address: "Kathmandu, Thamel",
    role: "customer",
    status: "active",
    totalOrders: 12,
    totalSpent: 24500,
    createdAt: "2023-06-15T10:30:00Z",
    lastLogin: "2024-01-15T08:00:00Z",
  },
  {
    id: "usr-002",
    name: "Sita Thapa",
    email: "sita@example.com",
    phone: "9851234567",
    address: "Pokhara, Lakeside",
    role: "customer",
    status: "active",
    totalOrders: 8,
    totalSpent: 18200,
    createdAt: "2023-08-20T14:20:00Z",
    lastLogin: "2024-01-14T16:30:00Z",
  },
  {
    id: "usr-003",
    name: "Admin User",
    email: "admin@yetaxahai.com",
    phone: "9800000000",
    address: "Kathmandu, Durbar Marg",
    role: "admin",
    status: "active",
    totalOrders: 0,
    totalSpent: 0,
    createdAt: "2023-01-01T00:00:00Z",
    lastLogin: "2024-01-15T09:00:00Z",
  },
  {
    id: "usr-004",
    name: "Hari Gurung",
    email: "hari@example.com",
    phone: "9861234567",
    address: "Butwal, Traffic Chowk",
    role: "customer",
    status: "inactive",
    totalOrders: 3,
    totalSpent: 5600,
    createdAt: "2023-10-05T09:15:00Z",
    lastLogin: "2023-12-20T11:00:00Z",
  },
  {
    id: "usr-005",
    name: "Maya Rai",
    email: "maya@example.com",
    phone: "9871234567",
    address: "Biratnagar, Main Road",
    role: "customer",
    status: "active",
    totalOrders: 15,
    totalSpent: 32100,
    createdAt: "2023-04-10T16:45:00Z",
    lastLogin: "2024-01-15T07:45:00Z",
  },
  {
    id: "usr-006",
    name: "Binod KC",
    email: "binod@example.com",
    phone: "9801234567",
    address: "Lalitpur, Jawalakhel",
    role: "customer",
    status: "banned",
    totalOrders: 2,
    totalSpent: 1800,
    createdAt: "2023-11-25T11:30:00Z",
    lastLogin: "2023-12-01T14:00:00Z",
  },
]

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const updateUserStatus = (userId: string, newStatus: User["status"]) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "inactive":
        return "bg-gray-100 text-gray-700"
      case "banned":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    customers: users.filter((u) => u.role === "customer").length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground">{users.length} registered users</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: userStats.total, color: "bg-primary/10 text-primary" },
          { label: "Active", value: userStats.active, color: "bg-green-100 text-green-700" },
          { label: "Customers", value: userStats.customers, color: "bg-blue-100 text-blue-700" },
          { label: "Admins", value: userStats.admins, color: "bg-purple-100 text-purple-700" },
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
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Orders</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Total Spent</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-foreground">{user.phone}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[150px]">{user.address}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role === "admin" && <Shield className="w-3 h-3" />}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-foreground">{user.totalOrders}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-foreground">{formatPrice(user.totalSpent)}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">User Details</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-serif font-bold text-primary">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{selectedUser.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {selectedUser.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedUser.status
                        )}`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {selectedUser.phone}
                  </div>
                  <div className="flex items-start gap-3 text-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    {selectedUser.address}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <ShoppingBag className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{selectedUser.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(selectedUser.totalSpent)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Member since:{" "}
                    <span className="text-foreground">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    Last login:{" "}
                    <span className="text-foreground">
                      {new Date(selectedUser.lastLogin).toLocaleDateString()}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                {selectedUser.role !== "admin" && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    {selectedUser.status === "banned" ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => updateUserStatus(selectedUser.id, "active")}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Unban User
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => updateUserStatus(selectedUser.id, "banned")}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Ban User
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
