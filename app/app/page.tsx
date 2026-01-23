"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"

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

// Trajectory Chart (SVG)
function TrajectoryChart({
  data,
  projectionMessage
}: {
  data: TrajectoryPoint[]
  projectionMessage: string
}) {
  const width = 100
  const height = 40
  const padding = 2

  const maxDay = data.length - 1
  const xScale = (day: number) => padding + (day / maxDay) * (width - padding * 2)
  const yScale = (value: number) => height - padding - (value / 100) * (height - padding * 2)

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
  } = useAppStore()

  const [mounted, setMounted] = useState(false)
  const timeRemaining = getTimeRemaining()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to define if no objective
  useEffect(() => {
    if (mounted && (!hasCompletedOnboarding || !objective)) {
      router.push("/app/define")
    }
  }, [mounted, hasCompletedOnboarding, objective, router])

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

  // Loading state
  if (!mounted || !objective || !dashboardData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Target className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  // Generate mock data for demo (replace with real data from store)
  const mockSessions = { completed: dominoChain?.completedDominos || 8, expected: 12 }
  const mockImpact = { highImpact: 14, lowImpact: 4 }
  const mockInsight = objective.progress < 30
    ? "Early stage. Focus on building consistent daily habits before optimizing."
    : objective.progress < 70
    ? "Good momentum. Your most productive hours appear to be in the morning."
    : "Final stretch. Protect your focus time aggressively to close this out."

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span className="uppercase tracking-wider">Active Contract</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {objective.title}
            </h1>
          </div>

          <StatusBadge status={dashboardData.status} />
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
          />
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
            completed={mockSessions.completed}
            expected={mockSessions.expected}
          />
          <ImpactBlock
            highImpact={mockImpact.highImpact}
            lowImpact={mockImpact.lowImpact}
          />
        </motion.div>

        {/* Insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <InsightBlock insight={mockInsight} />
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

      </div>
    </div>
  )
}
