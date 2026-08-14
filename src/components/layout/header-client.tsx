"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Search, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationsMenu } from "./notifications-menu"
import { signOut } from "next-auth/react"
import { getEntityName } from "@/lib/breadcrumb-actions"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { getNavGroups } from "./sidebar"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

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
            <span className="font-semibold text-foreground tracking-wide">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-primary transition-colors"
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
  userRole?: string
  notifications: any[]
}

export function HeaderClient({ userImage, userName, userEmail, userRole, notifications }: HeaderClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const initials = userName
    ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  const navGroups = getNavGroups(userRole)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 lg:h-[72px] items-center gap-4 border-b border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-2xl px-4 lg:px-6 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)]">
      {/* Mobile Menu */}
      <div className="md:hidden flex items-center">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col glass border-r-white/10">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex h-16 items-center px-6 border-b border-white/10">
              <span className="font-bold text-lg tracking-tight text-foreground drop-shadow-sm">SBCMS</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
              <div className="flex flex-col gap-1">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-4">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const active = isActive(item.href, item.exact)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-200 mb-0.5",
                            active
                              ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Sheet Footer Theme Toggle */}
            <div className="border-t border-border/40 p-4 bg-muted/20">
              <ThemeToggle variant="pill" />
            </div>
          </SheetContent>
        </Sheet>
      </div>

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
          className="h-10 w-64 rounded-full border border-border/50 bg-muted/30 backdrop-blur-md pl-10 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 focus:w-80 shadow-inner"
        />
        <kbd className="absolute right-3 hidden lg:flex items-center gap-1 rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground shadow-sm">
          Ctrl K
        </kbd>
      </div>

      {/* Dark / Light Mode Toggle (Accessible in both Desktop and Mobile Top Bar) */}
      <ThemeToggle />

      {/* Notifications */}
      <NotificationsMenu initialNotifications={notifications} />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pl-2 pr-3 border border-border/40 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 shadow-sm glass">
          <Avatar className="h-7 w-7 ring-2 ring-background">
            <AvatarImage src={userImage || ""} alt={userName || "User"} />
            <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold leading-none text-foreground">{userName || "User"}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-card">
          <DropdownMenuGroup>
            <div className="px-3 py-2 border-b border-border/50 mb-1 bg-muted/20">
              <p className="text-sm font-bold">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuItem 
            className="px-2 py-1.5 cursor-pointer font-medium"
            onClick={() => router.push("/dashboard/settings")}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive cursor-pointer font-bold"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
