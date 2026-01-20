"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/hooks/use-api"
import { borrowingsAPI } from "@/lib/api"
import type { Borrowing } from "@/lib/types"

const statusConfig = {
  pending: {
    label: "Menunggu",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Clock,
  },
  approved: {
    label: "Disetujui",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle,
  },
  rejected: {
    label: "Ditolak",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: XCircle,
  },
  returned: {
    label: "Dikembalikan",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: CheckCircle,
  },
  overdue: {
    label: "Terlambat",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: AlertCircle,
  },
}

export default function BorrowingsPage() {
  const { data: borrowingsData } = useApi(() => borrowingsAPI.getMyBorrowings(), [], { showToast: false })

  const myBorrowings = borrowingsData || []

  const activeBorrowings = myBorrowings.filter((b) => b.status === "approved" || b.status === "overdue")
  const pendingBorrowings = myBorrowings.filter((b) => b.status === "pending")
  const historyBorrowings = myBorrowings.filter((b) => b.status === "returned" || b.status === "rejected")

  const BorrowingCard = ({ borrowing, index }: { borrowing: (typeof myBorrowings)[0]; index: number }) => {
    const status = statusConfig[borrowing.status]
    const StatusIcon = status.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.01 }}
      >
        <Card className="overflow-hidden bg-card border-border">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="w-2 bg-blue-600" />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{borrowing.tool.name}</h4>
                      <p className="text-sm text-muted-foreground">Jumlah: {borrowing.quantity}</p>
                    </div>
                  </div>
                  <Badge className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Pinjam: {new Date(borrowing.borrowDate).toLocaleDateString("id-ID")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Kembali: {new Date(borrowing.returnDate).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Peminjaman Saya</h1>
        <p className="text-muted-foreground">Lihat status dan riwayat peminjaman Anda</p>
      </motion.div>

      {/* Quick Stats - CHANGE: Updated to dark theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{pendingBorrowings.length}</p>
                <p className="text-sm text-yellow-400/80">Menunggu Persetujuan</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-green-500/30 bg-green-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{activeBorrowings.length}</p>
                <p className="text-sm text-green-400/80">Sedang Dipinjam</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{myBorrowings.length}</p>
                <p className="text-sm text-blue-400/80">Total Peminjaman</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary">
            <TabsTrigger value="active">Aktif ({activeBorrowings.length})</TabsTrigger>
            <TabsTrigger value="pending">Menunggu ({pendingBorrowings.length})</TabsTrigger>
            <TabsTrigger value="history">Riwayat ({historyBorrowings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBorrowings.length === 0 ? (
              <Card className="bg-card">
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Tidak ada peminjaman aktif</p>
                </CardContent>
              </Card>
            ) : (
              activeBorrowings.map((borrowing, index) => (
                <BorrowingCard key={borrowing.id} borrowing={borrowing} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBorrowings.length === 0 ? (
              <Card className="bg-card">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Tidak ada permintaan yang menunggu</p>
                </CardContent>
              </Card>
            ) : (
              pendingBorrowings.map((borrowing, index) => (
                <BorrowingCard key={borrowing.id} borrowing={borrowing} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {historyBorrowings.length === 0 ? (
              <Card className="bg-card">
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada riwayat peminjaman</p>
                </CardContent>
              </Card>
            ) : (
              historyBorrowings.map((borrowing, index) => (
                <BorrowingCard key={borrowing.id} borrowing={borrowing} index={index} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
