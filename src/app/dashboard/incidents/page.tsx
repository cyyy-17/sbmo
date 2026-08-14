import Link from "next/link"
import { getIncidents } from "@/features/incidents/actions"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IncidentsTable } from "@/components/incidents/incidents-table"
import { IncidentImportModal } from "@/components/incidents/incident-import-modal"

export default async function IncidentsPage() {
  const { incidents, total } = await getIncidents(1, 1000)

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} incident{total !== 1 ? "s" : ""} on record. Involved students auto-register into Student Directory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IncidentImportModal />
          <Link href="/dashboard/incidents/report">
            <Button className="gap-2 active:scale-[0.97] transition-transform shadow-sm">
              <Plus className="h-4 w-4" />
              Report Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-base">Incident Log</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                All reported behavioral incidents. Use sort and filters to analyze patterns.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <IncidentsTable incidents={incidents} />
        </CardContent>
      </Card>
    </div>
  )
}
