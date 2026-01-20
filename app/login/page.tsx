"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Wrench, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { authAPI } from "@/lib/api"
import toast from "react-hot-toast"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isHydrated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isHydrated, isAuthenticated, router])

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)

    try {
      const response = await authAPI.login(data.email, data.password)
      console.log("[Login] API Response:", response)
      
      const user = response?.user
      const token = response?.token
      
      // If we have a token but no user, we can still proceed
      // The dashboard will fetch the user profile
      if (!token) {
        console.error("[Login] No token in response:", response)
        throw new Error("Login gagal: token tidak ditemukan")
      }
      
      // Login with user (may be null) and token
      login(user ?? { id: "", name: "User", email: data.email, role: "peminjam" as const, createdAt: new Date().toISOString() }, token)
      toast.success(`Selamat datang, ${user?.name ?? "Pengguna"}!`)

      // Redirect based on role, default to dashboard
      const role = user?.role ?? "peminjam"
      switch (role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "petugas":
          router.push("/dashboard/petugas")
          break
        case "peminjam":
          router.push("/dashboard/peminjam")
          break
        default:
          router.push("/dashboard")
      }
    } catch (error) {
      console.error("[Login] Error:", error)
      const message = error instanceof Error ? error.message : "Email atau password salah"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (email: string) => {
    setValue("email", email, { shouldValidate: true })
    setValue("password", "password123", { shouldValidate: true })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero illustration - CHANGE: Updated to blue theme */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-800 to-black p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SiPAS</span>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight text-balance"
          >
            Sistem Peminjaman Alat Sekolah
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg max-w-md text-pretty"
          >
            Kelola inventaris dan peminjaman alat dengan mudah, cepat, dan terorganisir. Platform digital untuk
            efisiensi operasional.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3 pt-4"
          >
            {["Tracking Real-time", "Laporan Otomatis", "Multi-Role Access"].map((feature, i) => (
              <motion.span
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20"
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 text-blue-200 text-sm"
        >
          © 2026 SiPAS. All rights reserved.
        </motion.div>
      </motion.div>

      {/* Right side - Login form - CHANGE: Updated to blue theme */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:hidden flex items-center justify-center gap-2 mb-8"
          >
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SiPAS</span>
          </motion.div>

          <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-neutral-900/80 backdrop-blur-sm border-neutral-800">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-white">Masuk ke Akun</CardTitle>
              <CardDescription className="text-neutral-400">Masukkan kredensial Anda untuk melanjutkan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      className="pl-10 bg-neutral-800 border-neutral-700 focus:border-blue-500 focus:ring-blue-500 text-white placeholder:text-neutral-500"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-neutral-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-neutral-800 border-neutral-700 focus:border-blue-500 focus:ring-blue-500 text-white placeholder:text-neutral-500"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Demo accounts */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <p className="text-sm text-neutral-400 mb-3">Akun Demo:</p>
                <div className="space-y-2 text-xs">
                  {[
                    { email: "admin@example.com", role: "Admin" },
                    { email: "budi@example.com", role: "Petugas" },
                    { email: "siti@example.com", role: "Peminjam" },
                  ].map((account) => (
                    <motion.div
                      key={account.email}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
                      onClick={() => fillDemoAccount(account.email)}
                    >
                      <span className="text-neutral-300">{account.email}</span>
                      <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded-md font-medium">
                        {account.role}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
