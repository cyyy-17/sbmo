"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportIncidentsCSV } from "@/features/reports/actions"
import { useState } from "react"

export function CSVExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const csvData = await exportIncidentsCSV()
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `incidents_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download className="w-4 h-4 mr-2" />
      {loading ? "Exporting..." : "Export Incidents (CSV)"}
    </Button>
  )
}
