"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  delay?: number
}

export function StatCard({ title, value, icon: Icon, description, trend, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: delay + 0.2, type: "spring" }}
                  className="text-3xl font-bold text-foreground"
                >
                  {value}
                </motion.span>
                {trend && (
                  <span
                    className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded-md",
                      trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                    )}
                  >
                    {trend.isPositive ? "+" : "-"}
                    {trend.value}%
                  </span>
                )}
              </div>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.1, type: "spring" }}
              className="p-3 bg-blue-100 rounded-xl"
            >
              <Icon className="h-6 w-6 text-blue-600" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
