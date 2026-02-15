"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Lock,
  Zap,
  BarChart3,
  Lightbulb,
  Calendar,
  Flame,
  ArrowRight,
  Play,
  Flag,
  X,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { AIInsights } from "@/components/app/ai-insights"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================
type ProjectStatus = "on_track" | "at_risk" | "off_track"

interface TrajectoryPoint {
  day: number
  ideal: number
  real: number | null
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getProjectStatus(
  progress: number,
  daysElapsed: number,
  totalDays: number
): { status: ProjectStatus; reason: string } {
  const expectedProgress = (daysElapsed / totalDays) * 100
  const delta = progress - expectedProgress

  if (delta >= -5) {
    return {
      status: "on_track",
      reason: delta >= 5
        ? `${Math.round(delta)}% ahead of schedule.`
        : "Pace matches required trajectory."
    }
  } else if (delta >= -20) {
    return {
      status: "at_risk",
      reason: `${Math.round(Math.abs(delta))}% behind expected progress.`
    }
  } else {
    return {
      status: "off_track",
      reason: `Significant gap. ${Math.round(Math.abs(delta))}% behind trajectory.`
    }
  }
}

function generateTrajectoryData(
  totalDays: number,
  daysElapsed: number,
  currentProgress: number
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = []

  for (let day = 0; day <= totalDays; day++) {
    const ideal = (day / totalDays) * 100
    const real = day <= daysElapsed
      ? (day / daysElapsed) * currentProgress
      : null

    points.push({ day, ideal, real })
  }

  return points
}

function getProjectedCompletion(
  progress: number,
  daysElapsed: number,
  totalDays: number
): { projectedDays: number; delta: number; message: string } {
  if (progress === 0 || daysElapsed === 0) {
    return {
      projectedDays: totalDays,
      delta: 0,
      message: "Not enough data yet."
    }
  }

  const dailyRate = progress / daysElapsed
  const projectedDays = Math.ceil(100 / dailyRate)
  const delta = totalDays - projectedDays

  let message: string
  if (delta > 0) {
    message = `At this pace, you'll finish ${delta} day${delta > 1 ? 's' : ''} early.`
  } else if (delta < 0) {
    message = `At this pace, you'll need ${Math.abs(delta)} extra day${Math.abs(delta) > 1 ? 's' : ''}.`
  } else {
    message = "Exactly on pace for deadline."
  }

  return { projectedDays, delta, message }
}

// ============================================
// COMPONENTS
// ============================================

// Status Badge
function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = {
    on_track: {
      icon: CheckCircle2,
      label: "On Track",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
    at_risk: {
      icon: AlertTriangle,
      label: "At Risk",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    off_track: {
      icon: XCircle,
      label: "Off Track",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
    },
  }

  const { icon: Icon, label, bg, border, text } = config[status]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} border ${border}`}>
      <Icon className={`h-4 w-4 ${text}`} />
      <span className={`text-sm font-medium ${text}`}>{label}</span>
    </div>
  )
}

// Chrono Block
function ChronoBlock({
  daysRemaining,
  projectedDays,
  totalDays,
  delta
}: {
  daysRemaining: number
  projectedDays: number
  totalDays: number
  delta: number
}) {
  const Icon = delta >= 0 ? TrendingUp : TrendingDown
  const deltaColor = delta >= 0 ? "text-emerald-400" : "text-red-400"

  return (
    <div className="liquid-glass p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Clock className="h-3.5 w-3.5" />
        Time Reality
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold tabular-nums">{daysRemaining}</p>
          <p className="text-xs text-muted-foreground">days remaining</p>
        </div>

        <div className="text-right">
          <div className={`flex items-center gap-1 ${deltaColor}`}>
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {delta >= 0 ? `+${delta}d` : `${delta}d`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">vs projection</p>
        </div>
      </div>

      {/* Mini progress of time */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/20 rounded-full transition-all"
            style={{ width: `${((totalDays - daysRemaining) / totalDays) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          {totalDays - daysRemaining} of {totalDays} days elapsed
        </p>
      </div>
    </div>
  )
}

// Project Status Block
function ProjectStatusBlock({
  status,
  reason
}: {
  status: ProjectStatus
  reason: string
}) {
  const bgGlow = {
    on_track: "bg-emerald-500/5",
    at_risk: "bg-amber-500/5",
    off_track: "bg-red-500/5",
  }

  return (
    <div className={`liquid-glass p-5 space-y-4 ${bgGlow[status]}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Target className="h-3.5 w-3.5" />
        Project Status
      </div>

      <StatusBadge status={status} />

      <p className="text-sm text-muted-foreground leading-relaxed">
        {reason}
      </p>
    </div>
  )
}

// Trajectory Chart (SVG) with Milestones
function TrajectoryChart({
  data,
  projectionMessage,
  milestones,
  totalDays,
  startDate,
}: {
  data: TrajectoryPoint[]
  projectionMessage: string
  milestones?: { id: string; title: string; targetDate: string; targetProgress: number; status: string }[]
  totalDays?: number
  startDate?: string
}) {
  const width = 100
  const height = 40
  const padding = 2

  const maxDay = data.length - 1
  const xScale = (day: number) => padding + (day / maxDay) * (width - padding * 2)
  const yScale = (value: number) => height - padding - (value / 100) * (height - padding * 2)

  // Calculate milestone positions based on date
  const getMilestoneDay = (targetDate: string) => {
    if (!startDate || !totalDays) return 0
    const start = new Date(startDate)
    const target = new Date(targetDate)
    const daysDiff = Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.min(Math.max(daysDiff, 0), totalDays)
  }

  // Ideal path
  const idealPath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.day)} ${yScale(p.ideal)}`)
    .join(' ')

  // Real path (only where we have data)
  const realData = data.filter(p => p.real !== null)
  const realPath = realData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.day)} ${yScale(p.real!)}`)
    .join(' ')

  return (
    <div className="liquid-glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5" />
          Trajectory
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-white/30 rounded" />
            <span className="text-muted-foreground">Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">Actual</span>
          </div>
          {milestones && milestones.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-violet-500 rounded-full" />
              <span className="text-muted-foreground">Milestones</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-24 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1={padding} y1={yScale(25)} x2={width - padding} y2={yScale(25)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
          <line x1={padding} y1={yScale(50)} x2={width - padding} y2={yScale(50)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
          <line x1={padding} y1={yScale(75)} x2={width - padding} y2={yScale(75)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />

          {/* Milestone markers (vertical lines and dots) */}
          {milestones && milestones.map((m) => {
            const day = getMilestoneDay(m.targetDate)
            const x = xScale(day)
            const y = yScale(m.targetProgress)
            const isCompleted = m.status === "completed"
            return (
              <g key={m.id}>
                {/* Vertical dashed line */}
                <line
                  x1={x}
                  y1={height - padding}
                  x2={x}
                  y2={y}
                  stroke={isCompleted ? "rgba(139, 92, 246, 0.5)" : "rgba(139, 92, 246, 0.3)"}
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />
                {/* Milestone dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isCompleted ? "1.8" : "1.2"}
                  fill={isCompleted ? "#8b5cf6" : "transparent"}
                  stroke="#8b5cf6"
                  strokeWidth="0.5"
                />
              </g>
            )
          })}

          {/* Ideal trajectory */}
          <path
            d={idealPath}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />

          {/* Real trajectory */}
          {realData.length > 1 && (
            <path
              d={realPath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current point */}
          {realData.length > 0 && (
            <circle
              cx={xScale(realData[realData.length - 1].day)}
              cy={yScale(realData[realData.length - 1].real!)}
              r="1.5"
              fill="hsl(var(--primary))"
            />
          )}
        </svg>
      </div>

      {/* Milestones timeline below chart */}
      {milestones && milestones.length > 0 && (
        <div className="flex justify-between px-1 pt-2">
          {milestones.slice(0, 4).map((m) => (
            <div key={m.id} className="text-center">
              <div className={cn(
                "w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1",
                m.status === "completed" ? "bg-violet-500 text-white" :
                m.status === "in_progress" ? "bg-violet-500/30 text-violet-400 border border-violet-500" :
                "bg-white/5 text-muted-foreground border border-white/10"
              )}>
                {m.status === "completed" ? "✓" : milestones.indexOf(m) + 1}
              </div>
              <p className="text-[9px] text-muted-foreground truncate max-w-[60px]">{m.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projection message */}
      <p className="text-sm text-muted-foreground text-center">
        {projectionMessage}
      </p>
    </div>
  )
}

// Task Flow
function TaskFlow({
  previous,
  current,
  next
}: {
  previous?: string
  current?: string
  next?: string
}) {
  return (
    <div className="liquid-glass p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Zap className="h-3.5 w-3.5" />
        Task Flow
      </div>

      <div className="space-y-3">
        {/* Previous */}
        {previous && (
          <div className="flex items-start gap-3 opacity-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
              <p className="text-sm line-through">{previous}</p>
            </div>
          </div>
        )}

        {/* Current */}
        {current && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Play className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-primary uppercase tracking-wider font-medium">Now</p>
              <p className="text-sm font-medium">{current}</p>
            </div>
          </div>
        )}

        {/* Next */}
        {next && (
          <div className="flex items-start gap-3 opacity-50">
            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next</p>
              <p className="text-sm">{next}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 4-1-1 Snapshot
function FourOneOneSnapshot({
  annual,
  monthly,
  weekly
}: {
  annual?: string
  monthly?: string
  weekly?: string
}) {
  return (
    <div className="liquid-glass p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Calendar className="h-3.5 w-3.5" />
        4-1-1 Focus
      </div>

      <div className="space-y-2">
        {weekly && (
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-[10px] text-primary uppercase tracking-wider">This Week</p>
            <p className="text-sm font-medium truncate">{weekly}</p>
          </div>
        )}

        {monthly && (
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Month</p>
            <p className="text-sm truncate">{monthly}</p>
          </div>
        )}

        {annual && (
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Year</p>
            <p className="text-sm truncate">{annual}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Momentum Block
function MomentumBlock({
  completed,
  expected
}: {
  completed: number
  expected: number
}) {
  const percentage = expected > 0 ? Math.round((completed / expected) * 100) : 0
  const isStrong = percentage >= 80

  return (
    <div className="liquid-glass p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Flame className="h-3.5 w-3.5" />
        Momentum
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold tabular-nums">
            {completed}<span className="text-lg text-muted-foreground">/{expected}</span>
          </p>
          <p className="text-xs text-muted-foreground">focus sessions</p>
        </div>

        <div className={`text-right ${isStrong ? 'text-emerald-400' : 'text-muted-foreground'}`}>
          <p className="text-sm font-medium">{percentage}%</p>
          <p className="text-xs">consistency</p>
        </div>
      </div>

      {/* Mini bar chart representation */}
      <div className="flex gap-1">
        {Array.from({ length: expected }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-sm ${
              i < completed ? 'bg-primary' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Impact Distribution
function ImpactBlock({
  highImpact,
  lowImpact
}: {
  highImpact: number
  lowImpact: number
}) {
  const total = highImpact + lowImpact
  const highPercent = total > 0 ? Math.round((highImpact / total) * 100) : 0
  const isHealthy = highPercent >= 70

  return (
    <div className="liquid-glass p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <BarChart3 className="h-3.5 w-3.5" />
        Impact
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">High-impact work</span>
          <span className={`text-sm font-medium ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
            {highPercent}%
          </span>
        </div>

