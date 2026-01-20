"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { useAuthStore } from "@/lib/store"
import { authAPI } from "@/lib/api"
import { Providers } from "@/components/providers"
import { motion } from "framer-motion"
import { AlertCircle, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, isHydrated, setUser, token } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [fetchingUser, setFetchingUser] = useState(false)
  const fetchAttempted = useRef(false)

  useEffect(() => {
    console.debug(`[Dashboard Layout] isHydrated=${isHydrated}, isAuth=${isAuthenticated}, user=${user?.name ?? "null"}, token=${token ? "exists" : "null"}`)
    
    if (isHydrated) {
      if (!isAuthenticated) {
        console.warn(`[Dashboard Layout] Not authenticated, redirecting to login`)
        router.push("/login")
      } else {
        setIsLoading(false)
        
        // If authenticated but no user data, try to fetch user profile
        if (!user && token && !fetchAttempted.current) {
          fetchAttempted.current = true
          setFetchingUser(true)
          console.debug(`[Dashboard Layout] Fetching user profile...`)
          
          authAPI.getProfile()
            .then((userData) => {
              console.debug(`[Dashboard Layout] User profile fetched:`, userData)
              if (userData) {
                setUser(userData)
              }
            })
            .catch((error) => {
              console.error(`[Dashboard Layout] Failed to fetch user profile:`, error)
            })
            .finally(() => {
              setFetchingUser(false)
            })
        }
      }
    }
  }, [isAuthenticated, isHydrated, router, user, token, setUser])

  // Show loader while hydrating or loading
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="text-muted-foreground text-sm">Memuat...</p>
      </div>
    )
  }

  // Fallback UI when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-yellow-500" />
        <h2 className="text-xl font-semibold text-foreground">Belum Login</h2>
        <p className="text-muted-foreground text-sm">Silakan login untuk mengakses dashboard</p>
        <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>
    )
  }

  // Show loading while fetching user data
  if (fetchingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="text-muted-foreground text-sm">Memuat data pengguna...</p>
      </div>
    )
  }

  return (
    <Providers>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </Providers>
  )
}
