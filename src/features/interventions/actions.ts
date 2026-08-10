"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"
import { requirePermission, requireRecordAccess } from "@/lib/rbac"
import { createNotification } from "@/features/notifications/actions"
import { interventionSchema } from "@/lib/validations"

export async function createIntervention(data: {
  type: string
  description: string
  startDate: Date
  endDate?: Date
  studentId: string
  caseId?: string
  assignedToId?: string
  behaviorPlan?: {
    goals: string
    strategies: string
    reviewDate?: Date
  }
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  try {
    const validatedData = interventionSchema.parse(data)
    await requirePermission("incidents.create")
    await requireRecordAccess("student", validatedData.studentId)
    if (validatedData.caseId) await requireRecordAccess("case", validatedData.caseId)
    
    const intervention = await prisma.intervention.create({
      data: {
        type: validatedData.type,
        description: validatedData.description,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        studentId: validatedData.studentId,
        caseId: validatedData.caseId,
        assignedToId: validatedData.assignedToId,
        ...(validatedData.type === "BEHAVIOR_PLAN" && validatedData.behaviorPlan ? {
          behaviorPlan: {
            create: {
              goals: validatedData.behaviorPlan.goals,
              strategies: validatedData.behaviorPlan.strategies,
              reviewDate: validatedData.behaviorPlan.reviewDate
            }
          }
        } : {})
      },
      include: {
        behaviorPlan: true,
        student: true
      }
    })

    await logAudit({
      action: "CREATE",
      entity: "Intervention",
      entityId: intervention.id,
      details: { message: `Created ${data.type} intervention for student ${data.studentId}` }
    })

    if (validatedData.assignedToId && validatedData.assignedToId !== session.user.id) {
      await createNotification({
        userId: validatedData.assignedToId,
        title: "New Intervention Assigned",
        message: `You have been assigned to monitor a ${validatedData.type.replace('_', ' ')} for ${intervention.student.firstName} ${intervention.student.lastName}.`,
        link: `/dashboard/students/${validatedData.studentId}`
      })
    }

    if (validatedData.caseId) {
      revalidatePath(`/dashboard/cases/${validatedData.caseId}`)
    }
    revalidatePath(`/dashboard/students/${validatedData.studentId}`)

    return { data: intervention, error: null }
  } catch (error: any) {
    console.error("Failed to create intervention:", error)
    return { error: "Failed to create intervention" }
  }
}

export async function getInterventionsByStudent(studentId: string) {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }
  try {
    await requireRecordAccess("student", studentId)
  } catch (error: any) {
    return { data: null, error: error.message }
  }

  try {
    const interventions = await prisma.intervention.findMany({
      where: { studentId },
      include: {
        assignedTo: { select: { name: true, email: true } },
        case: { select: { id: true, referenceNumber: true, title: true } },
        behaviorPlan: {
          include: {
            progressUpdates: {
              include: { author: { select: { name: true } } },
              orderBy: { date: 'desc' }
            }
          }
        }
      },
      orderBy: { startDate: "desc" }
    })
    return { data: interventions, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch interventions" }
  }
}

export async function getInterventionsByCase(caseId: string) {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }
  try {
    await requireRecordAccess("case", caseId)
  } catch (error: any) {
    return { data: null, error: error.message }
  }

  try {
    const interventions = await prisma.intervention.findMany({
      where: { caseId },
      include: {
        assignedTo: { select: { name: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
        behaviorPlan: {
          include: {
            progressUpdates: {
              include: { author: { select: { name: true } } },
              orderBy: { date: 'desc' }
            }
          }
        }
      },
      orderBy: { startDate: "desc" }
    })
    return { data: interventions, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch interventions" }
  }
}

export async function addBehaviorProgress(data: {
  behaviorPlanId: string
  notes: string
  rating?: number
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  try {
    await requirePermission("incidents.create")
  } catch (error: any) {
    return { error: error.message }
  }

  try {
    const progress = await prisma.behaviorProgress.create({
      data: {
        behaviorPlanId: data.behaviorPlanId,
        notes: data.notes,
        rating: data.rating,
        authorId: session.user.id
      },
      include: {
        behaviorPlan: {
          include: { intervention: true }
        }
      }
    })

    await logAudit({
      action: "CREATE",
      entity: "BehaviorProgress",
      entityId: progress.id,
      details: { message: `Logged progress for behavior plan ${data.behaviorPlanId}` }
    })

    const { studentId, caseId } = progress.behaviorPlan.intervention
    revalidatePath(`/dashboard/students/${studentId}`)
    if (caseId) revalidatePath(`/dashboard/cases/${caseId}`)

    return { data: progress, error: null }
  } catch (error) {
    console.error("Failed to add behavior progress:", error)
    return { error: "Failed to add behavior progress" }
  }
}

export async function getAllInterventions() {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }
  try {
    await requirePermission("incidents.view")
  } catch (error: any) {
    return { data: null, error: error.message }
  }

  try {
    const interventions = await prisma.intervention.findMany({
      take: 200,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
        assignedTo: { select: { name: true, email: true } },
        case: { select: { id: true, referenceNumber: true, title: true } },
        behaviorPlan: true
      },
      orderBy: { startDate: "desc" }
    })
    return { data: interventions, error: null }
  } catch (error) {
    console.error("Failed to fetch interventions:", error)
    return { data: null, error: "Failed to fetch interventions" }
  }
}

export async function updateInterventionStatus(id: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  try {
    await requirePermission("incidents.create")
  } catch (error: any) {
    return { error: error.message }
  }

  try {
    const intervention = await prisma.intervention.update({
      where: { id },
      data: { status }
    })

    revalidatePath(`/dashboard/students/${intervention.studentId}`)
    if (intervention.caseId) {
      revalidatePath(`/dashboard/cases/${intervention.caseId}`)
    }

    return { error: null }
  } catch (error) {
    return { error: "Failed to update intervention status" }
  }
}
