"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function SystemStatusBadge() {
  const [status, setStatus] = useState<"operational" | "degraded" | "checking">("checking")

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/health")
        if (res.ok) {
          setStatus("operational")
        } else {
          setStatus("degraded")
        }
      } catch (error) {
        setStatus("degraded")
      }
    }
    
    checkHealth()
    // Check every 60 seconds
    const interval = setInterval(checkHealth, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn(
      "flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors",
      status === "operational" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      status === "degraded" && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      status === "checking" && "bg-muted/50 text-muted-foreground border-border"
    )}>
      <span 
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "operational" && "bg-emerald-500 animate-pulse",
          status === "degraded" && "bg-red-500",
          status === "checking" && "bg-muted-foreground animate-pulse"
        )} 
      />
      {status === "operational" ? "System operational" : status === "degraded" ? "Degraded performance" : "Checking status..."}
    </div>
  )
}
