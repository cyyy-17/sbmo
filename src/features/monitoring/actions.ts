"use server"

import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"

export async function getMonitoredStudents() {
  const canView = await hasPermission("interventions.view")
  if (!canView) return []

  const monitoredStudents = await prisma.intervention.findMany({
    take: 200,
    where: {
      status: "ACTIVE",
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          enrollments: {
            where: { schoolYear: { isActive: true } },
            include: { gradeLevel: true, section: true }
          }
        }
      },
      behaviorPlan: {
        include: {
          progressUpdates: {
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      },
      assignedTo: {
        select: {
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Filter to only those with behavior plans or specific monitoring types
  return monitoredStudents.filter(inv => inv.behaviorPlan !== null || inv.type === "MONITORING")
}
