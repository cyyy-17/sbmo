"use client"

import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Clock, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Activity, 
  Briefcase, 
  AlertTriangle, 
  GraduationCap, 
  User as UserIcon,
  Shield,
  FileText
} from "lucide-react"

export const columns = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    size: 160,
    cell: ({ row }: any) => {
      const date = new Date(row.original.createdAt)
      return (
        <div className="flex items-center space-x-2 text-muted-foreground whitespace-nowrap">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "user.name",
    header: "User",
    size: 220,
    cell: ({ row }: any) => {
      const user = row.original.user
      if (!user) {
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 ring-1 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary"><Shield className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">System</span>
              <span className="text-xs text-muted-foreground">Automated Action</span>
            </div>
          </div>
        )
      }
      
      const initials = user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 ring-1 ring-border">
            <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm leading-none mb-1">{user.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.role?.name?.replace('_', ' ')}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "action",
    header: "Action",
    size: 130,
    cell: ({ row }: any) => {
      const action = row.original.action
      let Icon = Activity
      let colorClass = 'bg-gray-500/10 text-gray-700 border-gray-200'
      
      if (action === 'CREATE') {
        Icon = PlusCircle
        colorClass = 'bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400'
      } else if (action === 'UPDATE') {
        Icon = Edit3
        colorClass = 'bg-blue-500/15 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400'
      } else if (action === 'DELETE') {
        Icon = Trash2
        colorClass = 'bg-rose-500/15 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400'
      }
      
      return (
        <Badge variant="outline" className={`text-[10px] font-medium tracking-wide flex items-center gap-1.5 w-fit ${colorClass}`}>
          <Icon className="h-3 w-3" />
          {action}
        </Badge>
      )
    }
  },
  {
    accessorKey: "entity",
    header: "Entity",
    size: 150,
    cell: ({ row }: any) => {
      const entity = row.original.entity
      let Icon = FileText
      if (entity === 'Case') Icon = Briefcase
      else if (entity === 'Incident') Icon = AlertTriangle
      else if (entity === 'Student') Icon = GraduationCap
      else if (entity === 'User') Icon = UserIcon

      return (
        <div className="flex items-center space-x-2 text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{entity}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }: any) => {
      try {
        const details = row.original.details ? JSON.parse(row.original.details) : null
        if (!details) return <span className="text-muted-foreground italic text-xs">No details recorded</span>
        
        const entries = Object.entries(details)
        if (entries.length === 0) return <span className="text-muted-foreground italic text-xs">No details recorded</span>

        return (
          <div className="flex flex-wrap gap-1.5 items-center">
            {entries.slice(0, 3).map(([k, v], i) => (
              <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-inset ring-muted-foreground/20">
                <span className="text-foreground/70 mr-1">{k}:</span>
                <span className="truncate max-w-[150px]">{String(v)}</span>
              </span>
            ))}
            {entries.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{entries.length - 3} more
              </span>
            )}
          </div>
        )
      } catch {
        return <span className="text-xs text-muted-foreground truncate max-w-[300px] block">{row.original.details}</span>
      }
    }
  }
]

export function ActivityTable({ logs, limit }: { logs: any[], limit: number }) {
  return (
    <DataTable
      columns={columns}
      data={logs}
      searchPlaceholder="Search logs..."
      pageSize={limit}
    />
  )
}
