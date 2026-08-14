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
    if (!session?.user?.id) {
      return { error: "Unauthorized. Please sign in." }
    }

    const title = formData.get("title") as string
    const dateOfIncident = formData.get("dateOfIncident") as string
    const location = formData.get("location") as string
    const severity = formData.get("severity") as string
    const description = formData.get("description") as string
    const confidentiality = (formData.get("confidentiality") as string) || "STANDARD"
    
    // Student Details
    const studentId = (formData.get("studentId") as string)?.trim()
    const firstName = (formData.get("firstName") as string)?.trim()
    const lastName = (formData.get("lastName") as string)?.trim()
    const middleName = (formData.get("middleName") as string)?.trim()
    const suffix = (formData.get("suffix") as string)?.trim()
    const gender = (formData.get("gender") as string)?.trim()
    const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim()
    const contactNumber = (formData.get("contactNumber") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const address = (formData.get("address") as string)?.trim()
    const gradeLevel = (formData.get("gradeLevel") as string)?.trim()
    const section = (formData.get("section") as string)?.trim()
    const involvementType = (formData.get("involvementType") as string) || "OFFENDER"
    const statement = (formData.get("statement") as string)?.trim()

    if (!title || title.trim().length < 3) {
      return { error: "Please enter a descriptive incident title (min 3 characters)." }
    }
    if (!description || description.trim().length < 5) {
      return { error: "Please enter a detailed description of the incident." }
    }
    if (!studentId) {
      return { error: "Student ID or LRN is required." }
    }

    // Handle Evidence upload if provided
    const file = formData.get("evidence") as File | null
    let evidenceData: { name: string; fileUrl: string; fileType: string; uploadedById: string } | null = null

    if (file && file.size > 0 && session?.user?.id) {
      if (file.size > 10 * 1024 * 1024) {
        return { error: "File size exceeds 10MB limit." }
      }

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

    // Auto-registers or updates student, and creates the incident
    const created = await createIncident({
      title,
      description,
      dateOfIncident: dateOfIncident ? new Date(dateOfIncident) : new Date(),
      location: location || undefined,
      severity,
      confidentiality,
      involvedStudents: [
        {
          studentId,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          middleName: middleName || undefined,
          suffix: suffix || undefined,
          gender: gender || undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          contactNumber: contactNumber || undefined,
          email: email || undefined,
          address: address || undefined,
          gradeLevel: gradeLevel || undefined,
          section: section || undefined,
          involvementType,
          statement: statement || undefined
        }
      ]
    })
    
    // Attach evidence if present
    if (evidenceData && created?.id) {
      await prisma.evidence.create({
        data: {
          ...evidenceData,
          incidentId: created.id
        }
      })
    }
    
  } catch (error: any) {
    console.error("Error creating incident with student:", error)
    return { error: error.message || "Failed to submit incident report." }
  }
  
  redirect("/dashboard/incidents")
}
