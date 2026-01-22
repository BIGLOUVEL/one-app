"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/useAppStore"
import { ContractState } from "@/lib/types"

interface ContractMeterProps {
  showLabel?: boolean
  variant?: "line" | "full"
}

const stateConfig: Record<ContractState, {
  label: string
  color: string
  bgColor: string
  description: string
}> = {
  stable: {
    label: "Contract stable",
    color: "bg-foreground/60",
    bgColor: "bg-foreground/10",
    description: "You are on track",
  },
  tension: {
    label: "Contract under tension",
    color: "bg-red-500/80",
    bgColor: "bg-red-500/10",
    description: "Inactivity detected",
  },
  broken: {
    label: "Contract broken",
    color: "bg-red-500",
    bgColor: "bg-red-500/20",
    description: "Deadline passed",
  },
  fulfilled: {
    label: "Contract fulfilled",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Objective completed",
  },
}

export function ContractMeter({ showLabel = true, variant = "full" }: ContractMeterProps) {
  const { getContractInfo, updateContractState, contractMeter } = useAppStore()
  const { state, daysInactive, tensionLevel } = getContractInfo()

  // Update contract state on mount and periodically
  useEffect(() => {
    updateContractState()
    const interval = setInterval(() => {
      updateContractState()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [updateContractState])

  if (!contractMeter) return null

  const config = stateConfig[state]

  if (variant === "line") {
    return (
      <div className="space-y-2">
        {/* Thin line meter */}
        <div className={`h-0.5 w-full rounded-full ${config.bgColor} overflow-hidden`}>
          <motion.div
            initial={{ width: "100%" }}
            animate={{
              width: state === "broken" ? "100%" : state === "fulfilled" ? "100%" : `${100 - tensionLevel}%`
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${config.color} rounded-full`}
          />
        </div>

        {showLabel && (
          <p className={`text-xs ${state === "tension" || state === "broken" ? "text-red-400" : state === "fulfilled" ? "text-emerald-400" : "text-muted-foreground"}`}>
            {config.label}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Full meter visualization */}
      <div className={`relative h-1 w-full rounded-full ${config.bgColor} overflow-hidden`}>
        <motion.div
          initial={{ width: "100%" }}
          animate={{
            width: state === "broken" ? "0%" : state === "fulfilled" ? "100%" : `${100 - tensionLevel}%`
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${config.color} rounded-full`}
        />

        {/* Tension pulse animation */}
        {state === "tension" && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-red-500/20"
          />
        )}
      </div>

      {/* Label and status */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${
            state === "tension" || state === "broken"
              ? "text-red-400"
              : state === "fulfilled"
                ? "text-emerald-400"
                : "text-muted-foreground"
          }`}>
            {config.label}
          </p>

          {state === "tension" && daysInactive > 0 && (
            <span className="text-xs text-red-400/70">
              {daysInactive} day{daysInactive > 1 ? "s" : ""} inactive
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Minimal version - just the line
export function ContractLine() {
  const { getContractInfo, contractMeter } = useAppStore()
  const { state, tensionLevel } = getContractInfo()

  if (!contractMeter) return null

  const config = stateConfig[state]

  return (
    <div className={`h-px w-full ${config.bgColor}`}>
      <motion.div
        animate={{
          width: state === "broken" ? "0%" : state === "fulfilled" ? "100%" : `${100 - tensionLevel}%`
        }}
        transition={{ duration: 0.5 }}
        className={`h-full ${config.color}`}
      />
    </div>
  )
}
