import axios from "axios"
import { useAuthStore } from "./store"
import type { User, Tool, Category, Borrowing, ActivityLog, DashboardStats } from "./types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token
  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("auth-token")
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/login", { email, password })
    const responseData = response.data
    const data = responseData.data || responseData

    let user: User | null = null
    let token: string | null = null

    if (data.user) {
      const u = data.user
      user = {
        id: String(u.id),
        name: u.nama_lengkap || u.name || u.username,
        email: u.email,
        role: u.role as "admin" | "petugas" | "peminjam",
        createdAt: u.createdAt || u.created_at || new Date().toISOString(),
      }
    } else if (data.id && data.email) {
      user = {
        id: String(data.id),
        name: data.nama_lengkap || data.name || data.username,
        email: data.email,
        role: data.role as "admin" | "petugas" | "peminjam",
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
      }
    }

    token =
      data.token ||
      data.access_token ||
      data.accessToken ||
      responseData.token ||
      responseData.access_token ||
      null

    return { user, token }
  },
  logout: async () => {
    await api.post("/logout")
  },
  getProfile: async () => {
    const response = await api.get("/user")
    const responseData = response.data
    const data = responseData.data || responseData
    let user: User | null = null
    const userData = data.user || data

    if (userData && (userData.id || userData.email)) {
      user = {
        id: String(userData.id),
        name: userData.nama_lengkap || userData.name || userData.username,
        email: userData.email,
        role: userData.role as "admin" | "petugas" | "peminjam",
        createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
      }
    }
    return user
  },
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<User>("/user", data)
    return response.data
  },
}

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get<User[]>("/user")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<User>(`/user/${id}`)
    return response.data
  },
  create: async (data: Omit<User, "id" | "createdAt">) => {
    const response = await api.post<User>("/user", data)
    return response.data
  },
  update: async (id: string, data: Partial<User>) => {
    const response = await api.put<User>(`/user/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/user/${id}`)
  },
}

// Tools API
export const toolsAPI = {
  getAll: async () => {
    const response = await api.get<Tool[]>("/alat")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<Tool>(`/alat/${id}`)
    return response.data
  },
  create: async (data: Omit<Tool, "id" | "createdAt">) => {
    const response = await api.post<Tool>("/alat", data)
    return response.data
  },
  update: async (id: string, data: Partial<Tool>) => {
    const response = await api.put<Tool>(`/alat/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/alat/${id}`)
  },
}

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get<Category[]>("/kategori")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<Category>(`/kategori/${id}`)
    return response.data
  },
  create: async (data: Omit<Category, "id" | "toolCount">) => {
    const response = await api.post<Category>("/kategori", data)
    return response.data
  },
  update: async (id: string, data: Partial<Category>) => {
    const response = await api.put<Category>(`/kategori/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/kategori/${id}`)
  },
}

// Borrowings API
export const borrowingsAPI = {
  getAll: async () => {
    const response = await api.get<Borrowing[]>("/peminjaman")
    return response.data
  },
  getMyBorrowings: async () => {
    const response = await api.get<Borrowing[]>("/peminjaman/me")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<Borrowing>(`/peminjaman/${id}`)
    return response.data
  },
  create: async (data: {
    toolId: string
    borrowDate: string
    returnDate: string
    quantity: number
    notes?: string
  }) => {
    const response = await api.post<Borrowing>("/peminjaman", data)
    return response.data
  },
  approve: async (id: string) => {
    const response = await api.put<Borrowing>(`/peminjaman/${id}/approve`)
    return response.data
  },
  reject: async (id: string, reason?: string) => {
    const response = await api.put<Borrowing>(`/peminjaman/${id}/reject`, { reason })
    return response.data
  },
  return: async (id: string) => {
    const response = await api.put<Borrowing>(`/peminjaman/${id}/return`)
    return response.data
  },
}

// Activity Logs API
export const activityLogsAPI = {
  getAll: async () => {
    try {
      const response = await api.get<ActivityLog[]>("/logs")
      return response.data
    } catch (error: any) {
      // Fallback to mock data if endpoint doesn't exist (404)
      if (error.response?.status === 404) {
        const { mockActivityLogs } = await import("./mock-data")
        return mockActivityLogs
      }
      throw error
    }
  },
}

// Dashboard Stats API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get<DashboardStats>("/dashboard")
    return response.data
  },
}

// Reports API
export const reportsAPI = {
  generatePDF: async (type: string, period: string) => {
    const response = await api.get(`/reports/generate`, {
      params: { type, period },
      responseType: "blob",
    })
    return response.data
  },
}

export default api
