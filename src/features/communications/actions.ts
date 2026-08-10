"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function logCommunication(data: {
  type: string
  notes: string
  studentId: string
  caseId?: string
  guardianId?: string
  status?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const log = await prisma.communicationLog.create({
      data: {
        type: data.type,
        notes: data.notes,
        status: data.status || "COMPLETED",
        studentId: data.studentId,
        caseId: data.caseId,
        guardianId: data.guardianId,
        userId: session.user.id
      }
    })

    await logAudit({
      action: "CREATE",
      entity: "CommunicationLog",
      entityId: log.id,
      details: { message: `Logged communication for student ${data.studentId}` }
    })

    if (data.caseId) {
      revalidatePath(`/dashboard/cases/${data.caseId}`)
    }
    revalidatePath(`/dashboard/students/${data.studentId}`)
    
    return { data: log, error: null }
  } catch (error: any) {
    console.error("Failed to log communication:", error)
    return { error: "Failed to log communication" }
  }
}

export async function getCommunicationsByCase(caseId: string) {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }

  try {
    const comms = await prisma.communicationLog.findMany({
      where: { caseId },
      include: {
        user: { select: { name: true, email: true } },
        guardian: true,
        student: { select: { firstName: true, lastName: true } }
      },
      orderBy: { contactDate: "desc" }
    })
    return { data: comms, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch communications" }
  }
}
