"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { logAudit } from "@/lib/audit"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional()
})

const typeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  severityLevel: z.enum(["MINOR", "MAJOR", "CRITICAL"]),
  categoryId: z.string().min(1, "Category is required")
})

export async function getViolationCategories() {
  await requirePermission("settings.view")
  return prisma.violationCategory.findMany({
    take: 200,
    include: { types: true },
    orderBy: { name: 'asc' }
  })
}

export async function createViolationCategory(data: { name: string; description?: string }) {
  await requirePermission("settings.manage")
  const validated = categorySchema.parse(data)
  
  const category = await prisma.violationCategory.create({
    data: validated
  })
  
  await logAudit({
    action: "CREATE",
    entity: "ViolationCategory",
    entityId: category.id,
    details: { message: `Created violation category: ${category.name}` }
  })
  
  revalidatePath("/dashboard/settings/violations")
  return category
}

export async function deleteViolationCategory(id: string) {
  await requirePermission("settings.manage")
  
  await prisma.violationCategory.delete({
    where: { id }
  })
  
  await logAudit({
    action: "DELETE",
    entity: "ViolationCategory",
    entityId: id,
    details: { message: `Deleted violation category: ${id}` }
  })
  
  revalidatePath("/dashboard/settings/violations")
}

export async function createViolationType(data: { name: string; severityLevel: string; categoryId: string }) {
  await requirePermission("settings.manage")
  const validated = typeSchema.parse(data)
  
  const type = await prisma.violationType.create({
    data: validated
  })
  
  await logAudit({
    action: "CREATE",
    entity: "ViolationType",
    entityId: type.id,
    details: { message: `Created violation type: ${type.name} (${type.severityLevel})` }
  })
  
  revalidatePath("/dashboard/settings/violations")
  return type
}

export async function deleteViolationType(id: string) {
  await requirePermission("settings.manage")
  
  await prisma.violationType.delete({
    where: { id }
  })
  
  await logAudit({
    action: "DELETE",
    entity: "ViolationType",
    entityId: id,
    details: { message: `Deleted violation type: ${id}` }
  })
  
  revalidatePath("/dashboard/settings/violations")
}
