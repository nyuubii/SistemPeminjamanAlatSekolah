"use client"

import { useState } from "react"
import toast from "react-hot-toast"

interface UseMutationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  showToast?: boolean
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async (variables: TVariables) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFn(variables)
      options?.onSuccess?.(result)
      if (options?.showToast !== false) {
        toast.success("Operasi berhasil")
      }
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred")
      setError(error)
      if (options?.showToast !== false) {
        toast.error(error.message)
      }
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
