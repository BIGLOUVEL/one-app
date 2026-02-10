"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  Calendar,
  Mountain,
  Check,
  Plus,
  X,
  AlertCircle,
  ChevronRight,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import type { WeeklyOutcome } from "@/lib/types"

export default function FourOneOnePage() {
  const router = useRouter()
  const {
    objective,
    fourOneOne,
    setFourOneOne,
    updateWeeklyOutcome,
  } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [yearlyGoals, setYearlyGoals] = useState<string[]>(["", "", ""])
  const [monthlyGoals, setMonthlyGoals] = useState<string[]>(["", "", ""])
  const [weeks, setWeeks] = useState<WeeklyOutcome[]>([
    { weekNumber: 1, outcomes: ["", "", ""], completed: false },
    { weekNumber: 2, outcomes: ["", "", ""], completed: false },
    { weekNumber: 3, outcomes: ["", "", ""], completed: false },
    { weekNumber: 4, outcomes: ["", "", ""], completed: false },
  ])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeWeek, setActiveWeek] = useState(1)

  useEffect(() => {
    setIsLoading(false)
    // Load existing data if available
    if (fourOneOne) {
      setYearlyGoals([
        fourOneOne.yearlyGoals[0] ?? "",
        fourOneOne.yearlyGoals[1] ?? "",
        fourOneOne.yearlyGoals[2] ?? "",
      ])
      setMonthlyGoals([
        fourOneOne.monthlyGoals[0] ?? "",
        fourOneOne.monthlyGoals[1] ?? "",
        fourOneOne.monthlyGoals[2] ?? "",
      ])
      setWeeks(
        fourOneOne.weeks.map((w) => ({
          ...w,
          outcomes: [
            w.outcomes[0] ?? "",
            w.outcomes[1] ?? "",
            w.outcomes[2] ?? "",
          ],
        }))
      )
    }
  }, [fourOneOne])

  // Redirect if no objective
  useEffect(() => {
    if (!isLoading && !objective) {
      router.push("/app/onboarding")
    }
  }, [objective, isLoading, router])

  const handleYearlyChange = (index: number, value: string) => {
    const updated = [...yearlyGoals]
    updated[index] = value
    setYearlyGoals(updated)
    setHasUnsavedChanges(true)
  }

  const handleMonthlyChange = (index: number, value: string) => {
    const updated = [...monthlyGoals]
    updated[index] = value
    setMonthlyGoals(updated)
    setHasUnsavedChanges(true)
  }

  const handleWeekOutcomeChange = (weekNum: number, outcomeIndex: number, value: string) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === weekNum
          ? {
              ...w,
              outcomes: w.outcomes.map((o, i) =>
                i === outcomeIndex ? value : o
              ),
            }
          : w
      )
    )
    setHasUnsavedChanges(true)
  }

  const handleWeekReflectionChange = (weekNum: number, value: string) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === weekNum ? { ...w, reflection: value } : w
      )
    )
    setHasUnsavedChanges(true)
  }

  const handleWeekToggleComplete = (weekNum: number) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === weekNum ? { ...w, completed: !w.completed } : w
      )
    )
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    setFourOneOne({
      yearlyGoals: yearlyGoals.filter((g) => g.trim()),
      monthlyGoals: monthlyGoals.filter((g) => g.trim()),
      weeks,
    })
    setHasUnsavedChanges(false)
  }

  // Check if goals align with ONE thing
  const getAlignmentWarning = (goal: string) => {
    if (!goal.trim() || !objective) return false
    const keywords = objective.todayGoal.toLowerCase().split(/\s+/)
    const goalLower = goal.toLowerCase()
    const hasMatch = keywords.some(
      (kw) => kw.length > 3 && goalLower.includes(kw)
    )
    return !hasMatch && goal.length > 10
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl p-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/4" />
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-32 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Target className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">4-1-1 Planning</h1>
            <p className="text-muted-foreground">
              Align your year, month, and weeks with your ONE thing
            </p>
          </div>
          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button onClick={handleSave} className="glow-green">
                  <Save className="mr-2 h-4 w-4" />
                  Save Plan
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ONE Thing Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="liquid-glass-green p-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Target className="h-4 w-4 text-primary" />
            Your ONE Thing
          </div>
          <p className="font-medium">{objective.todayGoal}</p>
        </motion.div>

        {/* Year Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Mountain className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold">This Year</h2>
              <p className="text-xs text-muted-foreground">1-3 yearly goals</p>
            </div>
          </div>

          <div className="space-y-3">
            {yearlyGoals.map((goal, i) => (
              <div key={i} className="relative">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => handleYearlyChange(i, e.target.value)}
                  placeholder={`Yearly goal ${i + 1}...`}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-muted-foreground/40"
                />
                {getAlignmentWarning(goal) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2" title="May not align with ONE thing">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Month Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="liquid-glass p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">This Month</h2>
              <p className="text-xs text-muted-foreground">1-3 monthly goals</p>
            </div>
          </div>

          <div className="space-y-3">
            {monthlyGoals.map((goal, i) => (
              <div key={i} className="relative">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => handleMonthlyChange(i, e.target.value)}
                  placeholder={`Monthly goal ${i + 1}...`}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40"
                />
                {getAlignmentWarning(goal) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2" title="May not align with ONE thing">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4-Week Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-lg">4-Week Strip</h2>

          {/* Week tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setActiveWeek(week.weekNumber)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
                  activeWeek === week.weekNumber
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <span>Week {week.weekNumber}</span>
                {week.completed && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>

          {/* Active week content */}
          <AnimatePresence mode="wait">
            {weeks.map(
              (week) =>
                week.weekNumber === activeWeek && (
                  <motion.div
                    key={week.weekNumber}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="liquid-glass p-4 sm:p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                          <Calendar className="h-4 w-4 text-cyan-400" />
                        </div>
                        <h3 className="font-semibold">Week {week.weekNumber} Outcomes</h3>
                      </div>
                      <button
                        onClick={() => handleWeekToggleComplete(week.weekNumber)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                          week.completed
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                        {week.completed ? "Done" : "Mark Done"}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {week.outcomes.map((outcome, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-xs text-cyan-400 shrink-0">
                            {i + 1}
                          </div>
                          <input
                            type="text"
                            value={outcome}
                            onChange={(e) =>
                              handleWeekOutcomeChange(week.weekNumber, i, e.target.value)
                            }
                            placeholder={`Outcome ${i + 1}...`}
                            className="flex-1 bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-muted-foreground/40"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Reflection */}
                    <div className="pt-4 border-t border-white/10">
                      <label className="text-sm text-muted-foreground block mb-2">
                        What moved the needle this week?
                      </label>
                      <textarea
                        value={week.reflection ?? ""}
                        onChange={(e) =>
                          handleWeekReflectionChange(week.weekNumber, e.target.value)
                        }
                        placeholder="Reflect on what really made a difference..."
                        rows={2}
                        className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-muted-foreground/40 resize-none"
                      />
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </motion.div>

        {/* Alignment Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
        >
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Alignment tip:</strong> Each goal should cascade from your ONE thing.
            Ask yourself: "Does this directly serve my primary objective?"
          </p>
        </motion.div>
      </div>
    </div>
  )
}
