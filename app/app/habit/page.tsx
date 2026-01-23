"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Check,
  AlertTriangle,
  Calendar,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconFlame, IconTarget } from "@/components/ui/custom-icons"
import { useAppStore } from "@/store/useAppStore"

const SESSION_OPTIONS = [
  { value: 15, label: "15 min", description: "Light commitment" },
  { value: 30, label: "30 min", description: "Moderate focus" },
  { value: 50, label: "50 min", description: "Deep work" },
]

export default function HabitPage() {
  const router = useRouter()
  const {
    objective,
    habitChallenge,
    initHabitChallenge,
    markDayComplete,
    getHabitProgress,
  } = useAppStore()

  const [selectedMinutes, setSelectedMinutes] = useState(30)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Redirect if no objective
  useEffect(() => {
    if (!isLoading && !objective) {
      router.push("/app/define")
    }
  }, [objective, isLoading, router])

  const progress = getHabitProgress()

  // Generate 66-day grid
  const dayGrid = useMemo(() => {
    if (!habitChallenge) return []

    const startDate = new Date(habitChallenge.startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Array.from({ length: 66 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const dateStr = date.toISOString().split("T")[0]
      const dayRecord = habitChallenge.days.find((d) => d.date === dateStr)

      const isToday = date.getTime() === today.getTime()
      const isPast = date.getTime() < today.getTime()
      const isFuture = date.getTime() > today.getTime()

      return {
        dayNumber: i + 1,
        date: dateStr,
        isCompleted: dayRecord?.completed ?? false,
        sessionMinutes: dayRecord?.sessionMinutes,
        isToday,
        isPast,
        isFuture,
      }
    })
  }, [habitChallenge])

  // Check if yesterday was missed (for "never miss twice" warning)
  const yesterdayMissed = useMemo(() => {
    if (!habitChallenge || dayGrid.length === 0) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const startDate = new Date(habitChallenge.startDate)
    startDate.setHours(0, 0, 0, 0)

    // Only show warning if yesterday is within the challenge period
    if (yesterday < startDate) return false

    const yesterdayRecord = habitChallenge.days.find(
      (d) => d.date === yesterdayStr
    )
    return !yesterdayRecord?.completed
  }, [habitChallenge, dayGrid])

  // Today's status
  const todayCompleted = useMemo(() => {
    const todayDay = dayGrid.find((d) => d.isToday)
    return todayDay?.isCompleted ?? false
  }, [dayGrid])

  const handleInitChallenge = () => {
    initHabitChallenge(selectedMinutes)
  }

  const handleMarkToday = () => {
    const today = new Date().toISOString().split("T")[0]
    markDayComplete(today, habitChallenge?.minimumSessionMinutes ?? 30)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-lg p-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/3 mx-auto" />
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <IconTarget size="lg" className="animate-pulse" />
      </div>
    )
  }

  // No challenge yet - show setup
  if (!habitChallenge) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-8 relative z-10"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <IconFlame size="xl" className="drop-shadow-[0_0_12px_rgba(0,255,136,0.4)]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">66-Day Challenge</h1>
            <p className="text-muted-foreground">
              Research shows it takes an average of 66 days to form a lasting habit.
              Commit to daily focus sessions on your ONE thing.
            </p>
          </div>

          <div className="liquid-glass p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Choose your minimum daily commitment:
            </p>

            <div className="grid gap-3">
              {SESSION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMinutes(option.value)}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    selectedMinutes === option.value
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {selectedMinutes === option.value && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="liquid-glass p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your ONE thing: <span className="text-foreground">{objective.todayGoal}</span>
            </p>
          </div>

          <Button
            onClick={handleInitChallenge}
            className="w-full h-14 rounded-2xl text-base font-medium glow-green"
          >
            <IconFlame size="sm" className="mr-2" />
            Start 66-Day Challenge
          </Button>
        </motion.div>
      </div>
    )
  }

  // Active challenge view
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-3">
            <IconFlame size="lg" className="drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
            <h1 className="text-2xl sm:text-3xl font-bold">66-Day Challenge</h1>
          </div>
          <p className="text-muted-foreground">
            {habitChallenge.minimumSessionMinutes} min/day minimum
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="liquid-glass p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold">{progress.day}</p>
            <p className="text-xs text-muted-foreground">Day</p>
          </div>
          <div className="liquid-glass-green p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <IconFlame size="xs" />
              <p className="text-2xl sm:text-3xl font-bold text-orange-400">
                {progress.streak}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="liquid-glass p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-violet-400" />
              <p className="text-2xl sm:text-3xl font-bold text-violet-400">
                {habitChallenge.longestStreak}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-emerald-400">{progress.percentage}%</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {habitChallenge.days.filter((d) => d.completed).length} of 66 days completed
          </p>
        </motion.div>

        {/* Never Miss Twice Warning */}
        <AnimatePresence>
          {yesterdayMissed && !todayCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20"
            >
              <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0" />
              <div>
                <p className="font-medium text-orange-400">Never miss twice!</p>
                <p className="text-sm text-muted-foreground">
                  You missed yesterday. Don't let the chain break further.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Action */}
        {!todayCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleMarkToday}
              className="w-full h-14 rounded-2xl text-base font-medium glow-green"
            >
              <Check className="mr-2 h-5 w-5" />
              Mark Today Complete
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Or complete a focus session to auto-mark
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass-green p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span className="font-medium text-emerald-400">Today Complete!</span>
            </div>
          </motion.div>
        )}

        {/* 66-Day Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="liquid-glass p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Your 66 Days</h2>
          </div>

          <div className="grid grid-cols-11 gap-1.5 sm:gap-2">
            {dayGrid.map((day) => (
              <motion.div
                key={day.dayNumber}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: day.dayNumber * 0.01 }}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                  transition-all duration-200 cursor-default
                  ${
                    day.isCompleted
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : day.isToday
                      ? "bg-orange-500/20 border-2 border-orange-500 text-orange-400"
                      : day.isPast
                      ? "bg-red-500/10 text-red-400/60"
                      : "bg-white/5 text-muted-foreground"
                  }
                `}
                title={`Day ${day.dayNumber} - ${day.date}${
                  day.isCompleted ? " (Completed)" : day.isToday ? " (Today)" : ""
                }`}
              >
                {day.isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  day.dayNumber
                )}
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border-2 border-orange-500" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/20" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-white/5" />
              <span>Upcoming</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
