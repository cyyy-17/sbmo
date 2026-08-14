"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  variant?: "icon" | "pill" | "menu-item"
  className?: string
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = saved === "dark" || (!saved && prefersDark)
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
  }, [])

  const toggleTheme = (e?: React.MouseEvent) => {
    const next = !isDark
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 700)

    // Enable smooth transitioning class
    document.documentElement.classList.add("theme-transitioning")
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning")
    }, 500)

    // Modern Circular View Transition (Chrome, Edge, Safari 18+)
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = (e?.currentTarget as HTMLElement)?.getBoundingClientRect?.()
      const x = rect ? rect.left + rect.width / 2 : (e?.clientX ?? window.innerWidth / 2)
      const y = rect ? rect.top + rect.height / 2 : (e?.clientY ?? window.innerHeight / 2)

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const transition = (document as any).startViewTransition(() => {
        setIsDark(next)
        document.documentElement.classList.toggle("dark", next)
        localStorage.setItem("theme", next ? "dark" : "light")
      })

      transition.ready?.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]

        document.documentElement.animate(
          {
            clipPath: next ? clipPath : [...clipPath].reverse(),
          },
          {
            duration: 450,
            easing: "cubic-bezier(0.87, 0, 0.13, 1)",
            pseudoElement: next
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
          }
        )
      })
    } else {
      // Fallback
      setIsDark(next)
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("theme", next ? "dark" : "light")
    }
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("h-9 w-9 rounded-2xl border border-border/40 bg-background/50", className)}
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </Button>
    )
  }

  if (variant === "pill") {
    return (
      <button
        ref={buttonRef}
        onClick={toggleTheme}
        className={cn(
          "group relative flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold",
          "border border-border/60 bg-background/80 hover:bg-accent/80 hover:border-primary/40 text-foreground transition-all duration-300",
          "active:scale-[0.96] shadow-xs cursor-pointer overflow-hidden",
          className
        )}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {/* Glow ambient sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="flex items-center gap-2.5 relative z-10">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-300",
              isDark
                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                : "bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ rotate: -120, scale: 0.4, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 120, scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
              >
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="font-semibold tracking-wide">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        </div>

        <span
          className={cn(
            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border transition-all duration-300 relative z-10",
            isDark
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          )}
        >
          {isDark ? "Active" : "Active"}
        </span>
      </button>
    )
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl",
        "hover:bg-accent/80 hover:border-primary/50 hover:shadow-[0_0_16px_rgba(var(--primary),0.25)] transition-all duration-300 shadow-2xs cursor-pointer overflow-visible group",
        isAnimating && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        className
      )}
      title={isDark ? "Switch to light mode (Click for solar wave)" : "Switch to dark mode (Click for lunar wave)"}
      aria-label="Toggle theme mode"
    >
      {/* Shockwave Pulse Effect on Click */}
      {isAnimating && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "absolute inset-0 rounded-2xl pointer-events-none",
            isDark ? "bg-indigo-500/30" : "bg-amber-500/30"
          )}
        />
      )}

      {/* Orbiting Sparkles */}
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.span
            key="dark-sparkle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-1 -right-1 pointer-events-none"
          >
            <Sparkles className="h-2.5 w-2.5 text-indigo-400 animate-pulse" />
          </motion.span>
        ) : (
          <motion.span
            key="light-sparkle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-1 -right-1 pointer-events-none"
          >
            <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Celestial Icon Transition */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon-icon"
            initial={{ rotate: -140, scale: 0.2, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 140, scale: 0.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="flex items-center justify-center text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
          >
            <Moon className="h-4.5 w-4.5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun-icon"
            initial={{ rotate: 140, scale: 0.2, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -140, scale: 0.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="flex items-center justify-center text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          >
            <Sun className="h-4.5 w-4.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
