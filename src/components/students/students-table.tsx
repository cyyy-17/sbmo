"use client"

import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, AlertCircle, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type Student = {
  id: string
  studentId: string
  firstName: string
  lastName: string
  middleName: string | null
  email: string | null
  contactNumber: string | null
  enrollmentStatus: string | null
  enrollments: Array<{
    gradeLevel: { name: string }
    section: { name: string } | null
  }>
}

export const studentColumns: any[] = [
  {
    accessorKey: "studentId",
    header: "Student ID",
    size: 120,
    cell: ({ row }: any) => (
      <span className="font-mono text-xs font-medium text-muted-foreground">
        {row.original.studentId}
      </span>
    ),
  },
  {
    id: "name",
    header: "Full Name",
    accessorFn: (row: Student) => `${row.lastName}, ${row.firstName} ${row.middleName || ""}`,
    cell: ({ row }: any) => (
      <Link
        href={`/dashboard/students/${row.original.id}`}
        className="font-semibold text-foreground hover:text-primary hover:underline transition-colors block"
      >
        {row.original.lastName}, {row.original.firstName}
        {row.original.middleName && ` ${row.original.middleName.charAt(0)}.`}
      </Link>
    ),
  },
  {
    id: "enrollment",
    header: "Grade & Section",
    accessorFn: (row: Student) => {
      const enrollment = row.enrollments?.[0]
      return enrollment
        ? `${enrollment.gradeLevel.name} - ${enrollment.section?.name || "Unassigned"}`
        : "Not Enrolled"
    },
    cell: ({ row }: any) => {
      const enrollment = row.original.enrollments?.[0]
      if (!enrollment) {
        return <span className="text-xs text-muted-foreground italic">Not Enrolled</span>
      }
      return (
        <Badge variant="secondary" className="text-xs font-medium">
          {enrollment.gradeLevel.name} — {enrollment.section?.name || "Unassigned"}
        </Badge>
      )
    },
  },
  {
    id: "contact",
    header: "Contact Info",
    cell: ({ row }: any) => (
      <div className="flex flex-col text-xs">
        {row.original.email ? <span className="text-muted-foreground">{row.original.email}</span> : null}
        {row.original.contactNumber ? <span className="text-muted-foreground">{row.original.contactNumber}</span> : null}
        {!row.original.email && !row.original.contactNumber && <span className="text-muted-foreground italic">N/A</span>}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "enrollmentStatus",
    cell: ({ row }: any) => {
      const status = row.original.enrollmentStatus || "ACTIVE"
      return (
        <Badge 
          variant="outline" 
          className={`text-[10px] uppercase h-5 px-1.5 ${
            status === 'ACTIVE' ? 'border-green-200 text-green-700 bg-green-500/10' :
            status === 'INACTIVE' ? 'border-red-200 text-red-700 bg-red-500/10' :
            status === 'GRADUATED' ? 'border-blue-200 text-blue-700 bg-blue-500/10' :
            'border-amber-200 text-amber-700 bg-amber-500/10'
          }`}
        >
          {status.replace("_", " ")}
        </Badge>
      )
    }
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
            <Link href={`/dashboard/students/${row.original.id}`} className="flex items-center gap-2 w-full">
              <Eye className="h-3.5 w-3.5" /> View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/dashboard/incidents/report?studentId=${row.original.studentId}`} className="flex items-center gap-2 w-full text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" /> Report Incident
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function StudentsTable({ students }: { students: Student[] }) {
  return (
    <DataTable
      columns={studentColumns}
      data={students}
      searchPlaceholder="Search students by name, ID..."
      pageSize={15}
    />
  )
}
