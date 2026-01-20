"use client"

import { useState, Suspense, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Package, Filter, Calendar, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useApi } from "@/hooks/use-api"
import { useMutation } from "@/hooks/use-mutation"
import { toolsAPI, categoriesAPI, borrowingsAPI } from "@/lib/api"
import { useSearchStore } from "@/lib/store"
import type { Tool } from "@/lib/types"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

const borrowingSchema = z.object({
  borrowDate: z.date({ required_error: "Tanggal pinjam harus diisi" }),
  returnDate: z.date({ required_error: "Tanggal kembali harus diisi" }),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  notes: z.string().optional(),
})

type BorrowingForm = z.infer<typeof borrowingSchema>

const conditionColors = {
  baik: "bg-green-500/20 text-green-400",
  rusak_ringan: "bg-yellow-500/20 text-yellow-400",
  rusak_berat: "bg-red-500/20 text-red-400",
}

const conditionLabels = {
  baik: "Baik",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
}

function CatalogContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: toolsData } = useApi(() => toolsAPI.getAll(), [], { showToast: false })
  const { data: categoriesData } = useApi(() => categoriesAPI.getAll(), [], { showToast: false })

  const tools = toolsData || []
  const categories = categoriesData || []

  const { query: globalQuery } = useSearchStore()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BorrowingForm>({
    resolver: zodResolver(borrowingSchema),
    defaultValues: {
      quantity: 1,
    },
  })

  const { mutate: submitBorrowing, loading: loadingSubmit } = useMutation(
    (data: { toolId: string; borrowDate: string; returnDate: string; quantity: number; notes?: string }) =>
      borrowingsAPI.create(data),
    {
      onSuccess: () => {
        toast.success(`Permintaan peminjaman ${selectedTool?.name} berhasil diajukan!`)
        setIsDialogOpen(false)
        setSelectedTool(null)
        reset()
      },
    },
  )

  const effectiveQuery = searchQuery || globalQuery

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(effectiveQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(effectiveQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || tool.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenDialog = (tool: Tool) => {
    setSelectedTool(tool)
    setIsDialogOpen(true)
    reset()
  }

  const onSubmit = async (data: BorrowingForm) => {
    if (!selectedTool) return
    submitBorrowing({
      toolId: selectedTool.id,
      borrowDate: format(data.borrowDate, "yyyy-MM-dd"),
      returnDate: format(data.returnDate, "yyyy-MM-dd"),
      quantity: data.quantity,
      notes: data.notes,
    })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Katalog Alat</h1>
        <p className="text-muted-foreground">Cari dan pinjam alat yang Anda butuhkan</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari alat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card
                className="overflow-hidden h-full group cursor-pointer bg-card"
                onClick={() => handleOpenDialog(tool)}
              >
                <div className="h-40 bg-gradient-to-br from-blue-600/20 to-blue-900/20 flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-4 bg-blue-500/20 backdrop-blur-sm rounded-2xl shadow-lg"
                  >
                    <Package className="h-12 w-12 text-blue-400" />
                  </motion.div>
                  <div className="absolute top-3 right-3">
                    <Badge className={conditionColors[tool.condition]}>{conditionLabels[tool.condition]}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{tool.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant="outline">{tool.category}</Badge>
                    <span className="text-sm">
                      <span className="font-semibold text-blue-400">{tool.available}</span>
                      <span className="text-muted-foreground">/{tool.stock} tersedia</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTools.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Tidak ada alat ditemukan</h3>
          <p className="text-muted-foreground">Coba ubah kata kunci pencarian atau filter kategori</p>
        </motion.div>
      )}

      {/* Borrowing Modal with Calendar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <DialogHeader>
              <DialogTitle>Pinjam Alat</DialogTitle>
              <DialogDescription>
                Ajukan peminjaman untuk <strong>{selectedTool?.name}</strong>
              </DialogDescription>
            </DialogHeader>

            {selectedTool && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Package className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedTool.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTool.available} tersedia</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Pinjam</Label>
                    <Controller
                      name="borrowDate"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "dd MMM yyyy", { locale: localeID }) : "Pilih tanggal"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {errors.borrowDate && <p className="text-xs text-red-500">{errors.borrowDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Kembali</Label>
                    <Controller
                      name="returnDate"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "dd MMM yyyy", { locale: localeID }) : "Pilih tanggal"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {errors.returnDate && <p className="text-xs text-red-500">{errors.returnDate.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Jumlah</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedTool.available}
                    {...register("quantity", { valueAsNumber: true })}
                  />
                  {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea id="notes" placeholder="Tujuan peminjaman..." rows={3} {...register("notes")} />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengajukan...
                      </>
                    ) : (
                      "Ajukan Peminjaman"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogContent />
    </Suspense>
  )
}
