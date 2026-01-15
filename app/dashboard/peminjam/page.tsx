"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PeminjamPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard/peminjam/catalog")
  }, [router])

  return null
}
