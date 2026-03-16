import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Order } from "@shruthi-boutique/types"

export function useOrders(filters: {
  limit?: number;
  skip?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  storeId?: string;
  customerId?: string;
}) {
  const params = new URLSearchParams()
  if (filters.limit) params.append("limit", filters.limit.toString())
  if (filters.skip) params.append("skip", filters.skip.toString())
  if (filters.status && filters.status.trim() !== "" && filters.status !== "all") params.append("status", filters.status)
  if (filters.fromDate && filters.fromDate.trim() !== "") params.append("fromDate", filters.fromDate)
  if (filters.toDate && filters.toDate.trim() !== "") params.append("toDate", filters.toDate)
  if (filters.search && filters.search.trim() !== "") params.append("search", filters.search)
  if (filters.storeId && filters.storeId.trim() !== "" && filters.storeId !== "all") params.append("storeId", filters.storeId)
  if (filters.customerId) params.append("customerId", filters.customerId)

  return useQuery<{ 
    orders: (Order & { 
      customer: import("@shruthi-boutique/types").Customer; 
      categories: string 
    })[], 
    totalOrdersCount: number 
  }>({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const res = await fetch(`/api/orders?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch orders")
      return res.json()
    }
  })
}

export function useAddOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderData: Partial<Order> & { name: string; phone: string; storeId: string }) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      })
      if (!res.ok) throw new Error("Failed to add order")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    }
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderData: Partial<Order>) => {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      })
      if (!res.ok) throw new Error("Failed to update order")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    }
  })
}

export function useOrderSearch(filters: { invoice?: number, storeId?: string }) {
  return useQuery<{
    orders: (Order & {
      customer: import("@shruthi-boutique/types").Customer;
    })[]
  }>({
    queryKey: ["orders-search", filters],
    queryFn: async () => {
      if (!filters.invoice || !filters.storeId) return { orders: [] };
      const res = await fetch(`/api/orders?search=${filters.invoice}&storeId=${filters.storeId}`)
      if (!res.ok) throw new Error("Failed to search orders")
      return res.json()
    },
    enabled: !!filters.invoice && !!filters.storeId
  })
}
