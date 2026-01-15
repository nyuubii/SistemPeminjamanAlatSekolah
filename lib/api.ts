import axios from "axios"
import { useAuthStore } from "./store"
import type { User, Tool, Category, Borrowing, ActivityLog, DashboardStats } from "./types"

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
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
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>("/auth/login", { email, password })
    return response.data
  },
  logout: async () => {
    await api.post("/auth/logout")
  },
  getProfile: async () => {
    const response = await api.get<User>("/auth/profile")
    return response.data
  },
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<User>("/auth/profile", data)
    return response.data
  },
}

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get<User[]>("/users")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },
  create: async (data: Omit<User, "id" | "createdAt">) => {
    const response = await api.post<User>("/users", data)
    return response.data
  },
  update: async (id: string, data: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/users/${id}`)
  },
}

// Tools API
export const toolsAPI = {
  getAll: async () => {
    const response = await api.get<Tool[]>("/tools")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<Tool>(`/tools/${id}`)
    return response.data
  },
  create: async (data: Omit<Tool, "id" | "createdAt">) => {
    const response = await api.post<Tool>("/tools", data)
    return response.data
  },
  update: async (id: string, data: Partial<Tool>) => {
    const response = await api.put<Tool>(`/tools/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/tools/${id}`)
  },
}

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get<Category[]>("/categories")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data
  },
  create: async (data: Omit<Category, "id" | "toolCount">) => {
    const response = await api.post<Category>("/categories", data)
    return response.data
  },
  update: async (id: string, data: Partial<Category>) => {
    const response = await api.put<Category>(`/categories/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/categories/${id}`)
  },
}

// Borrowings API
export const borrowingsAPI = {
  getAll: async () => {
    const response = await api.get<Borrowing[]>("/borrowings")
    return response.data
  },
  getMyBorrowings: async () => {
    const response = await api.get<Borrowing[]>("/borrowings/my")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<Borrowing>(`/borrowings/${id}`)
    return response.data
  },
  create: async (data: {
    toolId: string
    borrowDate: string
    returnDate: string
    quantity: number
    notes?: string
  }) => {
    const response = await api.post<Borrowing>("/borrowings", data)
    return response.data
  },
  approve: async (id: string) => {
    const response = await api.put<Borrowing>(`/borrowings/${id}/approve`)
    return response.data
  },
  reject: async (id: string, reason?: string) => {
    const response = await api.put<Borrowing>(`/borrowings/${id}/reject`, { reason })
    return response.data
  },
  return: async (id: string) => {
    const response = await api.put<Borrowing>(`/borrowings/${id}/return`)
    return response.data
  },
}

// Activity Logs API
export const activityLogsAPI = {
  getAll: async () => {
    const response = await api.get<ActivityLog[]>("/activity-logs")
    return response.data
  },
}

// Dashboard Stats API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get<DashboardStats>("/dashboard/stats")
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
