"use client"

import { OrderEditDialog } from "@/components/orders/order-edit-dialog"
import { TimelineViewer } from "@/components/orders/timeline-viewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { useOrders, useUpdateOrder } from "@/hooks/useOrders"
import { useStores } from "@/hooks/useStores"
import { Order, OrderStatus } from "@shruthi-boutique/types"
import { format } from "date-fns"
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  History,
  Pencil,
  Phone,
  Search,
  User
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const statusOptions: OrderStatus[] = ['booked', 'under MW', 'under stitching', 'finishing work', 'pending', 'delivered']

export default function OrdersPage() {
  const { data: user } = useAuth()
  const [filters, setFilters] = useState({
    limit: 10,
    skip: 0,
    status: "all",
    search: "",
    storeId: "all"
  })

  const { data, isLoading, error } = useOrders(filters)
  const { data: stores } = useStores()
  const updateOrderMutation = useUpdateOrder()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleNextPage = () => {
    setFilters(f => ({ ...f, skip: f.skip + f.limit }))
  }

  const handlePrevPage = () => {
    setFilters(f => ({ ...f, skip: Math.max(0, f.skip - f.limit) }))
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    if (!orderId) return;
    try {
      await updateOrderMutation.mutateAsync({ _id: orderId, status: newStatus })
      toast.success("Status updated successfully")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status"
      toast.error(message)
    }
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        Failed to load orders.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Monitor and manage all customer orders.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoice or customer..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, skip: 0 })}
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v, skip: 0 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user?.superAdmin && (
              <Select
                value={filters.storeId}
                onValueChange={(v) => setFilters({ ...filters, storeId: v, skip: 0 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores?.map((s: any) => (
                    <SelectItem key={s._id} value={s._id || "unknown"}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" className="gap-2" onClick={() => setFilters({ limit: 10, skip: 0, status: "all", search: "", storeId: "all" })}>
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted"></div></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No orders found matching the criteria.
                </TableCell>
              </TableRow>
            ) : (
              data?.orders.map((order: any) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">#{order.invoice}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.customer?.name}</span>
                      <span className="text-xs text-muted-foreground">{order.customer?.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.deliveryDate ? format(new Date(order.deliveryDate), "MMM dd, yyyy") : "N/A"}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusUpdate(order._id, v as OrderStatus)}
                      disabled={updateOrderMutation.isPending && updateOrderMutation.variables?._id === order._id}
                    >
                      <SelectTrigger className="h-8 w-[150px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => (
                          <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">₹{order.advance || 0}</TableCell>
                  <TableCell className="text-right font-medium text-amber-600">
                    ₹{(order.price || 0) - (order.advance || 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-rose-500">
                    ₹{order.price}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}>
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedOrder(order); setIsTimelineOpen(true); }}>
                        <History className="h-4 w-4 text-orange-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedOrder(order); setIsEditOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filters.skip + 1} to {Math.min(filters.skip + filters.limit, data?.totalOrdersCount || 0)} of {data?.totalOrdersCount || 0} orders
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={filters.skip === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={(filters.skip + filters.limit) >= (data?.totalOrdersCount || 0) || isLoading}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Detailed View Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Order Details: #{selectedOrder?.invoice}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> Customer Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="font-bold">{(selectedOrder.customer as any)?.name}</p>
                    <p className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" /> {(selectedOrder.customer as any)?.number}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Order Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Status:</span> <Badge className="ml-2 uppercase">{selectedOrder.status}</Badge></p>
                    <p><span className="text-muted-foreground">Delivery:</span> {selectedOrder.deliveryDate ? format(new Date(selectedOrder.deliveryDate), "PPP") : "N/A"}</p>
                    <p><span className="text-muted-foreground">Total:</span> ₹{selectedOrder.price}</p>
                    <p><span className="text-muted-foreground">Advance:</span> ₹{selectedOrder.advance}</p>
                    <p><span className="text-muted-foreground text-rose-500">Balance:</span> ₹{(selectedOrder.price || 0) - (selectedOrder.advance || 0)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Items List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Cat</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="py-2">{item.name}</TableCell>
                          <TableCell className="py-2">{item.category}</TableCell>
                          <TableCell className="py-2 text-right">{item.quantity}</TableCell>
                          <TableCell className="py-2 text-right">₹{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {selectedOrder.note && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic text-muted-foreground">{selectedOrder.note}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Timeline Drawer */}
      <Drawer open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Order History: #{selectedOrder?.invoice}</DrawerTitle>
              <DrawerDescription>Detailed timeline of events and status changes.</DrawerDescription>
            </DrawerHeader>
            <div className="p-6 overflow-y-auto">
              {selectedOrder && <TimelineViewer timeline={selectedOrder.timeline || []} />}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Edit Order Dialog */}
      <OrderEditDialog
        order={selectedOrder}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  )
}
