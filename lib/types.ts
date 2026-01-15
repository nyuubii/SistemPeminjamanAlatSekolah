export type UserRole = "admin" | "petugas" | "peminjam"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  categoryId: string
  stock: number
  available: number
  image?: string
  condition: "baik" | "rusak_ringan" | "rusak_berat"
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  toolCount: number
}

export interface Borrowing {
  id: string
  toolId: string
  tool: Tool
  userId: string
  user: User
  borrowDate: string
  returnDate: string
  actualReturnDate?: string
  quantity: number
  status: "pending" | "approved" | "rejected" | "returned" | "overdue"
  notes?: string
  createdAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  user: User
  action: string
  description: string
  createdAt: string
}

export interface DashboardStats {
  totalTools: number
  totalUsers: number
  activeBorrowings: number
  pendingApprovals: number
  overdueItems: number
}
