"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
  Target,
  Clock,
  Flame,
  Zap,
  Play,
  ArrowRight,
  Flag,
  X,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Mountain,
  Sun,
  GitBranch,
  Shield,
  BarChart3,
  Sparkles,
  Send,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { useHasSyncedRemote } from "@/hooks/use-supabase-sync"
import { AIInsights } from "@/components/app/ai-insights"
import { cn } from "@/lib/utils"

// ============================================
// UTILITY FUNCTIONS
// ============================================
type ProjectStatus = "on_track" | "at_risk" | "off_track"

function getProjectStatus(
  progress: number,
  daysElapsed: number,
  totalDays: number,
  lang: 'en' | 'fr'
): { status: ProjectStatus; label: string; color: string } {
  const expectedProgress = (daysElapsed / totalDays) * 100
  const delta = progress - expectedProgress

  if (delta >= -5) {
    return { status: "on_track", label: lang === 'fr' ? "En bonne voie" : "On track", color: "emerald" }
  } else if (delta >= -20) {
    return { status: "at_risk", label: lang === 'fr' ? "Attention requise" : "Attention required", color: "amber" }
  } else {
    return { status: "off_track", label: lang === 'fr' ? "Hors piste" : "Off track", color: "red" }
  }
}

// ============================================
// HERO SECTION - The Command Center
// ============================================
function HeroSection({
  title,
  progress,
  status,
  statusLabel,
  statusColor,
  daysRemaining,
  totalDays,
  streak,
  hasStreak,
}: {
  title: string
  progress: number
  status: ProjectStatus
  statusLabel: string
  statusColor: string
  daysRemaining: number
  totalDays: number
  streak: number
  hasStreak: boolean
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const circumference = 2 * Math.PI * 58
  const strokeDashoffset = circumference * (1 - progress / 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-violet-500/8" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Subtle grain */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

          {/* Progress Ring */}
          <div className="relative shrink-0">
            <svg width="136" height="136" viewBox="0 0 136 136" className="drop-shadow-lg">
              {/* Glow filter */}
              <defs>
                <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Background track */}
              <circle cx="68" cy="68" r="58" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/[0.06]" />
              {/* Progress arc */}
              <motion.circle
                cx="68" cy="68" r="58"
                fill="none"
                stroke="url(#heroGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 68 68)"
                filter="url(#glow)"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Image src="/cadenas.png" alt="" width={28} height={28} className="mb-1 opacity-60" />
              <motion.span
                className="text-2xl font-bold tabular-nums"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {progress}%
              </motion.span>
            </div>
          </div>

          {/* Title & Status */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider",
                statusColor === "emerald" && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
                statusColor === "amber" && "bg-amber-500/10 border border-amber-500/20 text-amber-400",
                statusColor === "red" && "bg-red-500/10 border border-red-500/20 text-red-400",
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  statusColor === "emerald" && "bg-emerald-400",
                  statusColor === "amber" && "bg-amber-400",
                  statusColor === "red" && "bg-red-400",
                )} />
                {statusLabel}
              </div>

              {hasStreak && streak >= 3 && (
                <motion.div
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-[11px] font-bold text-orange-500 tabular-nums">{streak}{t('d', 'j')}</span>
                </motion.div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
              {title}
            </h1>

            {/* Time bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {daysRemaining > 0 ? `${daysRemaining} ${t('days remaining', 'jours restants')}` : t("Deadline reached", "Deadline atteinte")}
                </span>
                <span className="tabular-nums">{totalDays - daysRemaining}/{totalDays}{t('d', 'j')}</span>
              </div>
              <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-white/20 to-white/10"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// STATS STRIP - Key metrics at a glance
// ============================================
function StatsStrip({
  sessions,
  totalMinutes,
  dominosCompleted,
  dominosTotal,
  streak,
}: {
  sessions: number
  totalMinutes: number
  dominosCompleted: number
  dominosTotal: number
  streak: number
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const stats = [
    {
      label: "Sessions",
      value: sessions.toString(),
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      label: t("Focus time", "Temps focus"),
      value: totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? (totalMinutes % 60).toString().padStart(2, '0') : ''}` : `${totalMinutes}m`,
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Dominos",
      value: `${dominosCompleted}`,
      sub: `/${dominosTotal}`,
      icon: GitBranch,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Streak",
      value: `${streak}${t('d', 'j')}`,
      icon: Flame,
      color: streak >= 7 ? "text-orange-400" : "text-muted-foreground",
      bg: streak >= 7 ? "bg-orange-500/10 border-orange-500/20" : "bg-white/5 border-white/10",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="liquid-glass p-4 flex items-center gap-3"
          >
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", stat.bg)}>
              <Icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums leading-none">
                {stat.value}
                {stat.sub && <span className="text-sm text-muted-foreground">{stat.sub}</span>}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// ============================================
// ACTION CARD - What to do RIGHT NOW
// ============================================
function ActionCard({
  rightNowAction,
  todayGoal,
  weekGoal,
}: {
  rightNowAction: string
  todayGoal: string
  weekGoal: string
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const {
    rightNowCompleted,
    todayGoalCompleted,
    completeRightNow,
    completeTodayGoal,
    setNewRightNowAction,
    visualPrefs,
  } = useAppStore()

  const [newAction, setNewAction] = useState("")
  const [showDominoFell, setShowDominoFell] = useState(false)

  const handleCompleteToday = () => {
    completeTodayGoal()
    setShowDominoFell(true)
    // Confetti celebration
    if (visualPrefs.confettiOnComplete) {
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ["#00ff88", "#06b6d4", "#8b5cf6"] })
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ["#00ff88", "#06b6d4", "#8b5cf6"] })
    }
    setTimeout(() => setShowDominoFell(false), 3000)
  }

  const handleSetNewAction = () => {
    if (newAction.trim()) {
      setNewRightNowAction(newAction.trim())
      setNewAction("")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/20 p-px">
        <div className="h-full w-full rounded-2xl bg-background" />
      </div>

      <div className="relative z-10 p-5 sm:p-6">
        {/* Cascade flow */}
        <div className="space-y-4">
          {/* Week goal - context */}
          <div className="flex items-start gap-3 opacity-50">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-medium">{t("This week", "Cette semaine")}</p>
              <p className="text-sm truncate">{weekGoal || t("Not defined", "Non d\u00e9fini")}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 rotate-90" />
          </div>

          {/* Today goal — with check button */}
          <div className={cn(
            "flex items-start gap-3 rounded-xl p-3 -mx-3 transition-all duration-300",
            todayGoalCompleted
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "opacity-70"
          )}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0 mt-0.5">
              <Sun className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-orange-400 uppercase tracking-wider font-medium">{t("Today", "Aujourd'hui")}</p>
              <p className={cn(
                "text-sm",
                todayGoalCompleted && "line-through text-emerald-400"
              )}>
                {todayGoal || t("Not defined", "Non d\u00e9fini")}
              </p>
              {/* Domino fell message */}
              <AnimatePresence>
                {showDominoFell && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-emerald-400 font-medium mt-1"
                  >
                    {t("Domino fell!", "Domino tomb\u00e9 !")} 🎯
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {/* Check button */}
            {!todayGoalCompleted ? (
              <motion.button
                onClick={handleCompleteToday}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="shrink-0 mt-1 p-1 rounded-full hover:bg-emerald-500/10 transition-colors"
                title={t("Mark as done", "Marquer comme fait")}
              >
                <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-emerald-400 transition-colors" />
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="shrink-0 mt-1 p-1"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </motion.div>
            )}
          </div>

          <div className="flex justify-center">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 rotate-90" />
          </div>

          {/* RIGHT NOW - The main action — with check button */}
          <div className={cn(
            "p-4 rounded-xl transition-all duration-300",
            rightNowCompleted
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-primary/[0.06] border border-primary/15"
          )}>
            <div className="flex items-start gap-3">
              {!rightNowCompleted ? (
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 shrink-0"
                  animate={{ boxShadow: ["0 0 0 0 hsla(var(--primary), 0)", "0 0 20px 4px hsla(var(--primary), 0.15)", "0 0 0 0 hsla(var(--primary), 0)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Zap className="h-4.5 w-4.5 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 shrink-0"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </motion.div>
              )}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[10px] uppercase tracking-wider font-semibold mb-1",
                  rightNowCompleted ? "text-emerald-400" : "text-primary"
                )}>
                  {rightNowCompleted ? t("Done", "Fait") : t("Right now", "Maintenant")}
                </p>
                <p className={cn(
                  "text-base sm:text-lg font-semibold leading-snug",
                  rightNowCompleted && "line-through text-emerald-400/70"
                )}>
                  {rightNowAction || t("No action defined", "Aucune action d\u00e9finie")}
                </p>
              </div>
              {/* Check button */}
              {!rightNowCompleted && (
                <motion.button
                  onClick={completeRightNow}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="shrink-0 mt-1 p-1 rounded-full hover:bg-emerald-500/10 transition-colors"
                  title={t("Mark as done", "Marquer comme fait")}
                >
                  <Circle className="h-6 w-6 text-muted-foreground/40 hover:text-emerald-400 transition-colors" />
                </motion.button>
              )}
            </div>

            {/* New action input after completion */}
            <AnimatePresence>
              {rightNowCompleted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-emerald-500/20"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                    {t("What's next?", "Et ensuite ?")}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSetNewAction()}
                      placeholder={t("Next action...", "Prochaine action...")}
                      className="flex-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <motion.button
                      onClick={handleSetNewAction}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!newAction.trim()}
                      className="h-9 px-3 rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-30 flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <Link href="/app/focus" className="block">
            <motion.button
              className="relative w-full h-12 rounded-xl overflow-hidden group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative z-10 flex items-center justify-center gap-2 text-sm font-medium text-primary-foreground">
                <Play className="h-4 w-4" />
                <span>{t("Start a focus session", "Lancer une session focus")}</span>
                <ArrowRight className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </div>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// TRAJECTORY CHART - Redesigned
// ============================================
function TrajectoryCard({
  progress,
  daysElapsed,
  totalDays,
  delta,
}: {
  progress: number
  daysElapsed: number
  totalDays: number
  delta: number
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const width = 200
  const height = 60
  const padding = 4

  const points = useMemo(() => {
    const pts: { day: number; ideal: number; real: number | null }[] = []
    const step = Math.max(1, Math.floor(totalDays / 40))
    for (let day = 0; day <= totalDays; day += step) {
      const ideal = (day / totalDays) * 100
      const real = day <= daysElapsed ? (daysElapsed > 0 ? (day / daysElapsed) * progress : 0) : null
      pts.push({ day, ideal, real })
    }
    // Ensure last point
    if (pts[pts.length - 1]?.day !== totalDays) {
      pts.push({ day: totalDays, ideal: 100, real: null })
    }
    return pts
  }, [totalDays, daysElapsed, progress])

  const xScale = (day: number) => padding + (day / totalDays) * (width - padding * 2)
  const yScale = (value: number) => height - padding - (value / 100) * (height - padding * 2)

  const idealPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.day)} ${yScale(p.ideal)}`).join(' ')
  const realData = points.filter(p => p.real !== null)
  const realPath = realData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.day)} ${yScale(p.real!)}`).join(' ')

  // Fill area under real curve
  const realFill = realData.length > 1
    ? `${realPath} L ${xScale(realData[realData.length - 1].day)} ${height - padding} L ${xScale(realData[0].day)} ${height - padding} Z`
    : ''

  const DeltaIcon = delta >= 0 ? TrendingUp : TrendingDown

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="liquid-glass p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">{t("Trajectory", "Trajectoire")}</span>
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium", delta >= 0 ? "text-emerald-400" : "text-red-400")}>
          <DeltaIcon className="h-3.5 w-3.5" />
          {delta >= 0 ? `+${delta}${t('d ahead', 'j d\'avance')}` : `${Math.abs(delta)}${t('d behind', 'j de retard')}`}
        </div>
      </div>

      <div className="relative h-20 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="realFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[25, 50, 75].map(v => (
            <line key={v} x1={padding} y1={yScale(v)} x2={width - padding} y2={yScale(v)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
          ))}

          {/* Ideal trajectory - dashed */}
          <path d={idealPath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" strokeDasharray="3,3" />

          {/* Real fill */}
          {realData.length > 1 && <path d={realFill} fill="url(#realFillGrad)" />}

          {/* Real line */}
          {realData.length > 1 && (
            <path d={realPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Current point */}
          {realData.length > 0 && (
            <g>
              <circle cx={xScale(realData[realData.length - 1].day)} cy={yScale(realData[realData.length - 1].real!)} r="3" fill="hsl(var(--primary))" />
              <circle cx={xScale(realData[realData.length - 1].day)} cy={yScale(realData[realData.length - 1].real!)} r="6" fill="hsl(var(--primary))" opacity="0.2" />
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded bg-white/15" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 3px, transparent 3px, transparent 6px)" }} />
          <span>Ideal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded bg-primary" />
          <span>{t("Real", "R\u00e9el")}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// QUICK NAV - Navigate to key pages
// ============================================
function QuickNav() {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const links = [
    { href: "/app/domino", label: "Domino", sublabel: t("Progress", "Progression"), icon: GitBranch, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { href: "/app/focus", label: "Focus", sublabel: "Session", icon: Target, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { href: "/app/habit", label: t("66 Days", "66 Jours"), sublabel: t("Habit", "Habitude"), icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { href: "/app/shield", label: t("Shield", "Bouclier"), sublabel: t("Protection", "Protection"), icon: Shield, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {links.map((link, i) => {
        const Icon = link.icon
        return (
          <Link key={link.href} href={link.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="liquid-glass p-4 flex flex-col items-center gap-2 hover:bg-white/[0.03] transition-all group cursor-pointer"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-110", link.bg)}>
                <Icon className={cn("h-5 w-5", link.color)} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">{link.label}</p>
                <p className="text-[10px] text-muted-foreground">{link.sublabel}</p>
              </div>
            </motion.div>
          </Link>
        )
      })}
    </motion.div>
  )
}

// ============================================
// INSIGHT CARD - Dynamic insight
// ============================================
function InsightCard({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="liquid-glass p-4 flex items-start gap-3"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
        <Sparkles className="h-4 w-4 text-amber-400" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pt-1">{text}</p>
    </motion.div>
  )
}

// ============================================
// CONTRACT INDICATOR - Tension visual
// ============================================
function ContractIndicator({ state, tensionLevel }: { state: string; tensionLevel: number }) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  if (state === "stable" && tensionLevel < 10) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={cn(
        "rounded-xl p-3 flex items-center gap-3 text-sm",
        state === "tension" && "bg-amber-500/5 border border-amber-500/15",
        state === "broken" && "bg-red-500/5 border border-red-500/15",
      )}
    >
      <AlertTriangle className={cn(
        "h-4 w-4 shrink-0",
        state === "tension" ? "text-amber-400" : "text-red-400"
      )} />
      <p className={cn(
        state === "tension" ? "text-amber-400" : "text-red-400"
      )}>
        {state === "tension"
          ? t(`Contract under tension. ${Math.round(tensionLevel)}% pressure accumulated.`, `Contrat sous tension. ${Math.round(tensionLevel)}% de pression accumul\u00e9e.`)
          : t("Contract broken. Deadline has passed.", "Contrat rompu. La deadline est d\u00e9pass\u00e9e.")
        }
      </p>
    </motion.div>
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
    dominoChain,
    failObjective,
    resetObjective,
    sessions,
    plannedSessionsPerDay,
    habitChallenge,
    visualPrefs,
    contractMeter,
  } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

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
  const hasSyncedRemote = useHasSyncedRemote()

  const handleAbandonObjective = () => {
    failObjective()
    resetObjective()
    setShowAbandonModal(false)
    // objective becomes null → useEffect redirects to onboarding
  }

  // Show empty state if no objective (no redirect)

  // Milestone celebrations
  useEffect(() => {
    if (!objective || !visualPrefs.milestoneAnimations) return

    const progress = objective.progress
    const milestones = [25, 50, 75, 100]

    for (const milestone of milestones) {
      if (progress >= milestone && lastMilestone < milestone) {
        setLastMilestone(milestone)

        const duration = 3000
        const end = Date.now() + duration
        const colors = milestone === 100
          ? ["#FFD700", "#FFA500", "#00ff88"]
          : milestone === 75 ? ["#8b5cf6", "#06b6d4", "#00ff88"]
          : milestone === 50 ? ["#00ff88", "#06b6d4"]
          : ["#00ff88"]

        const frame = () => {
          confetti({ particleCount: milestone === 100 ? 5 : 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors })
          confetti({ particleCount: milestone === 100 ? 5 : 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
        break
      }
    }
  }, [objective?.progress, visualPrefs.milestoneAnimations, lastMilestone])

  // Dashboard computed data
  const dashboardData = useMemo(() => {
    if (!objective) return null

    const startDate = new Date(objective.createdAt)
    const endDate = new Date(objective.deadline)
    const now = new Date()

    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    const { status, label, color } = getProjectStatus(objective.progress, daysElapsed, totalDays, lang)

    // Projection
    let delta = 0
    if (objective.progress > 0 && daysElapsed > 0) {
      const dailyRate = objective.progress / daysElapsed
      const projectedDays = Math.ceil(100 / dailyRate)
      delta = totalDays - projectedDays
    }

    return { totalDays, daysElapsed, daysRemaining, status, statusLabel: label, statusColor: color, delta }
  }, [objective, lang])

  // No objective — send to onboarding (but wait for remote sync first)
  useEffect(() => {
    if (hasHydrated && hasSyncedRemote && !objective) {
      router.replace("/app/onboarding")
    }
  }, [hasHydrated, hasSyncedRemote, objective, router])

  // Loading: wait for hydration + remote sync before deciding
  if (!hasHydrated || !hasSyncedRemote || !objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Target className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Target className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  // Real data
  const objectiveSessions = sessions.filter(s => s.objectiveId === objective.id)
  const completedSessions = objectiveSessions.length
  // Only count ACTUAL time worked (from session start to end), never the planned duration
  const totalFocusMinutes = objectiveSessions.reduce((acc, s) => acc + (s.actualDuration ?? 0), 0)
  const streak = habitChallenge?.currentStreak ?? 0

  // Dynamic insight
  const generateInsight = () => {
    if (completedSessions === 0) {
      return t(
        "No sessions yet. Start your first focus session to trigger the domino effect.",
        "Aucune session pour le moment. Lance ta premiere session focus pour declencher l'effet domino."
      )
    }
    if (dashboardData.status === "off_track" && dashboardData.daysRemaining < 7) {
      return t(
        "Time is limited. Every minute counts. Focus on the essential.",
        "Temps limite. Chaque minute compte. Concentre-toi sur l'essentiel."
      )
    }
    if (streak >= 7) {
      return t(
        `${streak} days in a row. Your consistency is building something solid.`,
        `${streak} jours de suite. Ta regularite construit quelque chose de solide.`
      )
    }
    if (dashboardData.delta > 5) {
      return t(
        "You're ahead of trajectory. Maintain course without slacking.",
        "Tu es en avance sur la trajectoire. Maintiens le cap sans relacher."
      )
    }
    if (dashboardData.delta < -5) {
      return t(
        "Behind schedule. A focus session today can reverse the trend.",
        "Du retard accumule. Une session focus aujourd'hui peut inverser la tendance."
      )
    }
    const totalDistractions = objectiveSessions.reduce((acc, s) => acc + (s.distractions?.length || 0), 0)
    if (totalDistractions > completedSessions * 2) {
      return t(
        "Many distractions noted. Strengthen your bunker mode before each session.",
        "Beaucoup de distractions notees. Renforce ton bunker mode avant chaque session."
      )
    }
    return objective.progress < 50
      ? t("Building phase. Every session knocks down another domino.", "Phase de construction. Chaque session fait tomber un domino de plus.")
      : t("Nearing the goal. Momentum is on your side.", "Tu approches du but. Le momentum est de ton cote.")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Contract tension indicator */}
        {contractMeter && (
          <ContractIndicator state={contractMeter.state} tensionLevel={contractMeter.tensionLevel} />
        )}

        {/* Hero */}
        <HeroSection
          title={objective.somedayGoal || objective.title}
          progress={objective.progress}
          status={dashboardData.status}
          statusLabel={dashboardData.statusLabel}
          statusColor={dashboardData.statusColor}
          daysRemaining={dashboardData.daysRemaining}
          totalDays={dashboardData.totalDays}
          streak={streak}
          hasStreak={!!habitChallenge}
        />

        {/* Stats Strip */}
        <StatsStrip
          sessions={completedSessions}
          totalMinutes={totalFocusMinutes}
          dominosCompleted={dominoChain?.completedDominos ?? 0}
          dominosTotal={dominoChain?.totalDominos ?? 0}
          streak={streak}
        />

        {/* Two-column layout: Action + Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ActionCard
            rightNowAction={objective.rightNowAction}
            todayGoal={objective.todayGoal}
            weekGoal={objective.weekGoal}
          />
          <div className="space-y-5">
            <TrajectoryCard
              progress={objective.progress}
              daysElapsed={dashboardData.daysElapsed}
              totalDays={dashboardData.totalDays}
              delta={dashboardData.delta}
            />
            <InsightCard text={generateInsight()} />
          </div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <AIInsights />
        </motion.div>

        {/* Quick Nav */}
        <QuickNav />

        {/* The Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4"
        >
          <p className="text-sm text-muted-foreground/50 italic leading-relaxed max-w-lg mx-auto">
            {t(
              '"What is the ONE thing I can do, such that by doing it, everything else will become easier or unnecessary?"',
              '"Quelle est la SEULE chose que je puisse faire, telle qu\'en la faisant, tout le reste deviendra plus simple ou inutile ?"'
            )}
          </p>
        </motion.div>

        {/* Abandon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pb-4"
        >
          <button
            onClick={() => setShowAbandonModal(true)}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-muted-foreground/40 hover:text-red-400 transition-colors"
          >
            <Flag className="h-3 w-3" />
            <span>{t("Abandon this objective", "Abandonner cet objectif")}</span>
          </button>
        </motion.div>
      </div>

      {/* Abandon Modal */}
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
                  {t("Abandon objective", "Abandonner l'objectif")}
                </h2>
                <button
                  onClick={() => setShowAbandonModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {t("Are you sure you want to abandon", "Es-tu sur de vouloir abandonner")} <span className="text-foreground font-medium">&quot;{objective?.somedayGoal || objective?.title}&quot;</span> ?
                <br /><br />
                {t(
                  "This action is irreversible. Your contract will be marked as broken and you will need to define a new objective.",
                  "Cette action est irreversible. Ton contrat sera marque comme rompu et tu devras definir un nouvel objectif."
                )}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbandonModal(false)}
                  className="flex-1 h-12 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  {t("Cancel", "Annuler")}
                </button>
                <button
                  onClick={handleAbandonObjective}
                  className="flex-1 h-12 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm font-medium text-red-400"
                >
                  {t("Yes, abandon", "Oui, abandonner")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
