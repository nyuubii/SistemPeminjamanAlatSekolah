"use client"

import { useState, useEffect } from "react"
import { Package, Users, ClipboardList, AlertTriangle, Clock, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardAPI, borrowingsAPI, activityLogsAPI } from "@/lib/api"
import type { DashboardStats, Borrowing, ActivityLog } from "@/lib/types"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  returned: "bg-blue-100 text-blue-700",
  overdue: "bg-orange-100 text-orange-700",
}

const statusLabels = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  returned: "Dikembalikan",
  overdue: "Terlambat",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, borrowingsData, logsData] = await Promise.all([
          dashboardAPI.getStats(),
          borrowingsAPI.getAll(),
          activityLogsAPI.getAll(),
        ])
        setStats(statsData)
        setBorrowings(borrowingsData)
        setLogs(logsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang! Berikut ringkasan sistem peminjaman alat.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Alat"
          value={stats.totalTools}
          icon={Package}
          description="Unit tersedia"
          trend={{ value: 12, isPositive: true }}
          delay={0}
        />
        <StatCard
          title="Total Pengguna"
          value={stats.totalUsers}
          icon={Users}
          description="Pengguna aktif"
          trend={{ value: 8, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Peminjaman Aktif"
          value={stats.activeBorrowings}
          icon={ClipboardList}
          description="Sedang dipinjam"
          delay={0.2}
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={stats.pendingApprovals}
          icon={Clock}
          description="Perlu ditinjau"
          delay={0.3}
        />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Borrowings */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Peminjaman Terbaru</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {borrowings.slice(0, 5).map((borrowing, index) => (
                <motion.div
                  key={borrowing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{borrowing.tool.name}</p>
                      <p className="text-xs text-muted-foreground">{borrowing.user.name}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[borrowing.status]}>{statusLabels[borrowing.status]}</Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Log */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Log Aktivitas</CardTitle>
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {logs.slice(0, 5).map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
                    {log.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{log.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{log.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overdue Warning */}
      {stats.overdueItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div>
            <p className="font-medium text-orange-700">Perhatian!</p>
            <p className="text-sm text-orange-600">
              Terdapat {stats.overdueItems} item yang terlambat dikembalikan.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
