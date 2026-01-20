"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontal, Pencil, Trash2, UserPlus, Loader2 } from "lucide-react"
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
import { useApi } from "@/hooks/use-api"
import { useMutation } from "@/hooks/use-mutation"
import { usersAPI } from "@/lib/api"
import type { User, UserRole } from "@/lib/types"
import toast from "react-hot-toast"

const roleColors = {
  admin: "bg-blue-100 text-blue-700",
  petugas: "bg-blue-100 text-blue-700",
  peminjam: "bg-green-100 text-green-700",
}

const roleLabels = {
  admin: "Admin",
  petugas: "Petugas",
  peminjam: "Peminjam",
}

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", role: "peminjam" as UserRole })
  const [localUsers, setLocalUsers] = useState<User[]>([])

  const { data: apiUsers, loading: loadingUsers } = useApi(() => usersAPI.getAll(), [], {
    showToast: false,
  })

  const users = apiUsers || localUsers

  const { mutate: createUser, loading: loadingCreate } = useMutation(
    (data: Omit<User, "id" | "createdAt">) =>
      usersAPI.create(data).catch(() => Promise.reject(new Error("Gagal membuat pengguna"))),
    {
      onSuccess: (newUser) => {
        setLocalUsers([...users, newUser])
        setIsDialogOpen(false)
        toast.success("Pengguna berhasil ditambahkan")
      },
    },
  )

  const { mutate: updateUser, loading: loadingUpdate } = useMutation(
    (data: { id: string; updates: Partial<User> }) =>
      usersAPI.update(data.id, data.updates).catch(() => Promise.reject(new Error("Gagal memperbarui pengguna"))),
    {
      onSuccess: (updated) => {
        setLocalUsers(users.map((u) => (u.id === updated.id ? updated : u)))
        setIsDialogOpen(false)
        toast.success("Pengguna berhasil diperbarui")
      },
    },
  )

  const { mutate: deleteUser, loading: loadingDelete } = useMutation(
    (id: string) => usersAPI.delete(id).catch(() => Promise.reject(new Error("Gagal menghapus pengguna"))),
    {
      onSuccess: () => {
        setLocalUsers(users.filter((u) => u.id !== editingUser?.id))
        toast.success("Pengguna berhasil dihapus")
      },
    },
  )

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({ name: user.name, email: user.email, role: user.role })
    } else {
      setEditingUser(null)
      setFormData({ name: "", email: "", role: "peminjam" })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast.error("Nama dan email harus diisi")
      return
    }

    if (editingUser) {
      updateUser({ id: editingUser.id, updates: formData })
    } else {
      createUser(formData)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      setEditingUser({ ...editingUser, id } as User)
      await deleteUser(id)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge className={roleColors[row.original.role]}>{roleLabels[row.original.role]}</Badge>,
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Dibuat",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("id-ID"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={loadingDelete}>
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
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Kelola data pengguna sistem</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700" disabled={loadingUsers}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        </motion.div>
      </motion.div>

      {loadingUsers ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Cari nama pengguna..." />
        </motion.div>
      )}

      {/* User Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? "Perbarui informasi pengguna" : "Masukkan data pengguna baru"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="petugas">Petugas</SelectItem>
                        <SelectItem value="peminjam">Peminjam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loadingCreate || loadingUpdate}
                  >
                    {loadingCreate || loadingUpdate ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : editingUser ? (
                      "Simpan Perubahan"
                    ) : (
                      "Tambah"
                    )}
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
