"use client"

import { useState } from "react"
import { Trash2, Plus, Loader2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useCategories } from "@/hooks/useCategories"
import { Category, OrderItem } from "@shruthi-boutique/types"
import { toast } from "sonner"

export interface BillingTabState {
  customer: { name: string; phone: string };
  items: OrderItem[];
  billInfo: { discount: number; advance: number; deliveryDate: string; note: string };
  invoiceNumber: number;
  orderId?: string; // If it's an existing order we're editing
}

interface BillingFormProps {
  state: BillingTabState;
  onUpdate: (newState: Partial<BillingTabState>) => void;
  onSave: (state: BillingTabState) => void;
  isSaving: boolean;
}

export function BillingForm({ state, onUpdate, onSave, isSaving }: BillingFormProps) {
  const { data: categories } = useCategories()
  const [currentItem, setCurrentItem] = useState({ category: "", quantity: 1, price: 0 })

  const handleAddItem = () => {
    if (!currentItem.category || currentItem.price <= 0) {
      toast.error("Please select a category and enter a price")
      return
    }
    const newItem: OrderItem = { 
      id: Math.random().toString(), 
      category: currentItem.category,
      name: currentItem.category,
      quantity: currentItem.quantity,
      price: currentItem.price,
      sTotal: currentItem.quantity * currentItem.price 
    }
    onUpdate({ items: [...state.items, newItem] })
    setCurrentItem({ category: "", quantity: 1, price: 0 })
  }

  const removeItem = (index: number) => {
    onUpdate({ items: state.items.filter((_, i) => i !== index) })
  }

  const subTotal = state.items.reduce((acc, item) => acc + (item.sTotal || 0), 0)
  const grandTotal = subTotal - state.billInfo.discount

  return (
    <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="md:col-span-2 shadow-sm border-muted/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Items List</CardTitle>
          <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
            INV-{state.invoiceNumber}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 items-end bg-accent/30 p-4 rounded-lg border border-accent/20">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Category</Label>
                <Select 
                  value={currentItem.category} 
                  onValueChange={(v) => setCurrentItem({...currentItem, category: v})}
                >
                  <SelectTrigger className="h-9 border-muted-foreground/20 focus:ring-1 focus:ring-primary/30">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c: Category) => (
                      <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Qty</Label>
                <Input 
                  type="number" 
                  className="h-9 border-muted-foreground/20"
                  value={currentItem.quantity} 
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Price</Label>
                <Input 
                  type="number" 
                  className="h-9 border-muted-foreground/20"
                  value={currentItem.price} 
                  onChange={(e) => setCurrentItem({...currentItem, price: parseInt(e.target.value) || 0})} 
                />
              </div>
              <Button onClick={handleAddItem} variant="default" size="sm" className="h-9 gap-1 shadow-sm">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-[10px] uppercase font-bold">Category</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-center">Qty</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-right">Price</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.items.map((item, i) => (
                    <TableRow key={item.id || i} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="py-2.5 font-medium">{item.category}</TableCell>
                      <TableCell className="py-2.5 text-center">{item.quantity}</TableCell>
                      <TableCell className="py-2.5 text-right font-mono">₹{item.price}</TableCell>
                      <TableCell className="py-2.5 text-right font-bold text-primary">₹{item.sTotal}</TableCell>
                      <TableCell className="py-2.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-20 group-hover:opacity-100 transition-opacity" 
                          onClick={() => removeItem(i)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {state.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                        No items added to this bill yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="shadow-sm border-muted/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">Phone Number</Label>
              <div className="flex gap-2">
                <Input 
                  id="phone" 
                  placeholder="86880..." 
                  className="h-9 border-muted-foreground/20 font-mono"
                  value={state.customer.phone} 
                  onChange={(e) => onUpdate({ customer: {...state.customer, phone: e.target.value} })}
                />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">Customer Name</Label>
              <Input 
                id="name" 
                placeholder="Full Name" 
                className="h-9 border-muted-foreground/20"
                value={state.customer.name} 
                onChange={(e) => onUpdate({ customer: {...state.customer, name: e.target.value} })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted/60 bg-accent/5">
          <CardHeader className="pb-3 border-b border-muted/30">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate" className="text-xs">Delivery Date</Label>
              <Input 
                id="deliveryDate" 
                type="date" 
                className="h-9 border-muted-foreground/20"
                value={state.billInfo.deliveryDate} 
                onChange={(e) => onUpdate({ billInfo: {...state.billInfo, deliveryDate: e.target.value} })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Discount</Label>
                <Input 
                  type="number" 
                  className="h-9 border-muted-foreground/20 font-mono"
                  value={state.billInfo.discount} 
                  onChange={(e) => onUpdate({ billInfo: {...state.billInfo, discount: parseInt(e.target.value) || 0} })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Advance</Label>
                <Input 
                  type="number" 
                  className="h-9 border-muted-foreground/20 font-mono"
                  value={state.billInfo.advance} 
                  onChange={(e) => onUpdate({ billInfo: {...state.billInfo, advance: parseInt(e.target.value) || 0} })}
                />
              </div>
            </div>
            
            <div className="space-y-2 bg-background p-3 rounded-lg border border-muted/50 shadow-inner">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subTotal}</span>
              </div>
              <div className="flex justify-between text-base font-black text-foreground">
                <span>Total</span>
                <span className="text-rose-600">₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-[11px] text-amber-600 font-bold border-t border-muted/30 pt-1 mt-1">
                <span>Pending</span>
                <span>₹{grandTotal - state.billInfo.advance}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Input 
                placeholder="Special instructions..." 
                className="h-9 border-muted-foreground/20"
                value={state.billInfo.note} 
                onChange={(e) => onUpdate({ billInfo: {...state.billInfo, note: e.target.value} })}
              />
            </div>
            
            <Button 
              className="w-full mt-2 shadow-md hover:shadow-lg transition-all font-bold tracking-tight" 
              size="lg" 
              onClick={() => onSave(state)}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {state.orderId ? "Update Bill" : "Save and Generate Bill"}
            </Button>
            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
