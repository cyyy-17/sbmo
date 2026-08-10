"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationsMenu } from "./notifications-menu"
import { signOut } from "next-auth/react"
import { getEntityName } from "@/lib/breadcrumb-actions"
import { useState, useEffect } from "react"

// Map path segments to display labels
const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  students: "Students",
  incidents: "Incidents",
  cases: "Cases",
  interventions: "Interventions",
  calendar: "Calendar",
  documents: "Documents",
  reports: "Reports",
  report: "Report Incident",
}

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const [uuidLabels, setUuidLabels] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchLabels = async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      const newLabels: Record<string, string> = {}
      let hasChanges = false

      for (const seg of segments) {
        if (uuidRegex.test(seg) && !uuidLabels[seg]) {
          const name = await getEntityName(seg)
          if (name) {
            newLabels[seg] = name
            hasChanges = true
          }
        }
      }

      if (hasChanges) {
        setUuidLabels((prev) => ({ ...prev, ...newLabels }))
      }
    }

    fetchLabels()
  }, [segments.join("/")])

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    let label = breadcrumbMap[seg] || uuidLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(seg)
    if (isUuid && !uuidLabels[seg]) {
      label = "Details"
    }

    const isLast = i === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav aria-label="breadcrumb" className="hidden md:flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />}
          {crumb.isLast ? (
            <span className="font-semibold text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

interface HeaderClientProps {
  userImage?: string | null
  userName?: string | null
  userEmail?: string | null
  notifications: any[]
}

export function HeaderClient({ userImage, userName, userEmail, notifications }: HeaderClientProps) {
  const router = useRouter()
  const initials = userName
    ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-30 flex h-14 lg:h-[60px] items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6">
      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs />
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Search students, cases..."
          className="h-9 w-64 rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 focus:w-80"
        />
        <kbd className="absolute right-3 hidden lg:flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Ctrl K
        </kbd>
      </div>

      {/* Notifications */}
      <NotificationsMenu initialNotifications={notifications} />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarImage src={userImage || ""} alt={userName || "User"} />
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold leading-none text-foreground">{userName || "User"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">{userEmail || ""}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuItem 
            className="px-1.5 py-1 cursor-pointer"
            onClick={() => router.push("/dashboard/settings")}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
