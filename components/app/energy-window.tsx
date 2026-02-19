"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/useAppStore"
import type { EnergyWindow } from "@/lib/types"
import { cn } from "@/lib/utils"

// ============================================
// ENERGY COMPUTATION — Pure functions
// ============================================

type EnergyState = "peak" | "optimal" | "declining" | "low"

interface EnergyLevel {
  percentage: number
  state: EnergyState
  position: number // 0-1, where "now" sits on the timeline
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function getEnergyLevel(config: EnergyWindow): EnergyLevel {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const wake = timeToMinutes(config.wakeUpTime)
  let bed = timeToMinutes(config.bedTime)

  // Handle bedtime past midnight (e.g. wake 07:00, bed 01:00)
  if (bed <= wake) bed += 1440

  let adjusted = currentMinutes
  if (currentMinutes < wake && bed > 1440) {
    adjusted = currentMinutes + 1440
  }

  const totalWindow = bed - wake
  if (totalWindow <= 0) return { percentage: 50, state: "optimal", position: 0.5 }

  // Before wake-up: full energy (haven't started depleting)
  if (adjusted < wake) {
    return { percentage: 100, state: "peak", position: 0 }
  }

  // After bedtime: depleted
  if (adjusted >= bed) {
    return { percentage: 0, state: "low", position: 1 }
  }

  const elapsed = adjusted - wake
  const position = elapsed / totalWindow

  // Base depletion: linear
  let rawPercentage = 100 - (position * 100)

  // Preference bias: subtle curve shift
  if (config.preferredPeriod === "morning") {
    // Morning people: energy front-loaded, steeper decline after midpoint
    rawPercentage = position < 0.4
      ? 100 - (position * 60)           // slower decline early
      : 76 - ((position - 0.4) * 126.7) // steeper decline after 40%
  } else if (config.preferredPeriod === "evening") {
    // Evening people: slower initial decline, energy holds longer
    rawPercentage = position < 0.6
      ? 100 - (position * 50)           // very slow early decline
      : 70 - ((position - 0.6) * 175)   // steep late decline
  }

  const percentage = Math.max(0, Math.min(100, Math.round(rawPercentage)))

  let state: EnergyState
  if (percentage >= 80) state = "peak"
  else if (percentage >= 60) state = "optimal"
  else if (percentage >= 30) state = "declining"
  else state = "low"

  return { percentage, state, position }
}

// ============================================
// MICROCOPY
// ============================================

function getMicrocopy(state: EnergyState, percentage: number, lang: "en" | "fr"): string {
  switch (state) {
    case "peak":
      return lang === "fr"
        ? "Fen\u00eatre haute \u00e9nergie active"
        : "High-energy window active"
    case "optimal":
      return lang === "fr"
        ? `Fen\u00eatre d'\u00e9nergie : ${percentage}% restant`
        : `Energy window: ${percentage}% remaining`
    case "declining":
      return lang === "fr"
        ? "Le focus d\u00e9cline. Priorise ce qui compte."
        : "Focus typically declines. Prioritize what matters."
    case "low":
      return lang === "fr"
        ? "Fen\u00eatre basse \u00e9nergie. Repose-toi."
        : "Low-energy window. Rest and reset."
  }
}

// ============================================
// DOT COLOR BY STATE
// ============================================

function getDotStyles(state: EnergyState): { color: string; glow: string | undefined } {
  switch (state) {
    case "peak":
      return {
        color: "bg-primary",
        glow: "0 0 8px 2px hsl(var(--primary) / 0.5)",
      }
    case "optimal":
      return { color: "bg-primary", glow: undefined }
    case "declining":
      return { color: "bg-amber-400", glow: undefined }
    case "low":
      return { color: "bg-muted-foreground/50", glow: undefined }
  }
}

// ============================================
// DASHBOARD VARIANT — Ambient strip
// ============================================

export function EnergyWindowStrip() {
  const energyWindow = useAppStore((s) => s.energyWindow)
  const lang = useAppStore((s) => s.language)
  const [energy, setEnergy] = useState<EnergyLevel | null>(null)

  useEffect(() => {
    if (!energyWindow) return

    // Compute immediately
    setEnergy(getEnergyLevel(energyWindow))

    // Update every 60 seconds
    const interval = setInterval(() => {
      setEnergy(getEnergyLevel(energyWindow))
    }, 60_000)

    return () => clearInterval(interval)
  }, [energyWindow])

  if (!energyWindow || !energy) return null

  const dot = getDotStyles(energy.state)
  const copy = getMicrocopy(energy.state, energy.percentage, lang)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.08, duration: 0.6 }}
      className="px-1 py-2"
    >
      {/* The gradient bar — 3px tall ambient line */}
      <div className="relative h-[3px] w-full rounded-full overflow-hidden bg-muted-foreground/[0.06]">
        {/* Filled portion: luminous gradient from left (wake) to cursor (now) */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${energy.position * 100}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `linear-gradient(90deg, hsl(var(--primary) / 0.5) 0%, hsl(var(--primary) / 0.15) 100%)`,
          }}
        />

        {/* Remaining portion: faint future */}
        <div
          className="absolute inset-y-0 right-0 rounded-full"
          style={{
            left: `${energy.position * 100}%`,
            background: `linear-gradient(90deg, hsl(var(--muted-foreground) / 0.08) 0%, hsl(var(--muted-foreground) / 0.02) 100%)`,
          }}
        />

        {/* Cursor dot — current position */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          initial={{ left: 0 }}
          animate={{ left: `${energy.position * 100}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={cn("h-[7px] w-[7px] rounded-full", dot.color)}
            style={{ boxShadow: dot.glow }}
          />
        </motion.div>
      </div>

      {/* Label row */}
      <div className="flex items-center gap-2 mt-2">
        <div
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot.color)}
          style={{ boxShadow: dot.glow }}
        />
        <span className="text-[11px] text-muted-foreground tracking-wider uppercase font-medium">
          {copy}
        </span>
      </div>
    </motion.div>
  )
}

// ============================================
// COMPACT VARIANT — For Focus page
// ============================================

export function EnergyWindowCompact() {
  const energyWindow = useAppStore((s) => s.energyWindow)
  const lang = useAppStore((s) => s.language)
  const [energy, setEnergy] = useState<EnergyLevel | null>(null)

  useEffect(() => {
    if (!energyWindow) return

    setEnergy(getEnergyLevel(energyWindow))

    const interval = setInterval(() => {
      setEnergy(getEnergyLevel(energyWindow))
    }, 60_000)

    return () => clearInterval(interval)
  }, [energyWindow])

  if (!energyWindow || !energy) return null

  const dot = getDotStyles(energy.state)

  return (
    <div className="flex items-center gap-2.5">
      {/* Mini bar */}
      <div className="relative h-[2px] w-16 rounded-full overflow-hidden bg-muted-foreground/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
          style={{
            width: `${energy.position * 100}%`,
            background: `linear-gradient(90deg, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0.1) 100%)`,
          }}
        />
      </div>

      {/* Percentage */}
      <span className="text-[10px] text-muted-foreground tabular-nums tracking-wider">
        {energy.percentage}%
      </span>
    </div>
  )
}
