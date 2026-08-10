"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { requirePermission } from "@/lib/rbac"
import { logAudit } from "@/lib/audit"

export async function getReportStats() {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }

  try {
    // We run multiple aggregations in parallel to build the dashboard
    const [
      incidentsRaw,
      casesByStatusRaw,
      interventionsByTypeRaw
    ] = await Promise.all([
      // Fetch recent incidents to group them by month
      prisma.incident.findMany({
        take: 10000,
        where: {
          dateOfIncident: {
            gte: new Date(new Date().getFullYear(), 0, 1) // From start of year
          }
        },
        select: { dateOfIncident: true, severity: true }
      }),
      
      // Cases by status
      prisma.case.groupBy({
        by: ['status'],
        _count: { id: true }
      }),

      // Interventions by type
      prisma.intervention.groupBy({
        by: ['type'],
        _count: { id: true }
      })
    ])

    // Process Incidents Over Time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const incidentsByMonth: Record<string, { name: string, total: number, critical: number }> = {}
    
    // Initialize months
    months.forEach(m => {
      incidentsByMonth[m] = { name: m, total: 0, critical: 0 }
    })

    incidentsRaw.forEach(inc => {
      const monthName = months[inc.dateOfIncident.getMonth()]
      if (incidentsByMonth[monthName]) {
        incidentsByMonth[monthName].total += 1
        if (inc.severity === 'CRITICAL' || inc.severity === 'MAJOR') {
          incidentsByMonth[monthName].critical += 1
        }
      }
    })

    const incidentsData = Object.values(incidentsByMonth)

    // Process Cases by Status
    const casesData = casesByStatusRaw.map(c => ({
      name: c.status,
      value: c._count.id,
      fill: c.status === 'OPEN' ? '#ef4444' :
            c.status === 'INVESTIGATING' ? '#f59e0b' :
            c.status === 'RESOLVED' ? '#22c55e' : '#94a3b8'
    }))

    // Process Interventions by Type
    const interventionsData = interventionsByTypeRaw.map(i => ({
      name: i.type.replace('_', ' '),
      total: i._count.id
    }))

    return { 
      data: {
        incidentsOverTime: incidentsData,
        casesByStatus: casesData,
        interventionsByType: interventionsData
      }, 
      error: null 
    }
  } catch (error) {
    return { data: null, error: "Failed to fetch report stats" }
  }
}

export async function exportIncidentsCSV() {
  await requirePermission("incidents.view")
  
  const incidents = await prisma.incident.findMany({
    take: 5000,
    include: {
      reporter: { select: { name: true } }
    },
    orderBy: { dateOfIncident: 'desc' }
  })

  // Basic CSV Generation
  const headers = ['ID', 'Reference', 'Title', 'Date', 'Severity', 'Status', 'Reporter']
  const rows = incidents.map(i => [
    i.id,
    i.referenceNumber,
    `"${i.title.replace(/"/g, '""')}"`, // escape quotes
    new Date(i.dateOfIncident).toISOString(),
    i.severity,
    i.status,
    `"${i.reporter.name || ''}"`
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  
  await logAudit({
    action: "EXPORT",
    entity: "Incident",
    entityId: "BULK",
    details: { message: "Exported Incidents to CSV" }
  })

  return csvContent
}
