"use server"

import { createIncident } from "@/features/incidents/actions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"
import { auth } from "@/auth"

export async function submitIncidentReport(
  prevState: any,
  formData: FormData,
) {
  try {
    const session = await auth()
    const title = formData.get("title") as string
    const dateOfIncident = new Date(formData.get("dateOfIncident") as string)
    const location = formData.get("location") as string
    const severity = formData.get("severity") as string
    const description = formData.get("description") as string
    const confidentiality = formData.get("confidentiality") as string
    
    const studentIdStr = formData.get("studentId") as string
    const involvementType = formData.get("involvementType") as string

    // Handle Evidence
    const file = formData.get("evidence") as File | null
    let evidenceData: { name: string; fileUrl: string; fileType: string; uploadedById: string } | null = null

    if (file && file.size > 0 && session?.user?.id) {
      // Security: Validate file size (e.g. 10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return { error: "File size exceeds 10MB limit." }
      }

      // Security: Validate file type
      const allowedTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf", "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "video/mp4", "video/webm"
      ]
      
      if (!allowedTypes.includes(file.type)) {
        return { error: "Invalid file type. Only standard images, documents, and videos are allowed." }
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      // Ensure extension is preserved safely and filename has no directory traversal characters
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100)
      const filename = `${uniqueSuffix}-${safeName}`
      const path = join(uploadDir, filename)

      await writeFile(path, buffer)
      
      evidenceData = {
        name: file.name,
        fileUrl: `/uploads/${filename}`,
        fileType: file.type.includes('image') ? 'IMAGE' : file.type.includes('video') ? 'VIDEO' : 'DOCUMENT',
        uploadedById: session.user.id
      }
    }

    // Validate if the student exists
    const student = await prisma.student.findUnique({
      where: { id: studentIdStr }
    })
    
    let finalStudentId = student?.id
    if (!finalStudentId) {
      const studentBySystemId = await prisma.student.findUnique({
        where: { studentId: studentIdStr }
      })
      if (!studentBySystemId) {
        return { error: "Student not found with the provided ID." }
      }
      finalStudentId = studentBySystemId.id
    }

    const incidentData: any = {
      title,
      description,
      dateOfIncident,
      location,
      severity,
      confidentiality,
      involvedStudents: [
        {
          studentId: finalStudentId,
          involvementType,
        }
      ]
    }

    const created = await createIncident(incidentData)
    
    // Attach evidence if present
    if (evidenceData) {
      await prisma.evidence.create({
        data: {
          ...evidenceData,
          incidentId: created.id
        }
      })
    }
    
  } catch (error: any) {
    console.error(error)
    return { error: error.message || "Failed to submit incident report." }
  }
  
  redirect("/dashboard/incidents")
}
