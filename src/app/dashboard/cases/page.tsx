import Link from "next/link"
import { getCases } from "@/features/cases/actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FolderOpen, AlertCircle, CheckCircle, Clock, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

import { EmptyCasesIllustration } from "@/components/ui/illustrations"

const statusConfig: Record<string, { label: string; icon: any; badgeClass: string; borderClass: string }> = {
  OPEN: {
    label: "Open",
    icon: AlertCircle,
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    borderClass: "border-l-red-400",
  },
  INVESTIGATING: {
    label: "Investigating",
    icon: Clock,
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    borderClass: "border-l-amber-400",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle,
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borderClass: "border-l-emerald-400",
  },
  CLOSED: {
    label: "Closed",
    icon: FolderOpen,
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
    borderClass: "border-l-border",
  },
}

export default async function CasesPage(props: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const searchParams = await props.searchParams
  const activeFilter = searchParams.status || "ALL"
  const page = parseInt(searchParams.page || "1")
  const { cases, total } = await getCases(page, 100)

  const filtered = activeFilter === "ALL" ? cases : cases.filter(c => c.status === activeFilter)

  // Count per status
  const counts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tabs = [
    { key: "ALL", label: "All Cases", count: total },
    { key: "OPEN", label: "Open", count: counts.OPEN || 0 },
    { key: "INVESTIGATING", label: "Investigating", count: counts.INVESTIGATING || 0 },
    { key: "RESOLVED", label: "Resolved", count: counts.RESOLVED || 0 },
    { key: "CLOSED", label: "Closed", count: counts.CLOSED || 0 },
  ]

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} case{total !== 1 ? "s" : ""} total — escalate incidents to open a case
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Link
            key={tab.key}
            href={tab.key === "ALL" ? "/dashboard/cases" : `/dashboard/cases?status=${tab.key}`}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 border",
              activeFilter === tab.key
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-card/60 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-semibold",
              activeFilter === tab.key
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-background text-muted-foreground"
            )}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Cases Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border rounded-3xl bg-card/30 backdrop-blur-md text-center space-y-3">
          <EmptyCasesIllustration width={160} height={120} />
          <div>
            <h3 className="text-base font-bold text-foreground">No cases found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {activeFilter === "ALL" ? "Escalate an incident to create a new case investigation." : `No ${activeFilter.toLowerCase()} cases match this filter.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const config = statusConfig[c.status] || statusConfig.CLOSED
            const StatusIcon = config.icon
            return (
              <Link href={`/dashboard/cases/${c.id}`} key={c.id} className="group">
                <div className={cn(
                  "h-full flex flex-col rounded-2xl border border-border border-l-4 glass-card p-5",
                  "hover:shadow-lg hover:border-primary/40 hover:-translate-y-1",
                  "transition-all duration-200 cursor-pointer",
                  config.borderClass,
                )}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {c.referenceNumber}
                    </span>
                    <Badge variant="outline" className={cn("text-xs font-semibold gap-1", config.badgeClass)}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {c.description || "No description provided."}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span title="Incidents" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {c._count.incidents}
                      </span>
                      <span title="Statements" className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" /> {c._count.statements}
                      </span>
                    </div>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  {c.assignedTo && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold flex-shrink-0">
                        {(c.assignedTo.name || "U").charAt(0).toUpperCase()}
                      </div>
                      {c.assignedTo.name || "Unknown"}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
