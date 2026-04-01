"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, ChevronDown, Check, AlertTriangle } from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function toDateStr(d: Date) {
  return d.toLocaleDateString("en-CA") // YYYY-MM-DD
}

function getWeekStart(d: Date) {
  const day = d.getDay() // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day // Mon-based
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return mon
}

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"]
const MONTH_LABELS   = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"]

// ─────────────────────────────────────────────────────────────────────────────
// A — PACE HEBDO
// ─────────────────────────────────────────────────────────────────────────────
function PaceCard({ sessionDates }: { sessionDates: Set<string> }) {
  const lang  = useAppStore(s => s.language)
  const t     = (en: string, fr: string) => lang === "fr" ? fr : en

  const today     = new Date()
  const weekStart = getWeekStart(today)

  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return { date: d, str: toDateStr(d), label: WEEKDAY_LABELS[i] }
  })

  const doneThisWeek = days.filter(d => sessionDates.has(d.str)).length
  const todayIdx     = Math.min(today.getDay() === 0 ? 4 : today.getDay() - 1, 4)
  const target       = todayIdx + 1 // expected sessions up to today

  const status: "on" | "risk" | "behind" =
    doneThisWeek >= target   ? "on"
    : doneThisWeek >= target - 1 ? "risk"
    : "behind"

  const pillClass = {
    on:     "bg-primary/10 text-primary border-primary/20",
    risk:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
    behind: "bg-red-500/10 text-red-400 border-red-500/20",
  }[status]

  const pillLabel = {
    on:     t("On pace", "En rythme"),
    risk:   t("Slowing", "Ralentit"),
    behind: t("Behind",  "À la traîne"),
  }[status]

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 font-semibold">
          {t("This week", "Cette semaine")}
        </p>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide border",
          pillClass
        )}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {pillLabel}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {days.map((day, i) => {
          const done    = sessionDates.has(day.str)
          const isToday = toDateStr(today) === day.str
          const isFuture = day.date > today
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "h-3 w-3 rounded-full transition-all",
                done && isToday  && "bg-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-background",
                done && !isToday && "bg-primary shadow-[0_0_8px_rgba(0,255,136,0.4)]",
                !done && isToday && "border border-primary/40 bg-transparent animate-pulse",
                !done && !isToday && !isFuture && "bg-white/[0.08]",
                isFuture && !done && "border border-white/[0.12] bg-transparent",
              )} />
              <span className={cn(
                "text-[9px] font-medium",
                done ? "text-muted-foreground/60" : "text-muted-foreground/25"
              )}>
                {day.label}
              </span>
            </div>
          )
        })}
        <span className="text-[13px] font-semibold tabular-nums ml-auto">
          {doneThisWeek}
          <span className="text-muted-foreground/40 font-normal"> / 5</span>
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// B — CHAIN (GitHub-style)
// ─────────────────────────────────────────────────────────────────────────────
function ChainCard({
  sessionDates,
  startDate,
}: {
  sessionDates: Set<string>
  startDate: Date
}) {
  const lang = useAppStore(s => s.language)
  const t    = (en: string, fr: string) => lang === "fr" ? fr : en

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build grid: start from the monday of the start week, end at sunday of current week
  const gridStart = getWeekStart(startDate)
  const gridEnd   = new Date(getWeekStart(today))
  gridEnd.setDate(gridEnd.getDate() + 6)

  // Columns = full weeks between gridStart and gridEnd
  const totalDays  = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000) + 1
  const totalWeeks = Math.ceil(totalDays / 7)
  const cappedWeeks = Math.min(totalWeeks, 14) // max 14 weeks displayed

  // Build weeks array (most recent on right)
  const weeksOffset = Math.max(0, totalWeeks - cappedWeeks)
  const weeks = Array.from({ length: cappedWeeks }, (_, wi) => {
    return Array.from({ length: 7 }, (_, di) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + (weeksOffset + wi) * 7 + di)
      return d
    })
  })

  // Month labels: show label when month changes at column boundary
  const monthLabels: { col: number; label: string }[] = []
  weeks.forEach((week, wi) => {
    const firstDay = week[0]
    if (wi === 0 || firstDay.getMonth() !== weeks[wi - 1][0].getMonth()) {
      monthLabels.push({ col: wi, label: MONTH_LABELS[firstDay.getMonth()] })
    }
  })

  const startStr = startDate.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" })

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 font-semibold">
          {t("Chain", "Chaîne")}
        </p>
        <p className="text-[10px] text-muted-foreground/30">
          {t("since", "depuis")} {startStr}
        </p>
      </div>

      {/* Month labels */}
      <div className="flex mb-1" style={{ gap: "3px" }}>
        {weeks.map((week, wi) => {
          const ml = monthLabels.find(m => m.col === wi)
          return (
            <div key={wi} className="flex-1 min-w-0">
              {ml ? (
                <span className="text-[9px] text-muted-foreground/30 uppercase tracking-wider leading-none">
                  {ml.label}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Grid: 7 rows × N cols */}
      <div className="flex" style={{ gap: "3px" }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: "3px" }}>
            {week.map((day, di) => {
              day.setHours(0, 0, 0, 0)
              const str       = toDateStr(day)
              const done      = sessionDates.has(str)
              const isToday   = str === toDateStr(today)
              const isFuture  = day > today
              const isPast    = day < startDate

              return (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.003, duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "sm:h-2.5 sm:w-2.5 h-2 w-2 rounded-sm",
                    isPast                       && "bg-transparent",
                    !isPast && isFuture           && "bg-transparent",
                    !isPast && !isFuture && !done && !isToday && "bg-white/[0.05]",
                    done && !isToday             && "bg-primary/70",
                    done && isToday              && "bg-primary ring-1 ring-primary/60 ring-offset-[1px] ring-offset-background",
                    !done && isToday             && "border border-primary/35 bg-transparent",
                  )}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[9px] text-muted-foreground/25">{t("Less", "Moins")}</span>
        {["bg-white/[0.05]", "bg-primary/25", "bg-primary/55", "bg-primary"].map((cls, i) => (
          <div key={i} className={cn("sm:h-2.5 sm:w-2.5 h-2 w-2 rounded-sm", cls)} />
        ))}
        <span className="text-[9px] text-muted-foreground/25">{t("More", "Plus")}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// C — PROJECTION
// ─────────────────────────────────────────────────────────────────────────────
function ProjectionLine({
  sessionCount,
  startDate,
  deadline,
}: {
  sessionCount: number
  startDate: Date
  deadline: Date | null
}) {
  const lang = useAppStore(s => s.language)
  const t    = (en: string, fr: string) => lang === "fr" ? fr : en

  const projection = useMemo(() => {
    if (!deadline || sessionCount < 2) return null

    const now         = new Date()
    const daysElapsed = Math.max(1, (now.getTime() - startDate.getTime()) / 86400000)
    const daysLeft    = Math.ceil((deadline.getTime() - now.getTime()) / 86400000)

    if (daysLeft <= 0) return null

    const sessionsPerDay    = sessionCount / daysElapsed
    const totalDaysForObj   = (deadline.getTime() - startDate.getTime()) / 86400000
    const expectedSessions  = sessionsPerDay * totalDaysForObj
    const projectedFinishIn = daysLeft // days remaining at current pace

    // Compare pace: expected session ratio vs actual
    const expectedRatio = (now.getTime() - startDate.getTime()) / (deadline.getTime() - startDate.getTime())
    const actualRatio   = sessionCount / Math.max(1, expectedSessions)
    const delta         = actualRatio - expectedRatio

    return { daysLeft: projectedFinishIn, delta }
  }, [sessionCount, startDate, deadline])

  if (!projection) return null

  const status: "ahead" | "ok" | "behind" =
    projection.delta > 0.05  ? "ahead"
    : projection.delta > -0.1 ? "ok"
    : "behind"

  const valueClass = {
    ahead:  "text-primary",
    ok:     "text-amber-400",
    behind: "text-red-400",
  }[status]

  const valueText = {
    ahead:  t(`${Math.round(projection.delta * 100)}% ahead of pace`, `${Math.round(projection.delta * 100)}% d'avance`),
    ok:     t(`${projection.daysLeft} days left`, `${projection.daysLeft} jours restants`),
    behind: t(`${Math.round(Math.abs(projection.delta) * 100)}% behind pace`, `${Math.round(Math.abs(projection.delta) * 100)}% de retard`),
  }[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-center gap-2 py-3"
    >
      <span className="text-[13px] text-muted-foreground/40">
        {t("At this pace →", "À ce rythme →")}
      </span>
      <span className={cn("text-[15px] font-bold tabular-nums", valueClass)}>
        {valueText}
      </span>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// D — MILESTONE
// ─────────────────────────────────────────────────────────────────────────────
function MilestoneCard({
  sessionCount,
  targetSessions,
  onDismiss,
}: {
  sessionCount: number
  targetSessions: number
  onDismiss: () => void
}) {
  const lang       = useAppStore(s => s.language)
  const t          = (en: string, fr: string) => lang === "fr" ? fr : en
  const half       = Math.floor(targetSessions / 2)
  const isHalfway  = sessionCount >= half

  if (!isHalfway) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-5 shadow-[0_0_40px_rgba(0,255,136,0.06)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary/60" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-semibold">
            {t("Halfway", "Mi-parcours")}
          </p>
        </div>

        <p className="text-[15px] font-semibold text-foreground/90 leading-snug mb-1">
          {t(`Session ${half} / ${targetSessions}`, `Session ${half} / ${targetSessions}`)}
        </p>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {t(
            "The hard part is behind you. The second half is lighter.",
            "La partie difficile est derrière toi. La deuxième moitié est plus légère."
          )}
        </p>

        {/* Progress bar */}
        <div className="mt-4 mb-1">
          <div className="h-1.5 w-full rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-primary rounded-l-full"
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            />
            <div className="h-full flex-1 bg-white/[0.06] rounded-r-full" />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-primary/60">{half} {t("done", "faites")}</span>
            <span className="text-[10px] text-muted-foreground/35">{half} {t("left", "restantes")}</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="mt-4 ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground/40 hover:text-foreground/60 transition-colors duration-150"
        >
          {t("Continue", "Continuer")}
          <ArrowRight className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState() {
  const lang = useAppStore(s => s.language)
  const t    = (en: string, fr: string) => lang === "fr" ? fr : en
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 flex items-center justify-between gap-3 mb-3">
      <p className="text-[13px] text-muted-foreground/50">
        {t("Start your first session to see your chain.", "Lance ta première session pour voir ta chaîne.")}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MomentumPage() {
  const router       = useRouter()
  const hasHydrated  = useHasHydrated()
  const {
    objective,
    sessions,
    milestoneDismissed,
    dismissMilestone,
  } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t    = (en: string, fr: string) => lang === "fr" ? fr : en

  if (!hasHydrated) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!objective) {
    router.replace("/app")
    return null
  }

  const startDate  = new Date(objective.createdAt)
  const deadline   = objective.deadline ? new Date(objective.deadline) : null
  const objSessions = sessions.filter(s => s.objectiveId === objective.id)
  const sessionCount = objSessions.length

  // Build set of dates with sessions
  const sessionDates = new Set(
    objSessions.map(s => toDateStr(new Date(s.startedAt)))
  )

  const daysElapsed = Math.max(1, Math.ceil((Date.now() - startDate.getTime()) / 86400000))

  // Target sessions: use planned × total days, default 66
  const targetSessions = 66

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      {/* Atmospheric glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-orange-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-3">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-medium mb-1">
            {t("Momentum", "Momentum")}
          </p>
          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-none">
            {t("Progress", "Progression")}
          </h1>
          <p className="text-[13px] text-muted-foreground/60 mt-1.5">
            {sessionCount} {sessionCount === 1 ? t("session", "session") : t("sessions", "sessions")}
            {" · "}
            {t(`${daysElapsed} days in`, `jour ${daysElapsed}`)}
          </p>
        </motion.div>

        {sessionCount === 0 && <EmptyState />}

        {/* A — Pace hebdo */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <PaceCard sessionDates={sessionDates} />
        </motion.div>

        {/* B — Chain */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChainCard sessionDates={sessionDates} startDate={startDate} />
        </motion.div>

        {/* C — Projection */}
        {deadline && sessionCount >= 2 && (
          <ProjectionLine
            sessionCount={sessionCount}
            startDate={startDate}
            deadline={deadline}
          />
        )}

        {/* D — Milestone */}
        {!milestoneDismissed && sessionCount >= Math.floor(targetSessions / 2) && (
          <MilestoneCard
            sessionCount={sessionCount}
            targetSessions={targetSessions}
            onDismiss={dismissMilestone}
          />
        )}

      </div>
    </div>
  )
}
