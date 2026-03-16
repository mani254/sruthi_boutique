"use client"

import { useState } from "react"
import { useCustomers } from "@/hooks/useCustomers"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Search, 
  MoreHorizontal, 
  User, 
  Calendar, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useUpdateCustomer } from "@/hooks/useCustomers"
import { useOrders } from "@/hooks/useOrders"
import { Customer } from "@shruthi-boutique/types"
import { Badge } from "@/components/ui/badge"

export default function CustomersPage() {
  const [filters, setFilters] = useState({ skip: 0, limit: 10, search: "" })
  const { data, isLoading, error } = useCustomers(filters)
  const updateCustomerMutation = useUpdateCustomer()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editData, setEditData] = useState({ name: "", number: "" })

  const handleEditOpen = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditData({ name: customer.name, number: customer.number })
    setIsEditOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    try {
      await updateCustomerMutation.mutateAsync({
        _id: selectedCustomer._id,
        ...editData
      })
      toast.success("Customer updated successfully")
      setIsEditOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update customer"
      toast.error(message)
    }
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        Failed to load customers.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your client database and history.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone number..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, skip: 0 })}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-[150px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-[100px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-[120px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="ml-auto h-8 w-8 animate-pulse rounded bg-muted"></div></TableCell>
                </TableRow>
              ))
            ) : data?.customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              data?.customers.map((customer: Customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary uppercase">
                        {customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.number}</TableCell>
                  <TableCell>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2" onClick={() => { setSelectedCustomer(customer); setIsOrdersOpen(true); }}>
                          <Calendar className="h-4 w-4" />
                          View Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => handleEditOpen(customer)}>
                          <User className="h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filters.skip + 1} to {Math.min(filters.skip + filters.limit, data?.totalCustomersCount || 0)} of {data?.totalCustomersCount || 0} customers
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFilters({ ...filters, skip: Math.max(0, filters.skip - filters.limit) })}
            disabled={filters.skip === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFilters({ ...filters, skip: filters.skip + filters.limit })}
            disabled={(filters.skip + filters.limit) >= (data?.totalCustomersCount || 0)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* View Orders Modal */}
      <Dialog open={isOrdersOpen} onOpenChange={setIsOrdersOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order History: {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedCustomer && (
              <CustomerOrdersList customerId={selectedCustomer._id!} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cust-name">Name</Label>
              <Input id="cust-name" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-phone">Phone Number</Label>
              <Input id="cust-phone" value={editData.number} onChange={e => setEditData({...editData, number: e.target.value})} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateCustomerMutation.isPending}>
                {updateCustomerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CustomerOrdersList({ customerId }: { customerId: string }) {
  const { data, isLoading } = useOrders({ customerId })
  
  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
          </TableRow>
        ) : (
          data?.orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">#{order.invoice}</TableCell>
              <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">{order.status}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium">₹{order.price}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
