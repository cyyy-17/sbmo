"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission, requireRecordAccess } from "@/lib/rbac"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { statementSchema } from "@/lib/validations"
import { logAudit } from "@/lib/audit"

export async function getCases(page = 1, limit = 20) {
  // Use a generic view permission, or create a specific one for cases
  await requirePermission("incidents.view") 
  
  const skip = (page - 1) * limit
  
  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      skip,
      take: limit,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        _count: {
          select: { incidents: true, statements: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.case.count()
  ])

  return { cases, total, page, limit }
}

export async function getCaseDetails(id: string) {
  await requirePermission("incidents.view")
  await requireRecordAccess("case", id)
  
  const caseDetails = await prisma.case.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      incidents: {
        include: {
          reporter: { select: { name: true } },
          students: { include: { student: true } }
        }
      },
      statements: {
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          takenBy: { select: { id: true, name: true } }
        },
        orderBy: { dateTaken: 'desc' }
      },
      notes: {
        include: {
          author: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      communications: {
        include: {
          user: { select: { name: true } },
          guardian: true,
          student: { select: { firstName: true, lastName: true } }
        },
        orderBy: { contactDate: 'desc' }
      },
      conferences: {
        include: {
          organizer: { select: { name: true } },
          attendees: {
            include: {
              user: { select: { name: true } },
              student: { select: { firstName: true, lastName: true } },
              guardian: { select: { firstName: true, lastName: true, relationship: true } }
            }
          }
        },
        orderBy: { scheduledAt: 'asc' }
      },
      interventions: {
        include: {
          student: { select: { firstName: true, lastName: true } },
          assignedTo: { select: { name: true } },
          behaviorPlan: true
        },
        orderBy: { startDate: 'desc' }
      },
      documents: {
        include: {
          user: { select: { name: true } },
          template: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return caseDetails
}

export async function escalateIncidentToCase(incidentId: string) {
  await requirePermission("incidents.create")
  const session = await auth()
  
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      students: {
        include: { student: true }
      }
    }
  })
  if (!incident) throw new Error("Incident not found")
  if (incident.caseId) throw new Error("Incident is already assigned to a case")

  // Generate Reference Number (Collision-resistant)
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  const refNum = `CASE-${new Date().getFullYear()}-${randomStr}`

  const newCase = await prisma.case.create({
    data: {
      referenceNumber: refNum,
      title: `Investigation: ${incident.title}`,
      description: incident.description,
      incidents: {
        connect: { id: incidentId }
      },
      assignedToId: session?.user?.id, // Assign to the person escalating by default
    }
  })

  // Automatically migrate any initial student statements from incident to official case statements
  if (session?.user?.id && incident.students?.length > 0) {
    for (const is of incident.students) {
      if (is.statement && is.statement.trim()) {
        try {
          await prisma.statement.create({
            data: {
              caseId: newCase.id,
              incidentId: incident.id,
              studentId: is.studentId,
              statementType: "WRITTEN",
              content: is.statement.trim(),
              takenById: session.user.id
            }
          })
        } catch (e) {
          console.warn("Could not copy initial student statement to case:", e)
        }
      }
    }
  }
  
  // Update incident status
  await prisma.incident.update({
    where: { id: incidentId },
    data: { status: "UNDER_INVESTIGATION" }
  })

  await logAudit({
    action: "CREATE",
    entity: "Case",
    entityId: newCase.id,
    details: { title: newCase.title, referenceNumber: refNum, fromIncident: incidentId }
  })
  
  revalidatePath("/dashboard/incidents")
  revalidatePath("/dashboard/cases")
  return newCase
}

export async function updateCaseStatus(caseId: string, status: string) {
  await requirePermission("incidents.create")
  await requireRecordAccess("case", caseId)
  
  const updated = await prisma.case.update({
    where: { id: caseId },
    data: { status }
  })

  // Sync incident status based on case status
  let incidentStatus = undefined
  if (status === "RESOLVED" || status === "CLOSED") {
    incidentStatus = "RESOLVED"
  } else if (status === "INVESTIGATING" || status === "OPEN") {
    incidentStatus = "UNDER_INVESTIGATION"
  }

  if (incidentStatus) {
    await prisma.incident.updateMany({
      where: { caseId },
      data: { status: incidentStatus }
    })
  }
  
  await logAudit({
    action: "UPDATE",
    entity: "Case",
    entityId: caseId,
    details: { status }
  })
  
  revalidatePath(`/dashboard/cases/${caseId}`)
  revalidatePath("/dashboard/cases")
  revalidatePath("/dashboard/incidents")
  return updated
}

export async function addInvestigationNote(caseId: string, content: string) {
  await requirePermission("incidents.create")
  await requireRecordAccess("case", caseId)
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const note = await prisma.investigationNote.create({
    data: {
      caseId,
      content,
      authorId: session.user.id
    }
  })
  
  revalidatePath(`/dashboard/cases/${caseId}`)
  return note
}

export async function addStatement(data: {
  caseId: string
  incidentId?: string
  studentId?: string
  witnessName?: string
  statementType: string
  content: string
}) {
  const validatedData = statementSchema.parse(data)
  
  await requirePermission("incidents.create")
  if (validatedData.caseId) await requireRecordAccess("case", validatedData.caseId)
  if (validatedData.incidentId) await requireRecordAccess("incident", validatedData.incidentId)
  
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const statement = await prisma.statement.create({
    data: {
      caseId: validatedData.caseId,
      incidentId: validatedData.incidentId,
      studentId: validatedData.studentId,
      witnessName: validatedData.witnessName,
      statementType: validatedData.statementType,
      content: validatedData.content,
      takenById: session.user.id
    }
  })
  
  await logAudit({
    action: "CREATE",
    entity: "Statement",
    entityId: statement.id,
    details: { caseId: validatedData.caseId, type: validatedData.statementType }
  })
  
  revalidatePath(`/dashboard/cases/${validatedData.caseId}`)
  return statement
}
