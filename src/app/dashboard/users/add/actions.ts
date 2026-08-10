"use server"

import { createUser } from "@/features/users/actions"
import { redirect } from "next/navigation"

export async function submitAddUser(
  prevState: any,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string
    const roleId = formData.get("roleId") as string
    const password = formData.get("password") as string
    
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const middleName = formData.get("middleName") as string
    const suffix = formData.get("suffix") as string
    const preferredName = formData.get("preferredName") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const gender = formData.get("gender") as string
    const address = formData.get("address") as string
    const contactNumber = formData.get("contactNumber") as string
    const employmentStatus = formData.get("employmentStatus") as string || "ACTIVE"

    const result = await createUser({
      email,
      roleId,
      password: password || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      middleName: middleName || undefined,
      suffix: suffix || undefined,
      preferredName: preferredName || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      address: address || undefined,
      contactNumber: contactNumber || undefined,
      employmentStatus,
    })

    if (!result.success) {
      return { error: result.error }
    }

  } catch (error: any) {
    console.error("Error creating user:", error)
    return { error: error.message || "Failed to create user." }
  }

  // Redirect on success
  redirect("/dashboard/users")
}
