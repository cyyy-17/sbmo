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

export type NavGroup = {
  label: string
  items: Array<{ href: string; icon: LucideIcon; label: string; exact?: boolean }>
}

export const getNavGroups = (userRole?: string): NavGroup[] => {
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
        icon: Users,
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
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
        "text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200",
        "active:scale-[0.95]",
        collapsed && "justify-center px-2"
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
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
            className="overflow-hidden whitespace-nowrap font-medium"
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
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col border-r border-white/10 dark:border-white/5 bg-sidebar/80 backdrop-blur-2xl min-h-screen flex-shrink-0 relative z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 lg:h-[72px] items-center border-b border-white/10 flex-shrink-0 transition-all duration-300",
        collapsed ? "justify-center px-2" : "px-5 gap-3"
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 flex-shrink-0">
          <ShieldAlert className="h-4 w-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Link href="/dashboard" className="font-bold text-lg tracking-tight text-foreground whitespace-nowrap drop-shadow-sm">
                SBCMS
              </Link>
              <p className="text-[10px] text-primary/80 font-semibold uppercase tracking-wider leading-none whitespace-nowrap mt-0.5">
                Portal
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[60px] z-20 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background/80 backdrop-blur-sm text-muted-foreground shadow-md hover:text-primary hover:border-primary/50 transition-all duration-200"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        <nav className="flex flex-col gap-1 px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap"
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
                      "relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 group mb-0.5",
                      "hover:bg-primary/5 active:scale-[0.97]",
                      collapsed ? "justify-center px-2" : "px-3",
                      active
                        ? "text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Active background pill */}
                    {active && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      "h-4 w-4 flex-shrink-0 relative z-10 transition-colors duration-200", 
                      active ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                    )} />
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
      <div className="border-t border-white/10 p-3 flex-shrink-0 bg-background/20 backdrop-blur-md">
        <ThemeToggle collapsed={collapsed} />
      </div>
    </motion.aside>
  )
}
