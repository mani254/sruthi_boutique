import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Admin } from "@shruthi-boutique/types"

export function useAdmins(filters: { skip: number; limit: number; search: string }) {
  return useQuery<{ admins: Admin[]; totalAdminsCount: number }>({
    queryKey: ["admins", filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        skip: filters.skip.toString(),
        limit: filters.limit.toString(),
        search: filters.search
      })
      const res = await fetch(`/api/admins?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch admins")
      return res.json()
    }
  })
}

export function useAddAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (admin: Partial<Admin>) => {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin)
      })
      if (!res.ok) throw new Error("Failed to add admin")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    }
  })
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (admin: Partial<Admin>) => {
      const res = await fetch("/api/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin)
      })
      if (!res.ok) throw new Error("Failed to update admin")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    }
  })
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admins?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete admin")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    }
  })
}
