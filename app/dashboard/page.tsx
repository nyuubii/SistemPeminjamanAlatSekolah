"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "petugas":
          router.push("/dashboard/petugas")
          break
        case "peminjam":
          router.push("/dashboard/peminjam")
          break
      }
    }
  }, [user, router])

  return null
}
