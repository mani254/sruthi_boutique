"use client"

import { BillingForm, BillingTabState } from "@/components/billing/billing-form"
import { BillingReceipt } from "@/components/billing/billing-receipt"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useAddOrder, useUpdateOrder } from "@/hooks/useOrders"
import { cn } from "@/lib/utils"
import { Store } from "@shruthi-boutique/types"
import {
  Loader2,
  Lock,
  Plus,
  Printer,
  X
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface Tab extends BillingTabState {
  id: string;
}

export default function BillingPage() {
  const { data: admin, isLoading: isAuthLoading } = useAuth()
  const addOrderMutation = useAddOrder()
  const updateOrderMutation = useUpdateOrder()

  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  const addNewTab = useCallback(() => {
    const newId = Math.random().toString(36).substring(7)
    const newInvoice = Math.floor(100000 + Math.random() * 900000)
    const newTab: Tab = {
      id: newId,
      invoiceNumber: newInvoice,
      customer: { name: "", phone: "" },
      items: [],
      billInfo: { discount: 0, advance: 0, deliveryDate: "", note: "" }
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newId)
  }, [])

  const updateActiveTab = useCallback((update: Partial<BillingTabState>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...update } : t))
  }, [activeTabId])

  const resetActiveTab = useCallback(() => {
    const newInvoice = Math.floor(100000 + Math.random() * 900000)
    updateActiveTab({
      invoiceNumber: newInvoice,
      customer: { name: "", phone: "" },
      items: [],
      billInfo: { discount: 0, advance: 0, deliveryDate: "", note: "" },
      orderId: undefined
    })
  }, [updateActiveTab])

  // Initialize with one tab if empty (safeguard)
  useEffect(() => {
    if (tabs.length === 0 && !isAuthLoading && admin && !admin.superAdmin) {
      const timer = setTimeout(() => {
        addNewTab()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [tabs.length, addNewTab, isAuthLoading, admin])

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = tabs.filter(t => t.id !== id)
    if (newTabs.length === 0) {
      addNewTab()
    } else {
      setTabs(newTabs)
      if (activeTabId === id) {
        setActiveTabId(newTabs[newTabs.length - 1].id)
      }
    }
  }

  const activeTab = tabs.find(t => t.id === activeTabId)

  const handlePrint = useCallback(() => {
    if (receiptRef.current) {
      window.print()
    } else {
      toast.error("Receipt not ready for printing")
    }
  }, [])

  const performCreate = async (state: BillingTabState) => {
    if (!admin || !admin.store) return;
    const storeId = typeof admin.store === 'string' ? admin.store : (admin.store as Store)._id

    const subTotal = state.items.reduce((acc, item) => acc + (item.sTotal || 0), 0)
    const grandTotal = subTotal - state.billInfo.discount

    try {
      const res = await addOrderMutation.mutateAsync({
        ...state.customer,
        ...state.billInfo,
        items: state.items,
        price: grandTotal,
        invoice: state.invoiceNumber,
        storeId: storeId || ""
      })
      toast.success("Order created successfully")
      updateActiveTab({ orderId: res.order._id })
      
      // Auto-print after creation
      setTimeout(() => {
        handlePrint()
      }, 500)
    } catch {
      toast.error("Failed to create order")
    }
  }

  const performUpdate = async (id: string, state: BillingTabState) => {
    const subTotal = state.items.reduce((acc, item) => acc + (item.sTotal || 0), 0)
    const grandTotal = subTotal - state.billInfo.discount

    try {
      await updateOrderMutation.mutateAsync({
        _id: id,
        ...state.customer,
        ...state.billInfo,
        items: state.items,
        price: grandTotal,
        invoice: state.invoiceNumber,
      })
      toast.success("Order updated successfully")
      
      // Auto-print after update
      setTimeout(() => {
        handlePrint()
      }, 500)
    } catch {
      toast.error("Failed to update order")
    }
  }

  const handleSaveAttempt = async (state: BillingTabState) => {
    if (!admin || !admin.store) return;
    if (state.orderId) {
      await performUpdate(state.orderId, state);
    } else {
      await performCreate(state);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Verifying credentials...</p>
      </div>
    )
  }

  if (admin?.superAdmin) {
    return (
      <Card className="max-w-2xl mx-auto mt-12 border-rose-100 bg-rose-50/30">
        <CardContent className="flex flex-col items-center py-12 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-rose-100 flex items-center justify-center shadow-inner">
            <Lock className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-rose-900 tracking-tight">Billing Access Restricted</h2>
            <p className="text-rose-700/80 max-w-md text-sm leading-relaxed">
              As a Super Admin, you are not assigned to a specific store location.
              Billing functionality is reserved for store-assigned administrators only.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()} className="border-rose-200 hover:bg-rose-100 hover:text-rose-900 transition-all font-semibold">
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col w-full overflow-hidden -m-6 lg:-m-10">
      <div className="flex items-center justify-between bg-muted/40 border-b shrink-0 px-4 pt-4">
        <div className="flex items-end overflow-x-auto no-scrollbar gap-1 flex-1 overflow-hidden">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id
            const title = tab.customer.name
              ? `${tab.customer.name}-bill`
              : `${tab.invoiceNumber}-bill`

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "group relative flex items-center h-10 px-4 min-w-[140px] max-w-[200px] cursor-pointer rounded-t-lg transition-all duration-200",
                  isActive
                    ? "bg-background text-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-x border-t z-10"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                )}
              >
                <span className="text-xs font-semibold truncate mr-6 select-none leading-none pt-0.5">
                  {title}
                </span>
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className={cn(
                    "absolute right-2 p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
                {isActive && (
                  <div className="absolute -bottom-px left-0 right-0 h-px bg-background z-20" />
                )}
              </div>
            )
          })}
          <button
            onClick={addNewTab}
            className="mb-1.5 p-1.5 rounded-full hover:bg-muted-foreground/20 text-muted-foreground transition-colors mx-2"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pb-1.5 ml-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700 h-8 font-bold"
            onClick={handlePrint}
          >
            <Printer className="h-3.5 w-3.5" /> Generate Bill
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-rose-200 hover:bg-rose-50 text-rose-700 h-8 font-medium"
            onClick={() => {
              if (confirm("Are you sure you want to reset this bill? All entered data will be lost.")) {
                resetActiveTab()
                toast.success("Bill Reset Successfully")
              }
            }}
          >
            <Loader2 className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 bg-background no-print">
        {activeTab ? (
          <BillingForm
            state={activeTab}
            onUpdate={updateActiveTab}
            onSave={handleSaveAttempt}
            isSaving={addOrderMutation.isPending || updateOrderMutation.isPending}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        )}
      </div>

      {/* Hidden Printable Receipt area targeted by window.print() */}
      {activeTab && admin?.store && (
        <div id="printable-receipt" className="hidden print:block">
          <BillingReceipt 
            ref={receiptRef}
            state={activeTab}
            store={admin.store as Store}
          />
        </div>
      )}
    </div>
  )
}
