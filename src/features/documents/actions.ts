"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { requirePermission } from "@/lib/rbac"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function getDocumentTemplates() {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }

  try {
    const templates = await prisma.documentTemplate.findMany({
      take: 200,
      orderBy: { name: 'asc' }
    })
    return { data: templates, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch templates" }
  }
}

export async function createDocumentTemplate(data: { name: string, type: string, content: string }) {
  await requirePermission("documents.manage")
  
  try {
    const template = await prisma.documentTemplate.create({ data })
    revalidatePath("/dashboard/documents")
    return { data: template, error: null }
  } catch (error) {
    return { data: null, error: "Failed to create template" }
  }
}

export async function generateDocument(data: {
  templateId: string
  title: string
  caseId?: string
  studentId?: string
  incidentId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const template = await prisma.documentTemplate.findUnique({
      where: { id: data.templateId }
    })

    if (!template) return { error: "Template not found" }

    let content = template.content

    // Very basic templating logic (MVP)
    if (data.studentId) {
      const student = await prisma.student.findUnique({ where: { id: data.studentId }})
      if (student) {
        content = content.replace(/{{studentName}}/g, `${student.firstName} ${student.lastName}`)
        content = content.replace(/{{studentId}}/g, student.studentId)
      }
    }

    if (data.caseId) {
      const caseData = await prisma.case.findUnique({ where: { id: data.caseId }})
      if (caseData) {
        content = content.replace(/{{caseReference}}/g, caseData.referenceNumber)
      }
    }

    const document = await prisma.document.create({
      data: {
        title: data.title,
        content,
        templateId: data.templateId,
        caseId: data.caseId,
        studentId: data.studentId,
        incidentId: data.incidentId,
        createdBy: session.user.id
      }
    })

    await logAudit({
      action: "CREATE",
      entity: "Document",
      entityId: document.id,
      details: { message: `Generated document: ${data.title}` }
    })

    if (data.caseId) revalidatePath(`/dashboard/cases/${data.caseId}`)
    if (data.studentId) revalidatePath(`/dashboard/students/${data.studentId}`)
    revalidatePath("/dashboard/documents")

    return { data: document, error: null }
  } catch (error) {
    console.error("Failed to generate document:", error)
    return { error: "Failed to generate document" }
  }
}

export async function getDocumentsForEntity(entityId: string, type: 'CASE' | 'STUDENT' | 'INCIDENT') {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }

  const where = type === 'CASE' ? { caseId: entityId } 
              : type === 'STUDENT' ? { studentId: entityId }
              : { incidentId: entityId }

  try {
    const documents = await prisma.document.findMany({
      take: 100,
      where,
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { data: documents, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch documents" }
  }
}

export async function getAllDocuments() {
  const session = await auth()
  if (!session?.user) return { data: null, error: "Unauthorized" }

  try {
    const documents = await prisma.document.findMany({
      include: {
        user: { select: { name: true } },
        student: { select: { firstName: true, lastName: true } },
        case: { select: { referenceNumber: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit for MVP
    })
    return { data: documents, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch documents" }
  }
}
