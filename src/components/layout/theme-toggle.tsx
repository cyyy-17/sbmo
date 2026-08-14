"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  variant?: "icon" | "pill" | "menu-item"
  className?: string
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("h-8 w-8 rounded-full border border-border/40", className)}
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </Button>
    )
  }

  if (variant === "pill") {
    return (
      <button
        onClick={toggle}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold",
          "text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200",
          "active:scale-[0.96] w-full",
          className
        )}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {isDark ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
        </div>
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      className={cn(
        "relative h-8 w-8 rounded-full border border-border/50 bg-background/60 backdrop-blur-md",
        "hover:bg-accent hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-2xs cursor-pointer",
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400 drop-shadow-sm" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500 drop-shadow-sm" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  )
}
