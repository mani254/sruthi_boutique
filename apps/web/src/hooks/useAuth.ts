import { useQuery } from "@tanstack/react-query"
import { Admin } from "@shruthi-boutique/types"

export function useAuth() {
  return useQuery<Admin>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (res.status === 401) return null as unknown as Admin
      if (!res.ok) throw new Error("Failed to fetch user context")
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
