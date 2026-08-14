"use server"

import { auth, unstable_update } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { name: string; email: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }



  try {
    // Check if email is already taken by another user
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing && existing.id !== session.user.id) {
      return { success: false, error: "Email is already in use by another account." }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
      },
    })

    await logAudit({
      action: "UPDATE",
      entity: "User",
      entityId: session.user.id,
      details: { message: "User updated their profile information" },
    })

    // Update the JWT session so the HeaderClient reflects the new name/email immediately
    await unstable_update({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
      }
    })

    revalidatePath("/dashboard")
    return { success: true, data: updatedUser }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile. Please try again." }
  }
}

export async function updatePassword(data: { currentPassword?: string; newPassword: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }



  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Verify current password if user has one
    if (user.password && data.currentPassword) {
      const isPasswordValid = await bcryptjs.compare(data.currentPassword, user.password)
      if (!isPasswordValid) {
        return { success: false, error: "Current password is incorrect." }
      }
    } else if (user.password && !data.currentPassword) {
      return { success: false, error: "Current password is required." }
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(data.newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    await logAudit({
      action: "UPDATE",
      entity: "User",
      entityId: session.user.id,
      details: { message: "User updated their password" },
    })

    return { success: true, requireLogout: true }
  } catch (error) {
    console.error("Error updating password:", error)
    return { success: false, error: "Failed to update password. Please try again." }
  }
}

// -----------------------------------------------------------------------------
// USER MANAGEMENT (SUPER_ADMIN ONLY)
// -----------------------------------------------------------------------------

function checkAdminAccess(session: any) {
  if (!session?.user?.id) return false
  const role = session.user.role
  return !role || role === "SUPER_ADMIN" || role === "SBMO_ADMIN" || role === "ADMIN" || role === "PRINCIPAL"
}

export async function getUsers() {
  const session = await auth()
  if (!checkAdminAccess(session)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const users = await prisma.user.findMany({
      take: 200,
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function getUserById(id: string) {
  const session = await auth()
  if (!checkAdminAccess(session)) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    })
    return user
  } catch (error) {
    console.error("Error fetching user by id:", error)
    return null
  }
}

export async function getRoles() {
  const session = await auth()
  if (!checkAdminAccess(session)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const roles = await prisma.role.findMany()
    return { success: true, data: roles }
  } catch (error) {
    console.error("Error fetching roles:", error)
    return { success: false, error: "Failed to fetch roles" }
  }
}

export async function createUser(data: {
  email: string
  roleId: string
  password?: string
  firstName?: string
  lastName?: string
  middleName?: string
  suffix?: string
  preferredName?: string
  dateOfBirth?: Date | null
  gender?: string
  address?: string
  contactNumber?: string
  employmentStatus?: string
}) {
  const session = await auth()
  if (!checkAdminAccess(session)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existing) {
      return { success: false, error: "Email is already in use." }
    }

    const hashedPassword = data.password 
      ? await bcryptjs.hash(data.password, 10)
      : null

    const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Unnamed User"

    const user = await prisma.user.create({
      data: {
        name,
        email: data.email,
        roleId: data.roleId,
        password: hashedPassword,
        isActive: true,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        suffix: data.suffix,
        preferredName: data.preferredName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        contactNumber: data.contactNumber,
        employmentStatus: data.employmentStatus || "ACTIVE",
      }
    })

    await logAudit({
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      details: { message: `Super Admin created user ${user.email}` },
    })

    revalidatePath("/dashboard/users")
    return { success: true, data: user }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function updateUser(id: string, data: {
  email: string
  roleId: string
  password?: string
  firstName?: string
  lastName?: string
  middleName?: string
  suffix?: string
  preferredName?: string
  dateOfBirth?: Date | null
  gender?: string
  address?: string
  contactNumber?: string
  employmentStatus?: string
}) {
  const session = await auth()
  if (!checkAdminAccess(session)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existing && existing.id !== id) {
      return { success: false, error: "Email is already in use by another account." }
    }

    const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || undefined

    const updateData: any = {
      email: data.email,
      roleId: data.roleId,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      suffix: data.suffix,
      preferredName: data.preferredName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      contactNumber: data.contactNumber,
      employmentStatus: data.employmentStatus,
    }

    if (name) {
      updateData.name = name
    }

    if (data.password) {
      updateData.password = await bcryptjs.hash(data.password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    await logAudit({
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: { message: `Admin updated user ${user.email}` },
    })

    revalidatePath("/dashboard/users")
    return { success: true, data: user }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  const session = await auth()
  if (!checkAdminAccess(session) || !session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  if (session.user.id === id) {
    return { success: false, error: "You cannot deactivate your own account." }
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive }
    })

    await logAudit({
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: { message: `Admin ${isActive ? "activated" : "deactivated"} user ${user.email}` },
    })

    revalidatePath("/dashboard/users")
    return { success: true, data: user }
  } catch (error) {
    console.error("Error toggling user status:", error)
    return { success: false, error: "Failed to update user status" }
  }
}
