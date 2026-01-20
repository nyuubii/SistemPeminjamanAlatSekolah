"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { authAPI } from "@/lib/api"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  const [bootstrapping, setBootstrapping] = useState(false)

  useEffect(() => {
    let mounted = true

    const tryFetchProfile = async () => {
      const { isHydrated, token, user } = useAuthStore.getState()
      console.debug(`[Bootstrap] isHydrated=${isHydrated}, hasToken=${!!token}, hasUser=${!!user}`)
      
      if (isHydrated && token && !user) {
        try {
          console.debug(`[Bootstrap] Fetching profile with token...`)
          const profile = await authAPI.getProfile()
          console.debug(`[Bootstrap] Profile fetched:`, profile)
          if (mounted && profile) {
            useAuthStore.getState().login(profile, token)
            console.debug("✓ Profile fetched and user authenticated")
          }
        } catch (err: any) {
          console.error(`[Bootstrap] Profile fetch failed:`, err?.message || err)
          const status = err?.response?.status
          console.debug(`[Bootstrap] Error status: ${status}`)
          
          if (status === 401 || status === 403) {
            console.warn(`[Bootstrap] Auth invalid (${status}), clearing token`)
            if (mounted) {
              useAuthStore.getState().logout()
              toast.error("Sesi tidak valid. Silakan login kembali.")
            }
          } else if (status && status !== 404) {
            if (mounted) {
              console.warn("⚠ Profile fetch failed, but token remains valid.", status)
              toast.error("Gagal mengambil profil. Silakan refresh halaman.")
            }
          }
        }
      } else if (isHydrated && !token) {
        console.debug(`[Bootstrap] No token found, skipping profile fetch`)
      }

      if (mounted) {
        console.debug(`[Bootstrap] Complete`)
      }
    }

    queueMicrotask(() => {
      tryFetchProfile()
    })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {bootstrapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      )}
    </QueryClientProvider>
  )
}
