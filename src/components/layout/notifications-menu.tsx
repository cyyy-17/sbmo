"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { markNotificationRead, markAllNotificationsRead } from "@/features/notifications/actions"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function NotificationsMenu({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await markNotificationRead(id)
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllNotificationsRead()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            {/* Pulse ring */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-ping opacity-75" />
          </>
        )}
        <span className="sr-only">Notifications ({unreadCount} unread)</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[420px] overflow-y-auto p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold px-1.5">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline font-medium transition-opacity hover:opacity-80"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No new notifications
          </div>
        ) : (
          <div>
            {notifications.map(notif => (
              <DropdownMenuItem key={notif.id} className="p-0 cursor-pointer focus:bg-accent rounded-none">
                <Link
                  href={notif.link || "#"}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={cn(
                    "flex flex-col items-start gap-1 w-full px-4 py-3 border-b border-border last:border-0 transition-colors",
                    !notif.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex justify-between w-full gap-2">
                    <span className={cn("text-sm font-medium leading-snug", notif.isRead && "text-muted-foreground")}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</span>
                  <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
