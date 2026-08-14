"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface ThemeWaveState {
  active: boolean
  x: number
  y: number
  targetTheme: "dark" | "light"
}

// Global listener hook for full-screen theme transition wave
let triggerWaveCallback: ((x: number, y: number, targetTheme: "dark" | "light") => void) | null = null

export function triggerGlobalThemeWave(x: number, y: number, targetTheme: "dark" | "light") {
  if (triggerWaveCallback) {
    triggerWaveCallback(x, y, targetTheme)
  }
}

export function ThemeTransitionCanvas() {
  const [wave, setWave] = useState<ThemeWaveState>({
    active: false,
    x: 0,
    y: 0,
    targetTheme: "dark",
  })

  useEffect(() => {
    triggerWaveCallback = (x, y, targetTheme) => {
      setWave({ active: true, x, y, targetTheme })
    }
    return () => {
      triggerWaveCallback = null
    }
  }, [])

  return (
    <AnimatePresence>
      {wave.active && (
        <motion.div
          key="theme-wave-curtain"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          onAnimationComplete={() => {
            setWave((prev) => ({ ...prev, active: false }))
          }}
          className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden"
        >
          {/* Expanding Radial Curtain */}
          <motion.div
            initial={{
              clipPath: `circle(0px at ${wave.x}px ${wave.y}px)`,
            }}
            animate={{
              clipPath: `circle(150vmax at ${wave.x}px ${wave.y}px)`,
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1], // snappy easeOutCubic
            }}
            className="absolute inset-0"
            style={{
              backgroundColor: wave.targetTheme === "dark" ? "#090d16" : "#ffffff",
            }}
          >
            {/* Ambient Shimmer Flare on the wave frontier */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-screen"
              style={{
                background:
                  wave.targetTheme === "dark"
                    ? `radial-gradient(circle 800px at ${wave.x}px ${wave.y}px, rgba(99,102,241,0.35), transparent 70%)`
                    : `radial-gradient(circle 800px at ${wave.x}px ${wave.y}px, rgba(245,158,11,0.35), transparent 70%)`,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
