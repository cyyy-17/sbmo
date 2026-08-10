"use client"

import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { escalateIncidentToCase } from "@/features/cases/actions"
import { toast } from "sonner"

type Incident = {
  id: string
  referenceNumber: string
  title: string
  dateOfIncident: Date | string
  severity: string
  status: string
  caseId: string | null
}

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold border",
        severity === "CRITICAL" && "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
        severity === "MAJOR" && "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
        severity === "MINOR" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      )}
    >
      {severity}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        status === "OPEN" && "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        status === "UNDER_REVIEW" && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        status === "RESOLVED" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        status === "CLOSED" && "border-border bg-muted/50 text-muted-foreground",
      )}
    >
      {status.replace("_", " ")}
    </Badge>
  )
}

function IncidentActions({ incident }: { incident: Incident }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleEscalate = () => {
    startTransition(async () => {
      try {
        const newCase = await escalateIncidentToCase(incident.id)
        toast.success("Incident escalated successfully")
        router.push(`/dashboard/cases/${newCase.id}`)
      } catch (error: any) {
        toast.error(error.message || "Failed to escalate incident")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {incident.caseId ? (
          <DropdownMenuItem>
            <Link href={`/dashboard/cases/${incident.caseId}`} className="flex items-center gap-2 w-full">
              <ArrowUpRight className="h-3.5 w-3.5" /> View Case
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleEscalate} disabled={isPending} className="flex items-center gap-2 text-amber-600 cursor-pointer w-full">
            <ArrowUpRight className="h-3.5 w-3.5" /> {isPending ? "Escalating..." : "Escalate to Case"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const incidentColumns: any[] = [
  {
    accessorKey: "referenceNumber",
    header: "Reference",
    size: 130,
    cell: ({ row }: any) => (
      <span className="font-mono text-xs font-medium text-muted-foreground">
        {row.original.referenceNumber}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Incident Title",
    cell: ({ row }: any) => (
      <span className="font-semibold text-foreground line-clamp-1">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "dateOfIncident",
    header: "Date",
    size: 120,
    cell: ({ row }: any) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.dateOfIncident).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    size: 110,
    cell: ({ row }: any) => <SeverityBadge severity={row.original.severity} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 130,
    cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    size: 60,
    enableSorting: false,
    cell: ({ row }: any) => <IncidentActions incident={row.original} />,
  },
]

export function IncidentsTable({ incidents }: { incidents: Incident[] }) {
  return (
    <DataTable
      columns={incidentColumns}
      data={incidents}
      searchPlaceholder="Search incidents by title, reference..."
      pageSize={15}
    />
  )
}
