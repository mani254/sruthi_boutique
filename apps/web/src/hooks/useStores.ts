import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Store } from "@shruthi-boutique/types"

export function useStores(search: string = "") {
  return useQuery<Store[]>({
    queryKey: ["stores", search],
    queryFn: async () => {
      const url = search ? `/api/stores?search=${encodeURIComponent(search)}` : "/api/stores"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch stores")
      return res.json()
    }
  })
}

export function useAddStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (store: Partial<Store>) => {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store)
      })
      if (!res.ok) throw new Error("Failed to add store")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    }
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (store: Partial<Store> & { _id: string }) => {
      const res = await fetch("/api/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update store")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    }
  })
}
