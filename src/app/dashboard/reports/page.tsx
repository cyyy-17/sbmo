import { getReportStats } from "@/features/reports/actions"
import { CSVExportButton } from "@/components/reports/csv-export-button"
import { ReportsCharts } from "@/components/reports/reports-charts"

export default async function ReportsDashboardPage() {
  const { data: stats, error } = await getReportStats()

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-8">
        <div className="text-destructive font-semibold mb-2">Failed to load reports</div>
        <p className="text-sm text-muted-foreground">Please try again later or contact support.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor system metrics, analyze trends, and export data.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CSVExportButton />
        </div>
      </div>

      {/* Animated Charts (Client Component) */}
      <ReportsCharts stats={stats} />
    </div>
  )
}
