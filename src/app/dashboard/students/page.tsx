import Link from "next/link"
import { getStudents } from "@/features/students/actions"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentsTable } from "@/components/students/students-table"

export default async function StudentsPage() {
  // Cap the limit to 200 to prevent massive memory payloads.
  // The system is designed to be search-first for larger databases.
  const { students, total } = await getStudents("", 1, 200)

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} student{total !== 1 ? "s" : ""} registered via incident records and imports
          </p>
        </div>
        <Link href="/dashboard/incidents/report">
          <Button className="gap-2 active:scale-[0.97] transition-transform">
            <Plus className="h-4 w-4" />
            Report Incident
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base">Student Directory</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Showing the most recent students. Use the search function to find specific records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StudentsTable students={students} />
        </CardContent>
      </Card>
    </div>
  )
}
