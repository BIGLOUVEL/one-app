"use client"

import { useEffect } from "react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"

/**
 * Silent background component — no modal, no interruption.
 * Responsibilities:
 *   1. Auto-reset rightNowCompleted + todayGoalCompleted on a new day
 *   2. Recalculate contract tension on every app open
 */
export function DailyDominoCheck() {
  const hasHydrated = useHasHydrated()
  const {
    objective,
    needsDailyCheck,
    setLastDailyCheckDate,
    updateContractState,
    visualPrefs,
  } = useAppStore()

  // Recalculate contract tension on mount
  useEffect(() => {
    if (hasHydrated && objective?.status === "active") {
      updateContractState()
    }
  }, [hasHydrated, objective?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-reset daily state on new day (silent — no modal)
  useEffect(() => {
    if (
      hasHydrated &&
      visualPrefs.dailyDominoCheck &&
      needsDailyCheck() &&
      objective?.status === "active"
    ) {
      const today = new Date().toLocaleDateString("en-CA")
      setLastDailyCheckDate(today)
    }
  }, [hasHydrated, needsDailyCheck, objective, visualPrefs.dailyDominoCheck]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
