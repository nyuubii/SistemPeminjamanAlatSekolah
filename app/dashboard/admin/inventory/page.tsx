"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { mockTools, mockCategories } from "@/lib/mock-data"
import type { Tool } from "@/lib/types"
import toast from "react-hot-toast"

const conditionColors = {
  baik: "bg-green-100 text-green-700",
  rusak_ringan: "bg-yellow-100 text-yellow-700",
  rusak_berat: "bg-red-100 text-red-700",
}

const conditionLabels = {
  baik: "Baik",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
}

export default function InventoryPage() {
  const [tools, setTools] = useState(mockTools)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    stock: 1,
    condition: "baik" as Tool["condition"],
  })

  const handleOpenDialog = (tool?: Tool) => {
    if (tool) {
      setEditingTool(tool)
      setFormData({
        name: tool.name,
        description: tool.description,
        categoryId: tool.categoryId,
        stock: tool.stock,
        condition: tool.condition,
      })
    } else {
      setEditingTool(null)
      setFormData({ name: "", description: "", categoryId: "", stock: 1, condition: "baik" })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const category = mockCategories.find((c) => c.id === formData.categoryId)
    if (editingTool) {
      setTools(
        tools.map((t) =>
          t.id === editingTool.id
            ? { ...t, ...formData, category: category?.name || "", available: formData.stock }
            : t,
        ),
      )
      toast.success("Alat berhasil diperbarui")
    } else {
      const newTool: Tool = {
        id: String(tools.length + 1),
        ...formData,
        category: category?.name || "",
        available: formData.stock,
        createdAt: new Date().toISOString(),
      }
      setTools([...tools, newTool])
      toast.success("Alat berhasil ditambahkan")
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setTools(tools.filter((t) => t.id !== id))
    toast.success("Alat berhasil dihapus")
  }

  const columns: ColumnDef<Tool>[] = [
    {
      accessorKey: "name",
      header: "Nama Alat",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.description}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      accessorKey: "stock",
      header: "Stok",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium">{row.original.available}</span>
          <span className="text-muted-foreground">/{row.original.stock}</span>
        </div>
      ),
    },
    {
      accessorKey: "condition",
      header: "Kondisi",
      cell: ({ row }) => (
        <Badge className={conditionColors[row.original.condition]}>{conditionLabels[row.original.condition]}</Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenDialog(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Inventaris Alat</h1>
          <p className="text-muted-foreground">Kelola daftar alat dan stok</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Alat
          </Button>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable columns={columns} data={tools} searchKey="name" searchPlaceholder="Cari nama alat..." />
      </motion.div>

      {/* Tool Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DialogHeader>
                  <DialogTitle>{editingTool ? "Edit Alat" : "Tambah Alat Baru"}</DialogTitle>
                  <DialogDescription>
                    {editingTool ? "Perbarui informasi alat" : "Masukkan data alat baru"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Alat</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama alat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi alat"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stok</Label>
                      <Input
                        id="stock"
                        type="number"
                        min={1}
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Kondisi</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(v) => setFormData({ ...formData, condition: v as Tool["condition"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baik">Baik</SelectItem>
                        <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                        <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    {editingTool ? "Simpan Perubahan" : "Tambah"}
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
