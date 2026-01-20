"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Package,
  FolderOpen,
  ClipboardList,
  FileCheck,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
  Wrench,
  LogOut,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore, useSidebarStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/lib/types"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "petugas", "peminjam"] },
  { label: "Pengguna", href: "/dashboard/admin/users", icon: Users, roles: ["admin"] },
  { label: "Inventaris", href: "/dashboard/admin/inventory", icon: Package, roles: ["admin"] },
  { label: "Kategori", href: "/dashboard/admin/categories", icon: FolderOpen, roles: ["admin"] },
  { label: "Log Aktivitas", href: "/dashboard/admin/logs", icon: History, roles: ["admin"] },
  { label: "Persetujuan", href: "/dashboard/petugas/approvals", icon: FileCheck, roles: ["petugas"] },
  { label: "Laporan", href: "/dashboard/petugas/reports", icon: FileText, roles: ["petugas"] },
  { label: "Katalog Alat", href: "/dashboard/peminjam/catalog", icon: Search, roles: ["peminjam"] },
  { label: "Peminjaman Saya", href: "/dashboard/peminjam/borrowings", icon: ClipboardList, roles: ["peminjam"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { isCollapsed, toggle } = useSidebarStore()

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const isActiveLink = (href: string) => {
    // Exact match for dashboard home
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname === "/dashboard/admin" ||
        pathname === "/dashboard/petugas" ||
        pathname === "/dashboard/peminjam"
      )
    }
    // For other routes, check if current path starts with the href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border sticky top-0"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 15 }} className="p-2 bg-blue-600 rounded-lg shrink-0">
            <Wrench className="h-5 w-5 text-white" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-sidebar-foreground"
              >
                SiPAS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = isActiveLink(item.href)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "G"}
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name ?? "Guest"}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role ?? "guest"}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={cn(
            "mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors",
            isCollapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                Keluar
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}
