import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Category } from "@shruthi-boutique/types"

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    }
  })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(category)
      })
      if (!res.ok) throw new Error("Failed to add category")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete category")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    }
  })
}
