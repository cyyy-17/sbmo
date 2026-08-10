import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "VIEW"

interface LogAuditParams {
  action: AuditAction
  entity: string
  entityId?: string
  details?: Record<string, any>
}

export async function logAudit({ action, entity, entityId, details }: LogAuditParams) {
  try {
    const session = await auth()
    const userId = session?.user?.id || "SYSTEM"

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : undefined,
      }
    })
  } catch (error) {
    console.error("Failed to log audit event:", error)
  }
}

export async function getAuditLogs(page = 1, limit = 50) {
  const session = await auth()
  // Only Super Admins or SBMO Admins should see the full activity log
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized to view activity logs")
  }

  const skip = (page - 1) * limit
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: { select: { name: true } } } }
      }
    }),
    prisma.auditLog.count()
  ])

  return { logs, total, page, limit }
}

