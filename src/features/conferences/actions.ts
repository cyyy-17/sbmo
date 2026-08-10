"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"
import { createNotification } from "@/features/notifications/actions"

export async function scheduleConference(data: {
  scheduledAt: Date
  studentId: string
  caseId?: string
  attendees: Array<{
    type: string
    studentId?: string
    guardianId?: string
    userId?: string
    externalName?: string
  }>
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const conf = await prisma.conference.create({
      data: {
        scheduledAt: data.scheduledAt,
        studentId: data.studentId,
        caseId: data.caseId,
        organizerId: session.user.id,
        attendees: {
          create: data.attendees.map(a => ({
            attendeeType: a.type,
            studentId: a.studentId,
            guardianId: a.guardianId,
            userId: a.userId,
            externalName: a.externalName
          }))
        }
      },
      include: {
        attendees: true
      }
    })

    await logAudit({
      action: "CREATE",
      entity: "Conference",
      entityId: conf.id,
      details: { message: `Scheduled conference for student ${data.studentId}` }
    })

    // Notify internal users who are attendees
    for (const attendee of conf.attendees) {
      if (attendee.userId && attendee.userId !== session.user.id) {
        await createNotification({
          userId: attendee.userId,
          title: "New Conference Scheduled",
          message: `You have been added to a conference scheduled for ${new Date(conf.scheduledAt).toLocaleDateString()}`,
          link: data.caseId ? `/dashboard/cases/${data.caseId}` : undefined
        })
      }
    }

    if (data.caseId) {
      revalidatePath(`/dashboard/cases/${data.caseId}`)
    }
    revalidatePath(`/dashboard/students/${data.studentId}`)

    return { data: conf, error: null }
  } catch (error: any) {
    console.error("Failed to schedule conference:", error)
    return { error: "Failed to schedule conference" }
  }
}

export async function getConferencesByCase(caseId: string) {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }

  try {
    const conferences = await prisma.conference.findMany({
      where: { caseId },
      include: {
        organizer: { select: { name: true, email: true } },
        attendees: {
          include: {
            user: { select: { name: true } },
            student: { select: { firstName: true, lastName: true } },
            guardian: { select: { firstName: true, lastName: true, relationship: true } }
          }
        }
      },
      orderBy: { scheduledAt: "asc" }
    })
    return { data: conferences, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch conferences" }
  }
}

export async function updateConferenceStatus(id: string, status: string, notes?: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const conf = await prisma.conference.update({
      where: { id },
      data: {
        status,
        ...(notes ? { resolutionNotes: notes } : {})
      }
    })

    if (conf.caseId) {
      revalidatePath(`/dashboard/cases/${conf.caseId}`)
    }
    return { error: null }
  } catch (error) {
    return { error: "Failed to update conference" }
  }
}

export async function getAllConferences() {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }

  try {
    const conferences = await prisma.conference.findMany({
      take: 200,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        case: { select: { id: true, referenceNumber: true, title: true } },
        organizer: { select: { name: true } },
        attendees: {
          include: {
            user: { select: { name: true } },
            student: { select: { firstName: true, lastName: true } },
            guardian: { select: { firstName: true, lastName: true, relationship: true } }
          }
        }
      },
      orderBy: { scheduledAt: "asc" }
    })
    return { data: conferences, error: null }
  } catch (error) {
    console.error("Failed to fetch all conferences", error)
    return { data: null, error: "Failed to fetch conferences" }
  }
}
