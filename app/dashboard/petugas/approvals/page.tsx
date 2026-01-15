"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Clock, Package, User, Calendar, FileCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { mockBorrowings } from "@/lib/mock-data"
import type { Borrowing } from "@/lib/types"
import toast from "react-hot-toast"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  returned: "bg-blue-100 text-blue-700 border-blue-200",
  overdue: "bg-orange-100 text-orange-700 border-orange-200",
}

const statusLabels = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  returned: "Dikembalikan",
  overdue: "Terlambat",
}

export default function ApprovalsPage() {
  const [borrowings, setBorrowings] = useState(mockBorrowings)
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const pendingBorrowings = borrowings.filter((b) => b.status === "pending")
  const approvedBorrowings = borrowings.filter((b) => b.status === "approved" || b.status === "overdue")

  const handleApprove = (borrowing: Borrowing) => {
    setBorrowings(borrowings.map((b) => (b.id === borrowing.id ? { ...b, status: "approved" as const } : b)))
    toast.success(`Peminjaman ${borrowing.tool.name} oleh ${borrowing.user.name} disetujui`)
  }

  const handleReject = () => {
    if (selectedBorrowing) {
      setBorrowings(borrowings.map((b) => (b.id === selectedBorrowing.id ? { ...b, status: "rejected" as const } : b)))
      toast.success(`Peminjaman ditolak`)
      setShowRejectDialog(false)
      setSelectedBorrowing(null)
      setRejectReason("")
    }
  }

  const handleReturn = (borrowing: Borrowing) => {
    setBorrowings(
      borrowings.map((b) =>
        b.id === borrowing.id ? { ...b, status: "returned" as const, actualReturnDate: new Date().toISOString() } : b,
      ),
    )
    toast.success(`${borrowing.tool.name} telah dikembalikan`)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Persetujuan Peminjaman</h1>
        <p className="text-muted-foreground">Kelola permintaan dan pengembalian alat</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{pendingBorrowings.length}</p>
                <p className="text-sm text-yellow-600">Menunggu Persetujuan</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {borrowings.filter((b) => b.status === "approved").length}
                </p>
                <p className="text-sm text-green-600">Sedang Dipinjam</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {borrowings.filter((b) => b.status === "overdue").length}
                </p>
                <p className="text-sm text-orange-600">Terlambat</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Approvals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Permintaan Menunggu Persetujuan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingBorrowings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada permintaan yang menunggu persetujuan</p>
            ) : (
              pendingBorrowings.map((borrowing, index) => (
                <motion.div
                  key={borrowing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{borrowing.tool.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {borrowing.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(borrowing.borrowDate).toLocaleDateString("id-ID")} -{" "}
                          {new Date(borrowing.returnDate).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(borrowing)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Setujui
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedBorrowing(borrowing)
                          setShowRejectDialog(true)
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Borrowings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-500" />
              Peminjaman Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvedBorrowings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada peminjaman aktif</p>
            ) : (
              approvedBorrowings.map((borrowing, index) => (
                <motion.div
                  key={borrowing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{borrowing.tool.name}</h4>
                        <Badge className={statusColors[borrowing.status]}>{statusLabels[borrowing.status]}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {borrowing.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Kembali: {new Date(borrowing.returnDate).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                      onClick={() => handleReturn(borrowing)}
                    >
                      Konfirmasi Pengembalian
                    </Button>
                  </motion.div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Peminjaman</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk {selectedBorrowing?.tool.name} oleh {selectedBorrowing?.user.name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan (opsional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Tolak Peminjaman
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
