"use server"

import { createStudent } from "@/features/students/actions"
import { redirect } from "next/navigation"

export async function submitAddStudent(
  prevState: any,
  formData: FormData,
) {
  try {
    const studentId = formData.get("studentId") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const middleName = formData.get("middleName") as string
    const suffix = formData.get("suffix") as string
    const preferredName = formData.get("preferredName") as string
    const email = formData.get("email") as string
    const contactNumber = formData.get("contactNumber") as string
    const address = formData.get("address") as string
    const gender = formData.get("gender") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const enrollmentStatus = formData.get("enrollmentStatus") as string || "ACTIVE"
    
    // For now, we will default schoolId to a dummy or fetch the first one.
    // In a real app, this might be tied to the current user's school.
    // Since createStudent requires a schoolId, we will just fetch the first available school.
    const { prisma } = await import("@/lib/prisma")
    let school = await prisma.school.findFirst()
    
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: "Default School",
          address: "123 Main St",
          phone: "555-0123"
        }
      })
    }

    await createStudent({
      studentId,
      firstName,
      lastName,
      middleName: middleName || undefined,
      suffix: suffix || undefined,
      preferredName: preferredName || undefined,
      email: email || undefined,
      contactNumber: contactNumber || undefined,
      address: address || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      enrollmentStatus: enrollmentStatus,
      schoolId: school.id,
    })

  } catch (error: any) {
    console.error("Error creating student:", error)
    return { error: error.message || "Failed to create student." }
  }

  // Redirect on success
  redirect("/dashboard/students")
}
