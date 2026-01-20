"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Download, Calendar, Package, TrendingUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/hooks/use-api"
import { borrowingsAPI } from "@/lib/api"
import toast from "react-hot-toast"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("borrowings")
  const [period, setPeriod] = useState("month")
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: borrowingsData } = useApi(() => borrowingsAPI.getAll(), [], { showToast: false })
  const borrowings = borrowingsData || []

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    toast.loading("Generating PDF...", { id: "pdf-generate" })

    // Simulate PDF generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate PDF content
    const reportTitle = {
      borrowings: "Laporan Peminjaman",
      inventory: "Laporan Inventaris",
      users: "Laporan Pengguna",
      overdue: "Laporan Keterlambatan",
    }[reportType]

    const periodLabel = {
      week: "Minggu Ini",
      month: "Bulan Ini",
      quarter: "Kuartal Ini",
      year: "Tahun Ini",
    }[period]

    // Create PDF content as HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle} - ${periodLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #1e40af; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
          .stat-label { color: #6b7280; font-size: 14px; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SiPAS - ${reportTitle}</h1>
          <p>Periode: ${periodLabel}</p>
        </div>
        
        <p>Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${borrowings.length}</div>
            <div class="stat-label">Total Peminjaman</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${borrowings.filter((b) => b.status === "returned").length}</div>
            <div class="stat-label">Selesai</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${borrowings.filter((b) => b.status === "approved").length}</div>
            <div class="stat-label">Aktif</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${borrowings.filter((b) => b.status === "overdue").length}</div>
            <div class="stat-label">Terlambat</div>
          </div>
        </div>
        
        <h2>Detail Data</h2>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Alat</th>
              <th>Peminjam</th>
              <th>Tanggal Pinjam</th>
              <th>Tanggal Kembali</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${borrowings
              .map(
                (b, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${b.tool.name}</td>
                <td>${b.user.name}</td>
                <td>${new Date(b.borrowDate).toLocaleDateString("id-ID")}</td>
                <td>${new Date(b.returnDate).toLocaleDateString("id-ID")}</td>
                <td>${b.status.charAt(0).toUpperCase() + b.status.slice(1)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Dokumen ini digenerate secara otomatis oleh Sistem SiPAS</p>
          <p>© 2026 SiPAS - Sistem Peminjaman Alat</p>
        </div>
      </body>
      </html>
    `

    // Create blob and download
const blob = new Blob([htmlContent], { type: "text/html" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");

// kasih fallback kalau reportTitle / periodLabel undefined
const safeReportTitle = (reportTitle ?? "Untitled").replace(/\s/g, "_");
const safePeriodLabel = (periodLabel ?? "UnknownPeriod").replace(/\s/g, "_");
const today = new Date().toISOString().split("T")[0];

link.href = url;
link.download = `${safeReportTitle}_${safePeriodLabel}_${today}.html`;

document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);

toast.success("Laporan berhasil diunduh!", { id: "pdf-generate" });
setIsGenerating(false);
  }

  const stats = {
    totalBorrowings: borrowings.length,
    completedBorrowings: borrowings.filter((b) => b.status === "returned").length,
    activeBorrowings: borrowings.filter((b) => b.status === "approved").length,
    overdueBorrowings: borrowings.filter((b) => b.status === "overdue").length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-muted-foreground">Generate dan unduh laporan sistem</p>
      </motion.div>

      {/* Quick Stats - Updated colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Peminjaman",
            value: stats.totalBorrowings,
            icon: FileText,
            bgColor: "bg-blue-500/20",
            textColor: "text-blue-400",
          },
          {
            label: "Selesai",
            value: stats.completedBorrowings,
            icon: Package,
            bgColor: "bg-green-500/20",
            textColor: "text-green-400",
          },
          {
            label: "Aktif",
            value: stats.activeBorrowings,
            icon: TrendingUp,
            bgColor: "bg-yellow-500/20",
            textColor: "text-yellow-400",
          },
          {
            label: "Terlambat",
            value: stats.overdueBorrowings,
            icon: Calendar,
            bgColor: "bg-red-500/20",
            textColor: "text-red-400",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Report Generator */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Laporan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Laporan</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrowings">Laporan Peminjaman</SelectItem>
                    <SelectItem value="inventory">Laporan Inventaris</SelectItem>
                    <SelectItem value="users">Laporan Pengguna</SelectItem>
                    <SelectItem value="overdue">Laporan Keterlambatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Periode</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Minggu Ini</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                    <SelectItem value="quarter">Kuartal Ini</SelectItem>
                    <SelectItem value="year">Tahun Ini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleGeneratePDF}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate & Download Laporan
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Report Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Preview Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Alat</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Peminjam</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Pinjam</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Kembali</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.slice(0, 5).map((borrowing, index) => (
                    <motion.tr
                      key={borrowing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="border-t border-border hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-sm">{borrowing.tool.name}</td>
                      <td className="px-4 py-3 text-sm">{borrowing.user.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(borrowing.borrowDate).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(borrowing.returnDate).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{borrowing.status}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