        {/* Stacked bar */}
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-primary rounded-l-full"
            style={{ width: `${highPercent}%` }}
          />
          <div
            className="h-full bg-white/20"
            style={{ width: `${100 - highPercent}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {isHealthy
            ? "Energy well spent on what matters."
            : "Consider reducing low-value tasks."
          }
        </p>
      </div>
    </div>
  )
}

// Last Insight
function InsightBlock({ insight }: { insight: string }) {
  return (
    <div className="liquid-glass p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
          <Lightbulb className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            System Insight
          </p>
          <p className="text-sm leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN DASHBOARD
// ============================================
export default function DashboardPage() {
  const router = useRouter()
  const {
    objective,
    hasCompletedOnboarding,
    getTimeRemaining,
    dominoChain,
    failObjective,
    resetObjective,
    sessions,
    plannedSessionsPerDay,
    habitChallenge,
    visualPrefs,
    aiRoadmap,
  } = useAppStore()

  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [lastMilestone, setLastMilestone] = useState<number>(() => {
    const progress = objective?.progress ?? 0
    const milestones = [25, 50, 75, 100]
    let initial = 0
    for (const m of milestones) {
      if (progress >= m) initial = m
    }
    return initial
  })
  const hasHydrated = useHasHydrated()
  const timeRemaining = getTimeRemaining()

  const handleAbandonObjective = () => {
    failObjective()
    resetObjective()
    setShowAbandonModal(false)
    router.push("/app/onboarding")
  }

  // Redirect to define if no objective - ONLY after hydration is complete
  useEffect(() => {
    if (hasHydrated && (!hasCompletedOnboarding || !objective)) {
      router.push("/app/onboarding")
    }
  }, [hasHydrated, hasCompletedOnboarding, objective, router])

  // Milestone celebrations
  useEffect(() => {
    if (!objective || !visualPrefs.milestoneAnimations) return

    const progress = objective.progress
    const milestones = [25, 50, 75, 100]

    for (const milestone of milestones) {
      if (progress >= milestone && lastMilestone < milestone) {
        setLastMilestone(milestone)

        // Trigger celebration confetti
        const duration = 3000
        const end = Date.now() + duration

        const colors = milestone === 100
          ? ["#FFD700", "#FFA500", "#00ff88"] // Gold for 100%
          : milestone === 75
          ? ["#8b5cf6", "#06b6d4", "#00ff88"]
          : milestone === 50
          ? ["#00ff88", "#06b6d4"]
          : ["#00ff88"]

        const frame = () => {
          confetti({
            particleCount: milestone === 100 ? 5 : 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors,
          })
          confetti({
            particleCount: milestone === 100 ? 5 : 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors,
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }
        frame()
        break
      }
    }
  }, [objective?.progress, visualPrefs.milestoneAnimations, lastMilestone])

  // Memoized calculations
  const dashboardData = useMemo(() => {
    if (!objective) return null

    const startDate = new Date(objective.createdAt)
    const endDate = new Date(objective.deadline)
    const now = new Date()

    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    const { status, reason } = getProjectStatus(objective.progress, daysElapsed, totalDays)
    const { projectedDays, delta, message } = getProjectedCompletion(objective.progress, daysElapsed, totalDays)
    const trajectoryData = generateTrajectoryData(totalDays, daysElapsed, objective.progress)

    return {
      totalDays,
      daysElapsed,
      daysRemaining,
      status,
      reason,
      projectedDays,
      delta,
      projectionMessage: message,
      trajectoryData,
    }
  }, [objective])

  // Loading state - wait for hydration before rendering
  if (!hasHydrated || !objective || !dashboardData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Target className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  // Real data from store
  const objectiveSessions = sessions.filter(s => s.objectiveId === objective.id)
  const completedSessions = objectiveSessions.length
  const expectedSessions = dashboardData.daysElapsed * plannedSessionsPerDay

  // Calculate total focus time
  const totalFocusMinutes = objectiveSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
  const totalDistractions = objectiveSessions.reduce((acc, s) => acc + (s.distractions?.length || 0), 0)

  // Impact: sessions with few distractions = high impact
  const highImpactSessions = objectiveSessions.filter(s => (s.distractions?.length || 0) <= 1).length
  const lowImpactSessions = completedSessions - highImpactSessions

  // Dynamic insight based on actual data
  const generateInsight = () => {
    if (completedSessions === 0) {
      return "Aucune session pour le moment. Lance ta première session focus pour commencer !"
    }
    if (dashboardData.status === "off_track" && dashboardData.daysRemaining < 7) {
      return "Temps limité. Concentre-toi sur l'essentiel et protège ton temps de focus."
    }
    if (habitChallenge && habitChallenge.currentStreak >= 7) {
      return `${habitChallenge.currentStreak} jours de suite ! Ta régularité paie. Continue.`
    }
    if (totalDistractions > completedSessions * 2) {
      return "Beaucoup de distractions notées. Renforce ton bunker mode."
    }
    if (highImpactSessions > lowImpactSessions) {
      return "Tes sessions sont efficaces. Peu de distractions = impact maximum."
    }
    return objective.progress < 50
      ? "Phase de construction. Chaque session compte pour créer l'élan."
      : "Tu approches du but. Maintiens le rythme jusqu'à la ligne d'arrivée."
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header with visual effects */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl overflow-hidden",
            visualPrefs.breathingGradient && "bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5"
          )}
        >
          {/* Breathing gradient overlay */}
          {visualPrefs.breathingGradient && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-violet-500/10 pointer-events-none"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <div className="relative z-10 flex items-center gap-4">
            {/* Lock icon with circular progress */}
            <div className="relative">
              {visualPrefs.circularProgress && (
                <svg className="absolute -inset-1 w-12 h-12" viewBox="0 0 48 48">
                  {/* Background circle */}
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/10"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - objective.progress / 100)}
                    transform="rotate(-90 24 24)"
                    initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - objective.progress / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                "bg-primary/10 border border-primary/20"
              )}>
                <Image src="/cadenas.png" alt="Locked" width={32} height={32} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="uppercase tracking-wider">Active Contract</span>
                {visualPrefs.circularProgress && (
                  <span className="text-primary font-medium">{objective.progress}%</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {objective.title}
              </h1>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            {/* Streak Fire Animation */}
            {visualPrefs.streakFire && habitChallenge && habitChallenge.currentStreak >= 7 && (
              <motion.div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20"
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(249, 115, 22, 0)",
                    "0 0 20px 5px rgba(249, 115, 22, 0.3)",
                    "0 0 0 0 rgba(249, 115, 22, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Flame className="h-4 w-4 text-orange-500" />
                </motion.div>
                <span className="text-sm font-bold text-orange-500">
                  {habitChallenge.currentStreak}
                </span>
              </motion.div>
            )}
            <StatusBadge status={dashboardData.status} />
          </div>
        </motion.header>

        {/* Top Row: Chrono + Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <ChronoBlock
            daysRemaining={dashboardData.daysRemaining}
            projectedDays={dashboardData.projectedDays}
            totalDays={dashboardData.totalDays}
            delta={dashboardData.delta}
          />
          <ProjectStatusBlock
            status={dashboardData.status}
            reason={dashboardData.reason}
          />
        </motion.div>

        {/* Trajectory Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TrajectoryChart
            data={dashboardData.trajectoryData}
            projectionMessage={dashboardData.projectionMessage}
            milestones={aiRoadmap?.milestones}
            totalDays={dashboardData.totalDays}
            startDate={objective.createdAt}
          />
        </motion.div>

        {/* AI Insights - Main feature */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <AIInsights />
        </motion.div>

        {/* Task Flow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TaskFlow
            previous={objective.todayGoal ? "Define daily priority" : undefined}
            current={objective.rightNowAction || "No active task"}
            next={objective.weekGoal ? "Complete weekly milestone" : undefined}
          />
        </motion.div>

        {/* Bottom Row: 4-1-1 + Momentum + Impact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <FourOneOneSnapshot
            annual={objective.yearGoal}
            monthly={objective.monthGoal}
            weekly={objective.weekGoal}
          />
          <MomentumBlock
            completed={completedSessions}
            expected={Math.max(1, expectedSessions)}
          />
          <ImpactBlock
            highImpact={highImpactSessions}
            lowImpact={lowImpactSessions}
          />
        </motion.div>

        {/* Insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <InsightBlock insight={generateInsight()} />
        </motion.div>

        {/* Action Zone (subtle) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-4"
        >
          <Link href="/app/focus">
            <button className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/20 transition-all text-sm text-muted-foreground hover:text-foreground">
              <Play className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span>Enter Focus Mode</span>
              <ArrowRight className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
          </Link>
        </motion.div>

        {/* Abandon Objective */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center pt-8 pb-4"
        >
          <button
            onClick={() => setShowAbandonModal(true)}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-muted-foreground/60 hover:text-red-400 transition-colors"
          >
            <Flag className="h-3 w-3" />
            <span>Abandonner cet objectif</span>
          </button>
        </motion.div>

      </div>

      {/* Abandon Confirmation Modal */}
      <AnimatePresence>
        {showAbandonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowAbandonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass p-6 w-full max-w-md border border-red-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Abandonner l'objectif
                </h2>
                <button
                  onClick={() => setShowAbandonModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Es-tu sûr de vouloir abandonner <span className="text-foreground font-medium">"{objective?.title}"</span> ?
                <br /><br />
                Cette action est irréversible. Ton contrat sera marqué comme rompu et tu devras définir un nouvel objectif.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbandonModal(false)}
                  className="flex-1 h-12 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAbandonObjective}
                  className="flex-1 h-12 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm font-medium text-red-400"
                >
                  Oui, abandonner
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
