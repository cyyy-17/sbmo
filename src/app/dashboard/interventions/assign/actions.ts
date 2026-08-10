"use server"

import { createIntervention } from "@/features/interventions/actions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export async function submitAssignIntervention(
  prevState: any,
  formData: FormData,
) {
  try {
    const type = formData.get("type") as string
    const description = formData.get("description") as string
    const startDate = new Date(formData.get("startDate") as string)
    const endDateStr = formData.get("endDate") as string
    const endDate = endDateStr ? new Date(endDateStr) : undefined
    const caseIdStr = formData.get("caseId") as string
    const caseId = caseIdStr || undefined
    const assignedToIdStr = formData.get("assignedToId") as string
    const assignedToId = assignedToIdStr || undefined
    
    // Check if the student ID given is the internal ID or the system ID (e.g., E08102026)
    const studentIdInput = formData.get("studentId") as string
    
    let finalStudentId = studentIdInput
    // Let's resolve the system student ID to the internal UUID if necessary
    const student = await prisma.student.findUnique({
      where: { id: studentIdInput }
    })
    
    if (!student) {
      const studentBySystemId = await prisma.student.findUnique({
        where: { studentId: studentIdInput }
      })
      if (!studentBySystemId) {
        return { error: "Student not found with the provided ID." }
      }
      finalStudentId = studentBySystemId.id
    }

    let behaviorPlan = undefined
    if (type === "BEHAVIOR_PLAN") {
      const goals = formData.get("goals") as string
      const strategies = formData.get("strategies") as string
      const reviewDateStr = formData.get("reviewDate") as string
      
      if (!goals || !strategies) {
        return { error: "Goals and strategies are required for behavior plans." }
      }
      
      behaviorPlan = {
        goals,
        strategies,
        reviewDate: reviewDateStr ? new Date(reviewDateStr) : undefined
      }
    }

    const result = await createIntervention({
      type,
      description,
      startDate,
      endDate,
      studentId: finalStudentId,
      caseId,
      assignedToId,
      behaviorPlan
    })

    if (result.error) {
      return { error: result.error }
    }

  } catch (error: any) {
    console.error("Error submitting intervention:", error)
    return { error: error.message || "Failed to assign intervention." }
  }
  
  redirect("/dashboard/interventions")
}
