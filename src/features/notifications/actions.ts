"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getUserNotifications() {
  const session = await auth()
  if (!session?.user?.id) return { data: null, error: "Unauthorized" }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    })
    return { data: notifications, error: null }
  } catch (_error) {
    return { data: null, error: "Failed to fetch notifications" }
  }
}

export async function markNotificationRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    await prisma.notification.update({
      where: { id, userId: session.user.id },
      data: { isRead: true }
    })
    revalidatePath("/dashboard")
    return { error: null }
  } catch (_error) {
    return { error: "Failed to mark notification read" }
  }
}

export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    })
    revalidatePath("/dashboard")
    return { error: null }
  } catch (_error) {
    return { error: "Failed to mark notifications read" }
  }
}

export async function createNotification(data: {
  userId: string
  title: string
  message: string
  link?: string
}) {
  try {
    await prisma.notification.create({ data })
    return { error: null }
  } catch (_error) {
    return { error: "Failed to create notification" }
  }
}
