"use client"

import React from "react"
import { BillingTabState } from "./billing-form"
import { Store } from "@shruthi-boutique/types"
import { convertAmountToWords } from "@/lib/billing-utils"
import { format } from "date-fns"

interface BillingReceiptProps {
  state: BillingTabState;
  store: Store;
}

export const BillingReceipt = React.forwardRef<HTMLDivElement, BillingReceiptProps>(
  ({ state, store }, ref) => {
    const subTotal = state.items.reduce((acc, item) => acc + (item.sTotal || 0), 0)
    const grandTotal = subTotal - (state.billInfo.discount || 0)
    const balance = grandTotal - (state.billInfo.advance || 0)
    const amountInWords = convertAmountToWords(grandTotal)

    // Using a class-based approach for the printable receipt to give it that "classic" look
    // while still leveraging Tailwind for layout
    return (
      <div ref={ref} className="bg-white text-black print:p-0 print:max-w-none">
        <div className="print:break-after-page min-h-[50vh] flex flex-col justify-start p-8 max-w-[800px] mx-auto print:max-w-none print:p-8">
          <ReceiptContent 
            state={state} 
            store={store} 
            subTotal={subTotal} 
            grandTotal={grandTotal} 
            balance={balance} 
            amountInWords={amountInWords}
            copyName="OFFICE COPY"
          />
        </div>
        
        <div className="flex flex-col justify-start p-8 max-w-[800px] mx-auto print:max-w-none print:p-8 mt-8 print:mt-0">
          <ReceiptContent 
            state={state} 
            store={store} 
            subTotal={subTotal} 
            grandTotal={grandTotal} 
            balance={balance} 
            amountInWords={amountInWords}
            copyName="CUSTOMER COPY"
          />
        </div>
      </div>
    )
  }
)

BillingReceipt.displayName = "BillingReceipt"

interface ReceiptContentProps extends BillingReceiptProps {
  subTotal: number;
  grandTotal: number;
  balance: number;
  amountInWords: string;
  copyName: string;
}

function ReceiptContent({ state, store, subTotal, grandTotal, balance, amountInWords, copyName }: ReceiptContentProps) {
  return (
    <div className="relative border-2 border-black p-6 rounded-sm">
      <div className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 opacity-50">
        {copyName}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="w-20 h-20 flex items-center justify-center border-2 border-black/10 rounded-lg p-2">
            <span className="text-4xl font-black text-black">S</span>
        </div>
        <div className="text-center flex-1 px-4">
          <h1 className="text-2xl font-black uppercase tracking-tight">{store?.name || "Shruthi Boutique"}</h1>
          <p className="text-xs font-bold text-gray-600 mt-1">{store?.address}</p>
          <div className="flex justify-center gap-4 text-xs font-bold mt-2">
            <span>Phone: {store?.phone}</span>
            {store?.landLine && <span>Landline: {store?.landLine}</span>}
          </div>
        </div>
        <div className="w-20 h-20 flex items-center justify-center border-2 border-black/10 rounded-lg p-2">
            <span className="text-4xl font-black text-black">B</span>
        </div>
      </div>

      <div className="border-t-2 border-b-2 border-black py-2 mb-6 flex justify-between items-center bg-gray-50 px-4">
        <h2 className="text-lg font-black uppercase tracking-widest">Stitching Invoice</h2>
        <div className="text-right">
          <p className="text-sm font-black">INV: {state.invoiceNumber}</p>
          <p className="text-[10px] font-bold text-gray-500 uppercase">{format(new Date(), "PPpp")}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-gray-500">Customer Details</p>
          <p className="text-sm font-black uppercase">{state.customer.name || "CASH SALE"}</p>
          <p className="text-sm font-bold">{state.customer.phone || "-"}</p>
        </div>
        <div className="text-right space-y-1 text-sm">
           <div className="flex justify-end gap-2">
             <span className="font-bold text-gray-500">Delivery Date:</span>
             <span className="font-black">{state.billInfo.deliveryDate ? format(new Date(state.billInfo.deliveryDate), "PPP") : "TBD"}</span>
           </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 text-xs font-black uppercase">S.No</th>
            <th className="text-left py-2 text-xs font-black uppercase">Category</th>
            <th className="text-center py-2 text-xs font-black uppercase">Qty</th>
            <th className="text-right py-2 text-xs font-black uppercase">Price</th>
            <th className="text-right py-2 text-xs font-black uppercase">Total</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, index) => (
            <tr key={index} className="border-b border-black/10">
              <td className="py-2 text-sm">{index + 1}</td>
              <td className="py-2 text-sm font-bold uppercase">{item.category}</td>
              <td className="py-2 text-sm text-center">{item.quantity}</td>
              <td className="py-2 text-sm text-right">₹{item.price.toLocaleString()}</td>
              <td className="py-2 text-sm text-right font-black">₹{item.sTotal?.toLocaleString()}</td>
            </tr>
          ))}
          {/* Fill extra space if few items */}
          {Array.from({ length: Math.max(0, 3 - state.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="border-b border-black/5 h-8">
              <td colSpan={5}></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-black bg-gray-50">
            <td colSpan={3} className="py-3 px-2">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Amount in Words</p>
                <p className="text-xs font-black uppercase italic">{amountInWords} Rupees Only</p>
            </td>
            <td colSpan={2} className="py-3 px-4 text-right">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹{subTotal.toLocaleString()}</span>
                    </div>
                    {state.billInfo.discount > 0 && (
                        <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span>Discount:</span>
                            <span>-₹{state.billInfo.discount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-black/10">
                        <span>Net Amount:</span>
                        <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-2">
            {state.billInfo.note && (
                <div className="bg-gray-100 p-2 rounded-sm border-l-4 border-black">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-0.5">Notes</p>
                    <p className="text-xs font-bold leading-tight">{state.billInfo.note}</p>
                </div>
            )}
        </div>
        <div className="space-y-1">
            <div className="flex justify-between items-center text-sm px-2">
                <span className="font-bold">Advance Paid:</span>
                <span className="font-black bg-black text-white px-2 py-0.5 rounded-sm">₹{state.billInfo.advance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm px-2">
                <span className="font-bold">Balance to Pay:</span>
                <span className="font-black text-rose-600 text-lg underline underline-offset-4 decoration-2">₹{balance.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between items-end border-t border-black/10 pt-4">
        <div className="text-[10px] font-bold text-gray-500 italic max-w-[250px]">
            Thank you for choosing our service! Please bring this invoice for collection.
        </div>
        <div className="text-center">
            <div className="w-32 border-b-2 border-black inline-block h-8"></div>
            <p className="text-[10px] font-black uppercase mt-1">Authorized Signatory</p>
        </div>
      </div>
    </div>
  )
}
