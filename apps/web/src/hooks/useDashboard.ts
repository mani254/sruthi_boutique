import { useQuery } from "@tanstack/react-query"

export function useDashboardData(filters: { storeId?: string, fromDate?: string, toDate?: string }) {
  const params = new URLSearchParams()
  if (filters.storeId) params.append("storeId", filters.storeId)
  if (filters.fromDate) params.append("fromDate", filters.fromDate)
  if (filters.toDate) params.append("toDate", filters.toDate)

  return useQuery({
    queryKey: ["dashboard", filters],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch dashboard data")
      return res.json()
    }
  })
}

export function useDeliveriesData(filters: { storeId?: string }) {
  const params = new URLSearchParams()
  if (filters.storeId) params.append("storeId", filters.storeId)

  return useQuery({
    queryKey: ["dashboard-deliveries", filters],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/deliveries?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch deliveries data")
      return res.json()
    }
  })
}
