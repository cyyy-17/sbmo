"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
  Users,
  AlertCircle,
  Briefcase,
  Calendar,
  FileText,
  BarChart3,
  ShieldAlert,
  Home,
  ChevronLeft,
  ChevronRight,
  Activity,
  ClipboardList,
  Moon,
  Sun,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { LucideIcon } from "lucide-react"

type NavGroup = {
  label: string
  items: Array<{ href: string; icon: LucideIcon; label: string; exact?: boolean }>
}

const getNavGroups = (userRole?: string): NavGroup[] => {
  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { href: "/dashboard", icon: Home, label: "Dashboard", exact: true },
      ],
    },
    {
      label: "Management",
      items: [
        { href: "/dashboard/students", icon: Users, label: "Students" },
        { href: "/dashboard/incidents", icon: AlertCircle, label: "Incidents" },
        { href: "/dashboard/cases", icon: Briefcase, label: "Cases" },
      ],
    },
    {
      label: "Support",
      items: [
        { href: "/dashboard/interventions", icon: Activity, label: "Interventions" },
        { href: "/dashboard/monitoring", icon: Activity, label: "Monitoring" },
        { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
      ],
    },
  ]

  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
    const adminGroup: NavGroup = {
      label: "Admin",
      items: [
        { href: "/dashboard/documents", icon: FileText, label: "Documents" },
        { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
        { href: "/dashboard/activity", icon: ClipboardList, label: "Activity Logs" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      ],
    }

    if (userRole === "SUPER_ADMIN") {
      adminGroup.items.unshift({
        href: "/dashboard/users",
        icon: Users, // Using the Users icon for now
        label: "Users",
      })
    }
    
    groups.push(adminGroup)
  }

  return groups
}

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = saved === "dark" || (!saved && prefersDark)
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150",
        "active:scale-[0.97]",
        collapsed && "justify-center px-2"
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function Sidebar({ userRole }: { userRole?: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  const navGroups = getNavGroups(userRole)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden sm:flex flex-col border-r border-border bg-sidebar min-h-screen flex-shrink-0 relative z-40"
    >
      {/* Logo */}
      <div className={cn(
        "flex h-14 lg:h-[60px] items-center border-b border-border flex-shrink-0 transition-all duration-200",
        collapsed ? "justify-center px-2" : "px-4 gap-2"
      )}>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary flex-shrink-0">
          <ShieldAlert className="h-4 w-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Link href="/dashboard" className="font-bold text-base tracking-tight text-foreground whitespace-nowrap">
                SBCMS
              </Link>
              <p className="text-[10px] text-muted-foreground leading-none whitespace-nowrap">
                Behavior Management
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[52px] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <nav className="flex flex-col gap-0.5 px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150",
                      "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
                      collapsed ? "justify-center px-2" : "px-3",
                      active
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {/* Active background pill */}
                    {active && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <item.icon className={cn("h-4 w-4 flex-shrink-0 relative z-10", active && "text-primary")} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden whitespace-nowrap relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer: Theme Toggle */}
      <div className="border-t border-border p-2 flex-shrink-0">
        <ThemeToggle collapsed={collapsed} />
      </div>
    </motion.aside>
  )
}
