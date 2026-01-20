"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "petugas" | "peminjam"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isHydrated, user } = useAuthStore()

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      switch (user?.role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "petugas":
          router.push("/dashboard/petugas")
          break
        case "peminjam":
          router.push("/dashboard/peminjam")
          break
        default:
          router.push("/login")
      }
    }
  }, [isAuthenticated, isHydrated, requiredRole, user, router])

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
