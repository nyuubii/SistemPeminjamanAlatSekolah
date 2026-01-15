"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PetugasPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard/petugas/approvals")
  }, [router])

  return null
}
