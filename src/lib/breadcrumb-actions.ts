"use server"

import { prisma } from "@/lib/prisma"

export async function getEntityName(id: string): Promise<string | null> {
  // Check User
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true }
  })
  if (user && user.name) return user.name

  // Check Student
  const student = await prisma.student.findUnique({
    where: { id },
    select: { firstName: true, lastName: true }
  })
  if (student) return `${student.firstName} ${student.lastName}`

  // Check Incident
  const incident = await prisma.incident.findUnique({
    where: { id },
    select: { title: true }
  })
  if (incident) return incident.title

  // Check Case
  const caseEntity = await prisma.case.findUnique({
    where: { id },
    select: { title: true }
  })
  if (caseEntity) return caseEntity.title

  return null
}
