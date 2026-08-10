"use client"

import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Power, PowerOff, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { toggleUserStatus } from "@/features/users/actions"
import { toast } from "sonner"
import Link from "next/link"

export function UsersTable({ users, roles, currentUserId }: { users: any[], roles: any[], currentUserId: string }) {
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const handleToggleStatus = async (user: any) => {
    if (user.id === currentUserId) {
      toast.error("You cannot deactivate your own account")
      return
    }
    
    const newStatus = !user.isActive
    const result = await toggleUserStatus(user.id, newStatus)
    if (result.success) {
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } else {
      toast.error(result.error || "Failed to update user status")
    }
  }

  const columns = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/users/${row.original.id}`} className="font-semibold text-foreground hover:text-primary hover:underline transition-colors block">
            {row.original.name || "Unnamed User"}
          </Link>
          {row.original.id === currentUserId && (
            <Badge variant="secondary" className="text-[10px] uppercase h-5 px-1.5">You</Badge>
          )}
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {row.original.email}
        </span>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="text-xs">
          {row.original.role?.name?.replace("_", " ") || "No Role"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge 
          variant={row.original.isActive ? "default" : "secondary"}
          className={row.original.isActive ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : ""}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 60,
      enableSorting: false,
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/dashboard/users/${row.original.id}`} className="flex items-center gap-2 cursor-pointer w-full">
                <Shield className="h-3.5 w-3.5" /> View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/dashboard/users/${row.original.id}/edit`} className="flex items-center gap-2 cursor-pointer w-full">
                <Edit className="h-3.5 w-3.5" /> Edit User
              </Link>
            </DropdownMenuItem>
            
            {row.original.id !== currentUserId && (
              <DropdownMenuItem 
                onClick={() => handleToggleStatus(row.original)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {row.original.isActive ? (
                  <>
                    <PowerOff className="h-3.5 w-3.5 text-destructive" /> 
                    <span className="text-destructive">Deactivate</span>
                  </>
                ) : (
                  <>
                    <Power className="h-3.5 w-3.5 text-green-600" /> 
                    <span className="text-green-600">Activate</span>
                  </>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={users} searchPlaceholder="Search users..." />

    </>
  )
}
