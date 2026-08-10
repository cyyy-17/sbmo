"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"

export async function getDashboardStats() {
  const canView = await hasPermission("students.view")
  if (!canView) {
    return {
      totalStudents: 0,
      activeCases: 0,
      newIncidents: 0,
      activeInterventions: 0
    }
  }

  const [
    totalStudents,
    activeCases,
    newIncidents,
    activeInterventions
  ] = await Promise.all([
    prisma.student.count({ where: { isArchived: false } }),
    prisma.case.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
    // Count incidents from the last 7 days
    prisma.incident.count({ 
      where: { 
        dateOfIncident: { 
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      } 
    }),
    prisma.intervention.count({ where: { status: 'ACTIVE' } })
  ])

  return {
    totalStudents,
    activeCases,
    newIncidents,
    activeInterventions
  }
}

export async function getSmartInsights() {
  const canView = await hasPermission("analytics.view")
  if (!canView) {
    return [
      { text: "Analytics insights are restricted to authorized personnel.", type: "neutral" }
    ]
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  // Incident trend
  const last30Incidents = await prisma.incident.count({ where: { dateOfIncident: { gte: thirtyDaysAgo } } })
  const prev30Incidents = await prisma.incident.count({ where: { dateOfIncident: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
  
  let incidentTrend = "Stable"
  let incidentTrendClass = "neutral"
  if (last30Incidents > prev30Incidents * 1.1) {
    incidentTrend = `Incidents increased by ${Math.round(((last30Incidents - prev30Incidents) / prev30Incidents) * 100)}% this month.`
    incidentTrendClass = "negative"
  } else if (last30Incidents < prev30Incidents * 0.9 && prev30Incidents > 0) {
    incidentTrend = `Incidents decreased by ${Math.round(((prev30Incidents - last30Incidents) / prev30Incidents) * 100)}% this month.`
    incidentTrendClass = "positive"
  } else {
    incidentTrend = `Incident volume is stable compared to last month.`
  }

  // Active Monitoring
  const monitored = await prisma.intervention.count({ where: { status: 'ACTIVE', OR: [{ type: 'MONITORING' }, { behaviorPlan: { isNot: null } }] } })
  
  // Unassigned Cases
  const unassignedCases = await prisma.case.count({ where: { status: 'OPEN', assignedToId: null } })

  return [
    { text: incidentTrend, type: incidentTrendClass },
    { text: `${monitored} students are currently under active behavioral monitoring.`, type: 'info' },
    { text: unassignedCases > 0 ? `${unassignedCases} new cases require officer assignment.` : 'All active cases have been assigned to officers.', type: unassignedCases > 0 ? 'warning' : 'positive' }
  ]
}
