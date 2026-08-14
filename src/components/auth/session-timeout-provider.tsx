"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { signOut } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, ShieldAlert, LogOut } from "lucide-react"

// Inactivity timeout: 15 minutes (900,000 ms)
const IDLE_TIMEOUT_MS = 15 * 60 * 1000
// Show warning modal 60 seconds before expiration
const WARNING_THRESHOLD_MS = 60 * 1000

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(60)
  const lastActivityRef = useRef<number>(Date.now())
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset activity timestamp on user interactions
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (showWarning) {
      setShowWarning(false)
    }
  }, [showWarning])

  // Explicit action to keep session active
  const extendSession = () => {
    lastActivityRef.current = Date.now()
    setShowWarning(false)
  }

  const handleLogout = useCallback((reason: "timeout" | "closed" = "timeout") => {
    try {
      sessionStorage.removeItem("sbcms_session_active")
      localStorage.removeItem("sbcms_last_active")
    } catch {
      // ignore
    }
    signOut({ callbackUrl: `/login?reason=${reason}` })
  }, [])

  // Tab & Window close tracking with sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    // Mark current browser session active in this tab
    sessionStorage.setItem("sbcms_session_active", "1")
    localStorage.setItem("sbcms_last_active", String(Date.now()))

    // Listen for tab closure
    const handleBeforeUnload = () => {
      localStorage.setItem("sbcms_last_active", String(Date.now()))
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Activity listeners
  useEffect(() => {
    if (typeof window === "undefined") return

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"]
    let throttleTimeout: NodeJS.Timeout | null = null

    const throttledHandler = () => {
      if (!throttleTimeout) {
        handleUserActivity()
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null
        }, 1000) // throttle to max once per second
      }
    }

    events.forEach((event) => window.addEventListener(event, throttledHandler, { passive: true }))

    // Heartbeat check interval every 2 seconds
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current
      const remainingMs = IDLE_TIMEOUT_MS - elapsed

      if (remainingMs <= 0) {
        // Timed out completely
        clearInterval(interval)
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
        handleLogout("timeout")
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        // Within warning window
        setShowWarning(true)
        setSecondsRemaining(Math.max(0, Math.ceil(remainingMs / 1000)))
      } else {
        setShowWarning(false)
      }
    }, 2000)

    return () => {
      events.forEach((event) => window.removeEventListener(event, throttledHandler))
      clearInterval(interval)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [handleUserActivity, handleLogout])

  // Live 1-second countdown when warning modal is open
  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
            handleLogout("timeout")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [showWarning, handleLogout])

  return (
    <>
      {children}

      <Dialog open={showWarning} onOpenChange={(open) => !open && extendSession()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Session Expiring Soon</DialogTitle>
                <DialogDescription className="text-xs">
                  You have been inactive for a while. For security, you will be logged out automatically.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 text-center space-y-3">
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
              <span className="text-4xl font-black tabular-nums text-amber-600 dark:text-amber-400">
                {secondsRemaining}s
              </span>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Remaining before automatic logout
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Click <strong>Stay Logged In</strong> to continue working or log out now.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLogout("timeout")}
              className="text-xs gap-1.5 text-destructive hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log Out Now
            </Button>
            <Button size="sm" onClick={extendSession} className="text-xs font-semibold">
              Stay Logged In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
