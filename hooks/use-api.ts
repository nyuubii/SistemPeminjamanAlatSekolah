"use client"

import type React from "react"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  showToast?: boolean
}

export function useApi<T>(apiCall: () => Promise<T>, dependencies?: React.DependencyList, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiCall()
        if (isMounted) {
          setData(result)
          options?.onSuccess?.(result)
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error("An error occurred")
          setError(error)
          if (options?.showToast !== false) {
            toast.error(error.message)
          }
          options?.onError?.(error)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { data, loading, error }
}
