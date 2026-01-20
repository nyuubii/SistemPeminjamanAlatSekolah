"use client"

import { motion } from "framer-motion"
import { History, User, Package, FileCheck, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/use-api"
import { activityLogsAPI } from "@/lib/api"

const actionIcons: Record<string, React.ElementType> = {
  CREATE_TOOL: Package,
  UPDATE_TOOL: Package,
  DELETE_TOOL: Package,
  CREATE_USER: User,
  UPDATE_USER: User,
  DELETE_USER: User,
  APPROVE_BORROWING: FileCheck,
  REJECT_BORROWING: FileCheck,
  REQUEST_BORROWING: FileCheck,
  RETURN_TOOL: FileCheck,
  SYSTEM: Settings,
}

const actionColors: Record<string, string> = {
  CREATE_TOOL: "bg-green-100 text-green-700",
  UPDATE_TOOL: "bg-blue-100 text-blue-700",
  DELETE_TOOL: "bg-red-100 text-red-700",
  CREATE_USER: "bg-green-100 text-green-700",
  UPDATE_USER: "bg-blue-100 text-blue-700",
  DELETE_USER: "bg-red-100 text-red-700",
  APPROVE_BORROWING: "bg-green-100 text-green-700",
  REJECT_BORROWING: "bg-red-100 text-red-700",
  REQUEST_BORROWING: "bg-yellow-100 text-yellow-700",
  RETURN_TOOL: "bg-blue-100 text-blue-700",
}

export default function LogsPage() {
  // default [] supaya tidak null
  const { data: logs = [] } = useApi(() => activityLogsAPI.getAll(), [], { showToast: false })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Log Aktivitas</h1>
        <p className="text-muted-foreground">Pantau semua aktivitas dalam sistem</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(logs) && logs.length > 0 ? (
                logs.map((log, index) => {
                  const Icon = actionIcons[log.action] || Settings
                  return (
                    <motion.div
                      key={log.id ?? index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{log.user?.name ?? "Unknown User"}</span>
                          <Badge className={actionColors[log.action] || "bg-gray-100 text-gray-700"}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(log.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada log</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
