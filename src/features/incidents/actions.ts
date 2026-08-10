"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission, requireRecordAccess } from "@/lib/rbac"
import { logAudit } from "@/lib/audit"
import { auth } from "@/auth"
import { incidentSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getIncidents(page = 1, limit = 20) {
  await requirePermission("incidents.view")
  
  const skip = (page - 1) * limit
  
  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        students: {
          include: { student: true }
        }
      },
      orderBy: { dateOfIncident: 'desc' }
    }),
    prisma.incident.count()
  ])

  return { incidents, total, page, limit }
}

export async function createIncident(data: {
  title: string
  description: string
  dateOfIncident: Date
  location?: string
  severity: string
  confidentiality?: string
  involvedStudents: { studentId: string; involvementType: string; statement?: string }[]
}) {
  await requirePermission("incidents.create")
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validatedData = incidentSchema.parse(data)

  // Generate Reference Number (Collision-resistant)
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  const refNum = `INC-${new Date().getFullYear()}-${randomStr}`

  const incident = await prisma.incident.create({
    data: {
      referenceNumber: refNum,
      title: validatedData.title,
      description: validatedData.description,
      dateOfIncident: validatedData.dateOfIncident,
      location: validatedData.location,
      severity: validatedData.severity,
      confidentiality: validatedData.confidentiality || "STANDARD",
      reporterId: session.user.id,
      students: {
        create: validatedData.involvedStudents.map(student => ({
          studentId: student.studentId,
          involvementType: student.involvementType,
          statement: student.statement
        }))
      }
    }
  })
  
  await logAudit({
    action: "CREATE",
    entity: "Incident",
    entityId: incident.id,
    details: { title: validatedData.title, referenceNumber: refNum }
  })
  
  revalidatePath("/dashboard/incidents")
  return incident
}

export async function checkRepeatBehavior(studentId: string) {
  await requirePermission("incidents.view")
  await requireRecordAccess("student", studentId)

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const recentIncidents = await prisma.incidentStudent.count({
    where: {
      studentId: studentId,
      incident: {
        dateOfIncident: { gte: ninetyDaysAgo }
      }
    }
  })

  const activeCases = await prisma.case.count({
    where: {
      status: { in: ['OPEN', 'INVESTIGATING'] },
      incidents: {
        some: {
          students: {
            some: { studentId: studentId }
          }
        }
      }
    }
  })

  return { recentIncidents, activeCases }
}
