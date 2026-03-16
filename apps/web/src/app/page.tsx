"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardData, useDeliveriesData } from "@/hooks/useDashboard"
import { AlertCircle, CheckCircle2, Clock, Layers, ShoppingBag } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns"
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { Store } from "@shruthi-boutique/types"
import { useAuth } from "@/hooks/useAuth"
import { useStores } from "@/hooks/useStores"

export default function DashboardPage() {
  const { data: user } = useAuth()
  const { data: stores } = useStores()
  const [selectedStore, setSelectedStore] = useState<string>("all")
  
  // Date states
  const [dateRange, setDateRange] = useState<string>("this-month")
  const [customFrom, setCustomFrom] = useState<string>("")
  const [customTo, setCustomTo] = useState<string>("")

  const parsedDates = useMemo(() => {
    const today = new Date()
    switch (dateRange) {
      case "today":
        return { from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") }
      case "yesterday":
        const yesterday = subDays(today, 1)
        return { from: format(yesterday, "yyyy-MM-dd"), to: format(yesterday, "yyyy-MM-dd") }
      case "last-7-days":
        return { from: format(subDays(today, 7), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") }
      case "this-month":
        return { from: format(startOfMonth(today), "yyyy-MM-dd"), to: format(endOfMonth(today), "yyyy-MM-dd") }
      case "last-month":
        const lastMonth = subMonths(today, 1)
        return { from: format(startOfMonth(lastMonth), "yyyy-MM-dd"), to: format(endOfMonth(lastMonth), "yyyy-MM-dd") }
      case "this-year":
        return { from: format(startOfYear(today), "yyyy-MM-dd"), to: format(endOfYear(today), "yyyy-MM-dd") }
      case "last-year":
        const lastYear = subDays(startOfYear(today), 1)
        return { from: format(startOfYear(lastYear), "yyyy-MM-dd"), to: format(endOfYear(lastYear), "yyyy-MM-dd") }
      case "custom":
        return { from: customFrom, to: customTo }
      default:
        return { from: "", to: "" }
    }
  }, [dateRange, customFrom, customTo])

  const { data: stats, isLoading, error } = useDashboardData({ 
    storeId: selectedStore,
    fromDate: parsedDates.from,
    toDate: parsedDates.to
  })

  const { data: deliveries, isLoading: isDeliveriesLoading } = useDeliveriesData({ 
    storeId: selectedStore 
  })

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        Failed to load dashboard data.
      </div>
    )
  }

  const statCards = [
    { 
      name: "Total Income", 
      value: stats ? `₹${stats.totalIncome.toLocaleString()}` : "0", 
      icon: ShoppingBag, 
      description: "Income from selected period",
      color: "text-primary"
    },
    { 
      name: "Total Orders", 
      value: stats?.totalOrders || "0", 
      icon: Layers, 
      description: "Created in selected period",
      color: "text-blue-600"
    },
    { 
      name: "Pending Deliveries", 
      value: stats?.pendingDeliveries || "0", 
      icon: Clock, 
      description: "Overall pending collection",
      color: "text-rose-500"
    },
    { 
      name: "Total Deliveries", 
      value: stats?.totalDeliveries || "0", 
      icon: CheckCircle2, 
      description: "Delivered in selected period",
      color: "text-emerald-500"
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor performance and manage upcoming deliveries.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {user?.superAdmin && (
            <div className="w-48">
               <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Stores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores?.map((s: Store) => (
                      <SelectItem key={s._id} value={s._id || ""}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
            </div>
          )}

          <div className="w-48">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-9">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === "custom" && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
              <Input 
                type="date" 
                className="h-9 w-36 px-2" 
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input 
                type="date" 
                className="h-9 w-36 px-2" 
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Card key={stat.name} className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{stat.name}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color} opacity-70`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <stat.icon size={80} />
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Overdue Statistics
              </CardTitle>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Attention Required</Badge>
            </div>
            <CardDescription className="opacity-70">Orders currently late for delivery.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 gap-4 h-[120px]">
                <div className="flex flex-col items-center justify-center bg-primary/10 rounded-xl border border-primary/20">
                   <div className="text-3xl font-bold text-primary">{stats?.overDue || 0}</div>
                   <div className="text-xs font-semibold opacity-70 uppercase tracking-wider">Late Orders</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-secondary/50 rounded-xl border border-border">
                   <div className="text-3xl font-bold text-primary">₹{stats?.pendingAmount.toLocaleString() || "0"}</div>
                   <div className="text-xs font-semibold opacity-70 uppercase tracking-wider">Uncollected Bal</div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-primary/10 bg-secondary/30 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-emerald-100">
              <span className="text-sm text-emerald-800/70">Delivered count</span>
              <span className="font-bold text-emerald-700">{stats?.totalDeliveries || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-rose-100">
              <span className="text-sm text-rose-800/70">Overdue Deliveries</span>
              <span className="font-bold text-rose-700">{stats?.overDue || 0}</span>
            </div>
             <div className="flex items-center justify-between py-2">
              <span className="text-sm text-primary/70">Income (Period)</span>
              <span className="font-bold text-primary">₹{stats?.totalIncome.toLocaleString() || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Lists */}
      <div className="space-y-6">
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-primary">Upcoming Deliveries (Next 3 Days)</CardTitle>
                <CardDescription className="opacity-70 font-medium">Be prepared for these collections.</CardDescription>
              </div>
              <Badge className="bg-primary hover:bg-primary/90">{deliveries?.upcomingDeliveries?.length || 0} Orders</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[100px] font-bold">Invoice</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Delivery Date</TableHead>
                    <TableHead className="text-right font-bold">Balance</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDeliveriesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : deliveries?.upcomingDeliveries?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                        No deliveries scheduled for the next 3 days.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries?.upcomingDeliveries.map((order: { _id: string; invoice: number; customer: { name: string; phone: string }; deliveryDate: string; price: number; advance: number }) => (
                      <TableRow key={order._id} className="group hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium">#{order.invoice}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{order.customer?.name || "No Customer"}</span>
                            <span className="text-xs text-muted-foreground">{order.customer?.phone || "No Phone"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{order.deliveryDate ? format(new Date(order.deliveryDate), "MMM dd, yyyy") : "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₹{(order.price - (order.advance || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell>
                           <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="bg-primary/10 border-b border-primary/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-primary font-bold">Overdue Deliveries</CardTitle>
                <CardDescription className="opacity-70 font-semibold">Immediate follow-up required.</CardDescription>
              </div>
              <Badge variant="destructive" className="animate-pulse">{deliveries?.overdueDeliveries?.length || 0} Late Orders</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[100px] font-bold">Invoice</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold flex items-center gap-1.5">
                      Delivery Date <AlertCircle className="h-3.5 w-3.5 text-primary" />
                    </TableHead>
                    <TableHead className="text-right font-bold">Pending Amount</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDeliveriesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : deliveries?.overdueDeliveries?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                        No overdue deliveries. All caught up!
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries?.overdueDeliveries.map((order: { _id: string; invoice: number; customer: { name: string; phone: string }; deliveryDate: string; price: number; advance: number }) => (
                      <TableRow key={order._id} className="group hover:bg-rose-50/30 transition-colors">
                        <TableCell className="font-medium">#{order.invoice}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">{order.customer?.name || "No Customer"}</span>
                            <span className="text-xs opacity-60">{order.customer?.phone || "No Phone"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                            <span className="text-sm font-semibold text-rose-600 line-through opacity-60">
                              {order.deliveryDate ? format(new Date(order.deliveryDate), "MMM dd, yyyy") : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-rose-600">
                          ₹{(order.price - (order.advance || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell>
                           <AlertCircle className="h-4 w-4 text-rose-400 animate-bounce" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
