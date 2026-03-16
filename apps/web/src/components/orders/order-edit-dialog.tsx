"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useCategories } from "@/hooks/useCategories"
import { useUpdateOrder } from "@/hooks/useOrders"
import { Category, Order, OrderItem } from "@shruthi-boutique/types"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface OrderEditDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderEditDialog({ order, open, onOpenChange }: OrderEditDialogProps) {
  const { data: categories } = useCategories()
  const updateOrderMutation = useUpdateOrder()

  const [items, setItems] = useState<OrderItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [advance, setAdvance] = useState(0)
  const [note, setNote] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")

  const [currentItem, setCurrentItem] = useState({ category: "", quantity: 1, price: 0 })
  const [initializedId, setInitializedId] = useState<string | null>(null)

  useEffect(() => {
    if (order && open && initializedId !== order._id) {
      // Use setTimout to avoid synchronous setState warning in some environments
      const timer = setTimeout(() => {
        setItems(order.items || [])
        setDiscount(0)
        setAdvance(order.advance || 0)
        setNote(order.note || "")
        if (order.deliveryDate) {
          const d = new Date(order.deliveryDate)
          setDeliveryDate(d.toISOString().split('T')[0])
        }
        setInitializedId(order._id || null)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [order, open, initializedId])

  useEffect(() => {
    if (!open && initializedId !== null) {
      const timer = setTimeout(() => setInitializedId(null), 0)
      return () => clearTimeout(timer)
    }
  }, [open, initializedId])

  const handleAddItem = () => {
    if (!currentItem.category || currentItem.price <= 0) {
      toast.error("Select category and enter price")
      return
    }
    setItems([...items, {
      ...currentItem,
      id: Math.random().toString(),
      name: currentItem.category,
      sTotal: currentItem.quantity * currentItem.price
    }])
    setCurrentItem({ category: "", quantity: 1, price: 0 })
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const grandTotal = subTotal - discount

  const handleSave = async () => {
    if (!order) return
    if (items.length === 0) {
      toast.error("Add at least one item")
      return
    }

    try {
      await updateOrderMutation.mutateAsync({
        _id: order._id,
        items,
        price: grandTotal,
        advance,
        note,
        deliveryDate: new Date(deliveryDate)
      })
      toast.success("Order updated successfully")
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update order"
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order: #{order?.invoice}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm border-b pb-1">Items Management</h3>
            <div className="grid grid-cols-4 gap-4 items-end bg-muted/30 p-3 rounded-lg">
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select value={currentItem.category} onValueChange={v => setCurrentItem({ ...currentItem, category: v })}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c: Category) => (
                      <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Qty</Label>
                <Input type="number" className="h-8" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Price</Label>
                <Input type="number" className="h-8" value={currentItem.price} onChange={e => setCurrentItem({ ...currentItem, price: parseInt(e.target.value) })} />
              </div>
              <Button size="sm" variant="secondary" onClick={handleAddItem} className="gap-1 h-8">
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i} className="h-10">
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.price}</TableCell>
                    <TableCell className="text-right">₹{item.price * item.quantity}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(i)}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm border-b pb-1">Order Details</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-delivery" className="text-xs">Delivery Date</Label>
                  <Input id="edit-delivery" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-advance" className="text-xs">Advance Payment</Label>
                  <Input id="edit-advance" type="number" value={advance} onChange={e => setAdvance(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-note" className="text-xs">Notes</Label>
                  <Textarea id="edit-note" placeholder="Special instructions..." rows={3} value={note} onChange={e => setNote(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-3 h-fit mt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹{subTotal}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Discount:</span>
                <Input type="number" className="h-7 w-24 text-right pr-1" value={discount} onChange={e => setDiscount(parseInt(e.target.value) || 0)} />
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-bold">Grand Total:</span>
                <span className="font-bold text-lg">₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-rose-500 font-medium">
                <span>Balance Due:</span>
                <span>₹{grandTotal - advance}</span>
              </div>
              <Button className="w-full mt-4" onClick={handleSave} disabled={updateOrderMutation.isPending}>
                {updateOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Order Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
