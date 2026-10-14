"use client"

import { useState } from "react"
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"

const monthlyData = [
  { name: "Jan", revenue: 145000, orders: 320, visitors: 4500 },
  { name: "Feb", revenue: 152000, orders: 345, visitors: 5200 },
  { name: "Mar", revenue: 148000, orders: 332, visitors: 4800 },
  { name: "Apr", revenue: 161000, orders: 365, visitors: 5500 },
  { name: "May", revenue: 155000, orders: 350, visitors: 5100 },
  { name: "Jun", revenue: 167000, orders: 380, visitors: 5800 },
  { name: "Jul", revenue: 172000, orders: 395, visitors: 6200 },
  { name: "Aug", revenue: 180000, orders: 420, visitors: 6500 },
  { name: "Sep", revenue: 175000, orders: 405, visitors: 6100 },
  { name: "Oct", revenue: 190000, orders: 445, visitors: 6800 },
  { name: "Nov", revenue: 210000, orders: 485, visitors: 7500 },
  { name: "Dec", revenue: 235000, orders: 540, visitors: 8200 },
]

const categoryRevenue = [
  { name: "Fiction", value: 185000, color: "#1a365d" },
  { name: "Non-Fiction", value: 145000, color: "#c9a227" },
  { name: "Academic", value: 120000, color: "#2d3748" },
  { name: "Children", value: 85000, color: "#718096" },
  { name: "Biography", value: 65000, color: "#a0aec0" },
]

const dailyOrders = [
  { day: "Mon", orders: 45 },
  { day: "Tue", orders: 52 },
  { day: "Wed", orders: 48 },
  { day: "Thu", orders: 61 },
  { day: "Fri", orders: 55 },
  { day: "Sat", orders: 78 },
  { day: "Sun", orders: 42 },
]

const topLocations = [
  { city: "Kathmandu", orders: 1250, revenue: 2450000 },
  { city: "Pokhara", orders: 420, revenue: 820000 },
  { city: "Lalitpur", orders: 380, revenue: 745000 },
  { city: "Biratnagar", orders: 290, revenue: 568000 },
  { city: "Butwal", orders: 210, revenue: 412000 },
]

const paymentMethods = [
  { name: "eSewa", value: 45, color: "#60B158" },
  { name: "Khalti", value: 35, color: "#5C2D91" },
  { name: "COD", value: 20, color: "#718096" },
]

export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("year")

  const totalRevenue = monthlyData.reduce((acc, month) => acc + month.revenue, 0)
  const totalOrders = monthlyData.reduce((acc, month) => acc + month.orders, 0)
  const avgOrderValue = totalRevenue / totalOrders

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">Business performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
            {["week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
            change: "+18.5%",
            positive: true,
            subtext: "vs last year",
          },
          {
            label: "Total Orders",
            value: totalOrders.toLocaleString(),
            change: "+12.3%",
            positive: true,
            subtext: "vs last year",
          },
          {
            label: "Avg Order Value",
            value: formatPrice(Math.round(avgOrderValue)),
            change: "+5.7%",
            positive: true,
            subtext: "vs last year",
          },
          {
            label: "Conversion Rate",
            value: "3.8%",
            change: "-0.2%",
            positive: false,
            subtext: "vs last year",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Revenue & Orders Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly performance for 2024</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a365d" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a365d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a227" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c9a227" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v) => `Rs.${v / 1000}k`}
              />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#1a365d"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue2)"
                name="Revenue (Rs.)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#c9a227"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOrders)"
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Revenue */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Revenue by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `Rs.${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [formatPrice(value), "Revenue"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Orders */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Orders by Day of Week</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="orders" fill="#1a365d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Payment Methods</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {paymentMethods.map((method) => (
              <div key={method.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                <span className="text-sm text-muted-foreground">
                  {method.name} ({method.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Top Locations</h3>
          <div className="space-y-4">
            {topLocations.map((location, index) => (
              <div key={location.city} className="flex items-center gap-4">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{location.city}</span>
                    <span className="text-sm text-muted-foreground">{location.orders} orders</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(location.orders / topLocations[0].orders) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-medium text-foreground min-w-[100px] text-right">
                  {formatPrice(location.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
