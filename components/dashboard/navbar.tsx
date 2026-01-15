"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, Menu, User, Settings, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuthStore, useSidebarStore, useSearchStore } from "@/lib/store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import toast from "react-hot-toast"

export function Navbar() {
  const router = useRouter()
  const { user, logout, updateUser } = useAuthStore()
  const { toggle } = useSidebarStore()
  const { query, setQuery } = useSearchStore()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [profileName, setProfileName] = useState(user?.name || "")
  const [profileEmail, setProfileEmail] = useState(user?.email || "")

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSaveProfile = () => {
    updateUser({ name: profileName, email: profileEmail })
    toast.success("Profil berhasil diperbarui!")
    setIsProfileOpen(false)
  }

  const handleSaveSettings = () => {
    toast.success("Pengaturan berhasil disimpan!")
    setIsSettingsOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-50"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari sesuatu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 w-64 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-blue-600 rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium text-sm">Peminjaman Baru</span>
                <span className="text-xs text-muted-foreground">Siti Rahayu mengajukan peminjaman</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium text-sm">Pengembalian Terlambat</span>
                <span className="text-xs text-muted-foreground">3 item belum dikembalikan</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium text-sm">Stok Menipis</span>
                <span className="text-xs text-muted-foreground">Laptop Dell tersisa 2 unit</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setProfileName(user?.name || "")
                  setProfileEmail(user?.email || "")
                  setIsProfileOpen(true)
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Pengaturan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>Perbarui informasi profil Anda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {profileName?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nama</Label>
              <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role || ""} disabled className="capitalize" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pengaturan</DialogTitle>
            <DialogDescription>Kelola pengaturan akun Anda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifikasi Email</p>
                <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifikasi Push</p>
                <p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema Gelap</p>
                <p className="text-sm text-muted-foreground">Gunakan tema gelap</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
