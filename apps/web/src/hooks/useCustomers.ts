import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Customer } from "@shruthi-boutique/types"

export function useCustomers(filters: { skip: number; limit: number; search: string }) {
  return useQuery<{ customers: Customer[]; totalCustomersCount: number }>({
    queryKey: ["customers", filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        skip: filters.skip.toString(),
        limit: filters.limit.toString(),
        search: filters.search
      })
      const res = await fetch(`/api/customers?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch customers")
      return res.json()
    }
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      })
      if (!res.ok) throw new Error("Failed to update customer")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    }
  })
}
