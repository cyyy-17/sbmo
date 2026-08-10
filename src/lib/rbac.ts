import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function hasPermission(permissionName: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false

  const userRole = session.user.role
  if (userRole === "SUPER_ADMIN") return true

  try {
    const roleWithPermissions = await prisma.role.findUnique({
      where: { name: userRole },
      include: { permissions: { include: { permission: true } } }
    })

    if (!roleWithPermissions) return false

    return roleWithPermissions.permissions.some(
      (rp: any) => rp.permission.name === permissionName
    )
  } catch (error) {
    console.error("RBAC DB Error:", error)
    // If DB is unmigrated in dev, allow access to unblock UI testing
    if (process.env.NODE_ENV === "development") {
      return true
    }
    return false
  }
}

export async function requirePermission(permissionName: string) {
  const hasPerm = await hasPermission(permissionName)
  if (!hasPerm) {
    throw new Error(`Unauthorized: Requires ${permissionName}`)
  }
}

export async function hasRecordAccess(entity: "case" | "incident" | "student", id: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false
  const userId = session.user.id
  const userRole = session.user.role

  try {
    if (entity === "case") {
      const caseRecord = await prisma.case.findUnique({
        where: { id },
        include: { incidents: true }
      })
      if (!caseRecord) return false
      
      const isAssigned = caseRecord.assignedToId === userId
      const isReporter = caseRecord.incidents.some(i => i.reporterId === userId)

      // Confidentiality checks
      if (caseRecord.confidentiality === "HIGHLY_CONFIDENTIAL") {
        return isAssigned || userRole === "SUPER_ADMIN"
      }
      
      if (caseRecord.confidentiality === "CONFIDENTIAL") {
        return isAssigned || userRole === "SUPER_ADMIN" || userRole === "SBMO_ADMIN"
      }
      
      // Standard confidentiality
      if (userRole === "SUPER_ADMIN" || userRole === "SBMO_ADMIN") return true
      if (isAssigned || isReporter) return true

      return false
    }

    if (entity === "incident") {
      const incident = await prisma.incident.findUnique({
        where: { id }
      })
      if (!incident) return false
      const isReporter = incident.reporterId === userId
      
      if (incident.confidentiality === "HIGHLY_CONFIDENTIAL") {
        return isReporter || userRole === "SUPER_ADMIN"
      }
      
      if (incident.confidentiality === "CONFIDENTIAL") {
        return isReporter || userRole === "SUPER_ADMIN" || userRole === "SBMO_ADMIN"
      }
      
      if (userRole === "SUPER_ADMIN" || userRole === "SBMO_ADMIN") return true
      if (isReporter) return true
      
      if (incident.caseId) {
        return await hasRecordAccess("case", incident.caseId)
      }
      return false
    }
    
    if (entity === "student") {
      if (userRole === "SUPER_ADMIN" || userRole === "SBMO_ADMIN") return true
      return await hasPermission("students.view")
    }

    return false
  } catch (error) {
    console.error("RBAC Record Access DB Error:", error)
    return false
  }
}

export async function requireRecordAccess(entity: "case" | "incident" | "student", id: string) {
  const hasAccess = await hasRecordAccess(entity, id)
  if (!hasAccess) {
    throw new Error(`Unauthorized: You do not have permission to access this ${entity} record.`)
  }
}
