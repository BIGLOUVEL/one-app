"use client"

import { useEffect, useState, useMemo, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
  Play,
  ArrowRight,
  Flag,
  X,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Send,
  RotateCcw,
  Plus,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { Logo } from "@/components/ui/logo"
import { useHasSyncedRemote } from "@/hooks/use-supabase-sync"
import { FocusingQuestionDrawer } from "@/components/app/focusing-question-drawer"
import { LoopIndicator } from "@/components/app/loop-indicator"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// HOME STATE — 4 distinct modes, derived from store
// ─────────────────────────────────────────────────────────────────────────────
type HomeState = "ready" | "in-session" | "done" | "empty"

function getHomeState(
  rightNowAction: string,
  rightNowCompleted: boolean,
  todayGoalCompleted: boolean,
  hasActiveSession: boolean,
): HomeState {
  if (hasActiveSession) return "in-session"
  if (todayGoalCompleted) return "done"
  if (!rightNowAction.trim()) return "empty"
  return "ready"
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status, label }: { status: string; label: string }) {
  const color =
    status === "on_track" ? "emerald" :
    status === "at_risk"  ? "amber"   : "red"

  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider",
      color === "emerald" && "text-emerald-400",
      color === "amber"   && "text-amber-400",
      color === "red"     && "text-red-400",
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        color === "emerald" && "bg-emerald-400",
        color === "amber"   && "bg-amber-400",
        color === "red"     && "bg-red-400",
      )} />
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME HERO — The launch pad. One card, 4 states.
// ─────────────────────────────────────────────────────────────────────────────
function HomeHero({
  homeState,
  rightNowAction,
  rightNowCompleted,
  weekGoal,
  todayGoal,
  somedayGoal,
  currentMilestone,
  dayNumber,
  totalDays,
  isOverdue,
  statusLabel,
  projectStatus,
  streak,
  momentumToday,
  showWeekNudge,
  onCompleteRightNow,
  onSetNewAction,
  onDefineTomorrow,
  onUncompleteRightNow,
  onPlanWeek,
}: {
  homeState: HomeState
  rightNowAction: string
  rightNowCompleted: boolean
  weekGoal: string
  todayGoal: string
  somedayGoal: string
  currentMilestone: string | null
  dayNumber: number
  totalDays: number
  isOverdue: boolean
  statusLabel: string
  projectStatus: string
  streak: number
  momentumToday: number
  showWeekNudge: boolean
  onCompleteRightNow: () => void
  onUncompleteRightNow: () => void
  onSetNewAction: (action: string) => void
  onDefineTomorrow: () => void
  onPlanWeek: () => void
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en
  const [newAction, setNewAction] = useState("")

  const handleSubmitAction = () => {
    if (newAction.trim()) {
      onSetNewAction(newAction.trim())
      setNewAction("")
    }
  }

  // Chain next rightNow action without closing the day
  const handleChainAction = () => {
    if (!newAction.trim()) return
    onSetNewAction(newAction.trim())
    onUncompleteRightNow()
    setNewAction("")
  }

  const isOffTrack = projectStatus === "off_track"
  const isAtRisk   = projectStatus === "at_risk"

  // Shared card wrapper
  const Card = ({ children, accent }: { children: ReactNode; accent?: string }) => (
    <div className={cn(
      "rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden",
      accent && `border-t-2 ${accent}`
    )}>
      {children}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence mode="wait">

        {/* ── READY ─────────────────────────────────────────── */}
        {homeState === "ready" && (
          <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Card accent={isOffTrack ? "border-red-500/50" : isAtRisk ? "border-amber-500/50" : "border-primary/40"}>
              <div className="p-5">
                {/* Top row: context + status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    {currentMilestone && (
                      <p className="text-[10px] text-primary/35 font-semibold truncate uppercase tracking-wider">
                        {currentMilestone}
                      </p>
                    )}
                    {!currentMilestone && weekGoal && <p className="text-[10px] text-white/20 truncate">{weekGoal}</p>}
                    {todayGoal && <p className="text-xs text-white/50 font-medium truncate mt-0.5">{todayGoal}</p>}
                  </div>
                  <StatusPill status={projectStatus} label={statusLabel} />
                </div>

                {/* Label */}
                <p className={cn(
                  "text-[10px] uppercase tracking-[0.25em] font-bold mb-2.5",
                  isOffTrack ? "text-red-400/60" : "text-primary/60"
                )}>
                  {t("Right now", "Maintenant")}
                </p>

                {/* Action */}
                <div className="flex items-start gap-3 mb-5">
                  <p className="flex-1 text-[20px] sm:text-[22px] font-bold leading-snug tracking-tight text-white">
                    {rightNowAction}
                  </p>
                  <motion.button
                    onClick={rightNowCompleted ? onUncompleteRightNow : onCompleteRightNow}
                    whileTap={{ scale: 0.82 }}
                    className="shrink-0 mt-0.5 outline-none"
                  >
                    {rightNowCompleted
                      ? <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      : <Circle className="h-6 w-6 text-white/[0.12] hover:text-white/30 transition-colors" />
                    }
                  </motion.button>
                </div>

                {/* CTA */}
                {rightNowCompleted ? (
                  <div className="space-y-2">
                    {/* Chain next action */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAction}
                        onChange={(e) => setNewAction(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleChainAction()}
                        placeholder={t("What's your next action?", "Quelle est ta prochaine action ?")}
                        autoFocus
                        className="flex-1 h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/25 transition-all"
                      />
                      <motion.button
                        onClick={handleChainAction}
                        whileTap={{ scale: 0.93 }}
                        disabled={!newAction.trim()}
                        className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors disabled:opacity-20"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                    {/* Close day — secondary, subtle */}
                    <button
                      onClick={onDefineTomorrow}
                      className="w-full h-9 text-[11px] text-white/20 hover:text-emerald-400/60 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {t("That was my last one — close today", "C'était ma dernière — clore la journée")}
                    </button>
                  </div>
                ) : (
                  <Link href="/app/focus">
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center px-5 hover:opacity-90 transition-opacity group"
                    >
                      <Play className="h-4 w-4 mr-2.5 shrink-0" />
                      <span className="flex-1 text-left">{t("Start focus session", "Lancer une session focus")}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-white/[0.01]">
                <p className="text-[10px] text-white/18 italic truncate max-w-[60%]">{somedayGoal}</p>
                {momentumToday > 0 && (
                  <span className="text-[10px] text-primary/40 font-semibold shrink-0">
                    {momentumToday} {momentumToday === 1 ? t("today", "aujourd'hui") : t("today", "aujourd'hui")}
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── IN SESSION ────────────────────────────────────── */}
        {homeState === "in-session" && (
          <motion.div key="in-session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Card accent="border-primary/40">
              <div className="p-5">
                {/* Session pulse */}
                <div className="flex items-center gap-2 mb-4">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  <span className="text-[10px] text-primary/70 uppercase tracking-[0.25em] font-bold">
                    {t("Session active", "Session active")}
                  </span>
                </div>

                {/* Action */}
                <p className="text-[20px] sm:text-[22px] font-bold leading-snug tracking-tight text-white mb-5">
                  {rightNowAction}
                </p>

                {/* CTA */}
                <Link href="/app/focus">
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-11 rounded-xl border border-primary/25 text-primary text-sm font-semibold flex items-center px-5 hover:bg-primary/[0.06] transition-colors group"
                  >
                    <RotateCcw className="h-4 w-4 mr-2.5 shrink-0" />
                    <span className="flex-1 text-left">{t("Return to session", "Reprendre la session")}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" />
                  </motion.button>
                </Link>
              </div>
              <div className="flex items-center px-5 py-3 border-t border-white/[0.04] bg-white/[0.01]">
                <p className="text-[10px] text-white/18 italic truncate">{somedayGoal}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── DONE ──────────────────────────────────────────── */}
        {homeState === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Card accent="border-emerald-500/40">
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/70 shrink-0" />
                    <span className="text-[10px] text-emerald-400/70 uppercase tracking-[0.25em] font-bold">
                      {t("Done", "Accompli")}
                    </span>
                  </div>
                  {/* Momentum today */}
                  {momentumToday > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-[10px] font-bold text-primary tabular-nums">
                        {momentumToday}
                      </span>
                      <span className="text-[10px] text-white/25">
                        {momentumToday === 1
                          ? t("action today", "action aujourd'hui")
                          : t("actions today", "actions aujourd'hui")
                        }
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Completed action */}
                <p className="text-[17px] font-bold leading-snug tracking-tight text-emerald-400/30 line-through decoration-1 decoration-emerald-500/20 mb-1.5">
                  {todayGoal || rightNowAction}
                </p>
                <p className="text-[11px] text-white/18 mb-5">
                  {t("Next action unlocked.", "Prochaine action débloquée.")}
                </p>

                <div className="space-y-2">
                  <motion.button
                    onClick={onDefineTomorrow}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center px-5 hover:opacity-90 transition-opacity group"
                  >
                    <span className="flex-1 text-left">{t("Define next action", "Définir la prochaine action")}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </motion.button>

                  {showWeekNudge && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      onClick={onPlanWeek}
                      className="w-full flex items-center justify-between px-5 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all group"
                    >
                      <span className="text-xs font-medium text-white/35">{t("Plan this week", "Planifie cette semaine")}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-white/15 group-hover:text-white/35 transition-colors" />
                    </motion.button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── EMPTY ─────────────────────────────────────────── */}
        {homeState === "empty" && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Card>
              <div className="p-5">
                <p className="text-[10px] text-white/25 uppercase tracking-[0.25em] font-bold mb-3">
                  {t("Right now", "Maintenant")}
                </p>
                <p className="text-[18px] font-semibold leading-snug text-white/20 italic mb-5">
                  {t("What's the ONE thing you can do right now?", "Quelle est la SEULE chose que tu peux faire là ?")}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitAction()}
                    placeholder={t("Type your action...", "Tape ton action...")}
                    autoFocus
                    className="flex-1 h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-primary/25 transition-all"
                  />
                  <motion.button
                    onClick={handleSubmitAction}
                    whileTap={{ scale: 0.93 }}
                    disabled={!newAction.trim()}
                    className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary/22 transition-colors disabled:opacity-20"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>

                <Link href="/app/define">
                  <button className="mt-2 w-full h-9 text-xs text-white/18 hover:text-white/32 flex items-center justify-center gap-1.5 transition-colors">
                    <Plus className="h-3 w-3" />
                    {t("Or update my objective cascade", "Ou mettre à jour mon objectif")}
                  </button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OBJECTIVE PROGRESS BAR — day timeline + % completion
// ─────────────────────────────────────────────────────────────────────────────
function ObjectiveProgressBar() {
  const objective = useAppStore(s => s.objective)
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  if (!objective || objective.status !== "active") return null

  const startDate = new Date(objective.createdAt)
  const endDate   = new Date(objective.deadline)
  const now       = new Date()
  const totalDays      = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
  const rawRemaining   = Math.ceil((endDate.getTime() - now.getTime()) / 86400000)
  const isOverdue      = rawRemaining < 0
  const daysRemaining  = Math.max(0, rawRemaining)
  const dayNumber      = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / 86400000))
  const progress       = objective.progress

  const timeElapsed = Math.min(100, (dayNumber / totalDays) * 100)
  const isAhead = progress >= timeElapsed

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="space-y-2"
    >
      {/* Labels */}
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-[10px] tabular-nums font-mono",
          isOverdue ? "text-amber-400/50" : "text-white/20"
        )}>
          {isOverdue
            ? t("Overdue", "En retard")
            : t(`Day ${dayNumber} / ${totalDays}`, `Jour ${dayNumber} / ${totalDays}`)
          }
        </span>
        <span className={cn(
          "text-[10px] font-mono tabular-nums font-semibold",
          isAhead ? "text-primary/55" : "text-amber-400/50"
        )}>
          {progress}%
        </span>
      </div>

      {/* Track: time elapsed (dim) over progress (bright) */}
      <div className="relative h-[2px] w-full rounded-full bg-white/[0.04]">
        {/* Time elapsed */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ width: `${timeElapsed}%`, originX: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-white/[0.07]"
        />
        {/* Completion progress */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ width: `${progress}%`, originX: 0, background: "hsl(var(--primary) / 0.7)" }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 rounded-full"
        />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPACT STATS — pill cells, no fluff
// ─────────────────────────────────────────────────────────────────────────────
function CompactStats({
  sessions,
  totalMinutes,
  streak,
  momentumToday,
}: {
  sessions: number
  totalMinutes: number
  streak: number
  momentumToday: number
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  const stats = [
    momentumToday > 0 && {
      value: `${momentumToday}`,
      label: t("today", "aujourd'hui"),
      highlight: true,
    },
    sessions > 0 && {
      value: sessions.toString(),
      label: sessions === 1 ? t("session", "session") : t("sessions", "sessions"),
      highlight: false,
    },
    totalMinutes > 0 && {
      value: totalMinutes >= 60
        ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? String(totalMinutes % 60).padStart(2, "0") : ""}`
        : `${totalMinutes}m`,
      label: t("focused", "concentré"),
      highlight: false,
    },
    streak >= 2 && {
      value: `🔥 ${streak}${t("d", "j")}`,
      label: "streak",
      highlight: false,
    },
  ].filter(Boolean) as { value: string; label: string; highlight: boolean }[]

  if (stats.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-center gap-2 flex-wrap"
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
            stat.highlight
              ? "border-primary/20 bg-primary/[0.06]"
              : "border-white/[0.07] bg-white/[0.02]"
          )}
        >
          <span className={cn(
            "text-xs font-semibold tabular-nums",
            stat.highlight ? "text-primary/70" : "text-foreground/55"
          )}>{stat.value}</span>
          <span className="text-[10px] text-muted-foreground/30">{stat.label}</span>
        </div>
      ))}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOMORROW MODAL — triggered on today goal completion
// ─────────────────────────────────────────────────────────────────────────────
function TomorrowModal({
  show,
  onConfirm,
  onSkip,
}: {
  show: boolean
  onConfirm: (goal: string) => void
  onSkip: () => void
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en
  const [goal, setGoal] = useState("")

  useEffect(() => {
    if (show) setGoal("")
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            className="liquid-glass p-6 w-full max-w-md rounded-2xl border border-emerald-500/20 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {t("Domino fell.", "Domino tombé.")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("What's tomorrow's ONE thing?", "Quel est le ONE Thing de demain ?")}
                </p>
              </div>
            </div>

            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goal.trim() && onConfirm(goal)}
              placeholder={t("Tomorrow's action...", "Action de demain...")}
              autoFocus
              className={cn(
                "w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm",
                "placeholder:text-muted-foreground/30 focus:outline-none",
                "focus:ring-1 focus:ring-primary/30 focus:border-primary/20"
              )}
            />

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex-1 h-11 rounded-xl border border-white/10 text-sm text-muted-foreground hover:bg-white/5 transition-colors"
              >
                {t("Skip", "Passer")}
              </button>
              <motion.button
                onClick={() => goal.trim() && onConfirm(goal)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!goal.trim()}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-30 transition-all"
              >
                {t("Set for tomorrow", "Définir pour demain")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT CHECK — "Did this move you forward?"
// ─────────────────────────────────────────────────────────────────────────────
type ImpactPhase = "question" | "yes" | "no"

function ImpactCheckModal({
  show,
  action,
  onYes,
  onNo,
}: {
  show: boolean
  action: string
  onYes: () => void
  onNo: () => void
}) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en
  const [phase, setPhase] = useState<ImpactPhase>("question")

  // Reset phase when modal opens
  useEffect(() => {
    if (show) setPhase("question")
  }, [show])

  const handleYes = () => {
    setPhase("yes")
    setTimeout(() => onYes(), 1800)
  }

  const handleNo = () => {
    setPhase("no")
    setTimeout(() => onNo(), 1800)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">

              {/* ── QUESTION ── */}
              {phase === "question" && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="p-6"
                >
                  {/* Completed indicator */}
                  <div className="flex items-center gap-2 mb-5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-emerald-400/70">
                      {t("Action completed", "Action complétée")}
                    </span>
                  </div>

                  {/* Completed action */}
                  <p className="text-sm text-white/40 line-through decoration-white/20 mb-6 leading-relaxed">
                    {action}
                  </p>

                  {/* Question */}
                  <p className="text-base font-semibold text-white mb-6 leading-snug">
                    {t(
                      "Did this move you closer to your objective?",
                      "Cette action t'a-t-elle rapproché de ton objectif ?"
                    )}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleNo}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 h-11 rounded-xl border border-white/[0.08] text-sm font-medium text-white/40 hover:text-white/60 hover:border-white/[0.14] transition-all"
                    >
                      {t("Not really", "Pas vraiment")}
                    </motion.button>
                    <motion.button
                      onClick={handleYes}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      {t("Yes", "Oui")}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── YES — Trajectory updated ── */}
              {phase === "yes" && (
                <motion.div
                  key="yes"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-8 flex flex-col items-center text-center gap-4"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.05 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/25"
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div className="space-y-1">
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-sm font-bold text-white"
                    >
                      {t("Trajectory updated", "Trajectoire mise à jour")}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-[11px] text-primary/60 font-semibold tracking-wide"
                    >
                      {t("Momentum +1", "Momentum +1")}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.3, duration: 1.4, ease: "linear" }}
                    className="h-[2px] bg-primary/40 rounded-full"
                  />
                </motion.div>
              )}

              {/* ── NO — Redefine ── */}
              {phase === "no" && (
                <motion.div
                  key="no"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-8 flex flex-col items-center text-center gap-4"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.05 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/25"
                  >
                    <ArrowRight className="h-6 w-6 text-amber-400 rotate-[-45deg]" />
                  </motion.div>
                  <div className="space-y-1.5">
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-sm font-bold text-white"
                    >
                      {t("Let's redefine the next move.", "Redéfinissons la prochaine action.")}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-[11px] text-white/30"
                    >
                      {t("This action may not have been high impact.", "Cette action n'était peut-être pas la plus importante.")}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.3, duration: 1.4, ease: "linear" }}
                    className="h-[2px] bg-amber-500/30 rounded-full"
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function getProjectStatus(
  progress: number,
  daysElapsed: number,
  totalDays: number,
  lang: "en" | "fr"
): { status: string; label: string } {
  const expectedProgress = (daysElapsed / totalDays) * 100
  const delta = progress - expectedProgress
  if (delta >= -5)  return { status: "on_track", label: lang === "fr" ? "Dans le rythme" : "On track" }
  if (delta >= -20) return { status: "at_risk",  label: lang === "fr" ? "Rattraper aujourd'hui" : "Catch up today" }
  return              { status: "off_track", label: lang === "fr" ? "Session urgente" : "Needs a session" }
}

export default function DashboardPage() {
  const router = useRouter()
  const {
    objective,
    dominoChain,
    failObjective,
    resetObjective,
    sessions,
    habitChallenge,
    visualPrefs,
    currentSession,
    rightNowCompleted,
    todayGoalCompleted,
    completeRightNow,
    uncompleteRightNow,
    completeTodayGoal,
    resetTodayGoal,
    updateCascade,
    setNewRightNowAction,
    fourOneOne,
  } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  const [showAbandonModal, setShowAbandonModal]         = useState(false)
  const [showFocusingQuestion, setShowFocusingQuestion] = useState(false)
  const [showTomorrowModal, setShowTomorrowModal]       = useState(false)
  const [showImpactCheck, setShowImpactCheck]           = useState(false)
  const [lastMilestone, setLastMilestone] = useState<number>(() => {
    const progress = objective?.progress ?? 0
    const milestones = [25, 50, 75, 100]
    let initial = 0
    for (const m of milestones) { if (progress >= m) initial = m }
    return initial
  })

  const hasHydrated     = useHasHydrated()
  const hasSyncedRemote = useHasSyncedRemote()

  // ── Computed data ──────────────────────────────────────────────────────────
  const dashboardData = useMemo(() => {
    if (!objective) return null
    const startDate = new Date(objective.createdAt)
    const endDate   = new Date(objective.deadline)
    const now       = new Date()
    const totalDays      = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
    const daysElapsed    = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / 86400000))
    const rawDaysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / 86400000)
    const isOverdue      = rawDaysRemaining < 0
    const daysRemaining  = Math.max(0, rawDaysRemaining)
    const { status, label } = getProjectStatus(objective.progress, daysElapsed, totalDays, lang)
    return { totalDays, daysElapsed, daysRemaining, isOverdue, status, statusLabel: label, dayNumber: totalDays - daysRemaining }
  }, [objective, lang])

  const objectiveSessions  = sessions.filter(s => s.objectiveId === objective?.id)
  const completedSessions  = objectiveSessions.length
  const totalFocusMinutes  = objectiveSessions.reduce((acc, s) => acc + (s.actualDuration ?? 0), 0)
  const streak             = habitChallenge?.currentStreak ?? 0
  const hasActiveSession   = !!currentSession

  const homeState = objective ? getHomeState(
    objective.rightNowAction,
    rightNowCompleted,
    todayGoalCompleted,
    hasActiveSession,
  ) : "empty"

  // Weekly nudge: show if today is Monday OR 4-1-1 week outcomes not filled
  const isMonday = new Date().getDay() === 1
  const currentWeekOutcomes = fourOneOne?.weeks?.[0]?.outcomes?.filter(Boolean) ?? []
  const showWeekNudge = homeState === "done" && (isMonday || !fourOneOne || currentWeekOutcomes.length === 0)

  // ── Momentum today ────────────────────────────────────────────────────────
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const momentumToday = sessions.filter(s =>
    s.objectiveId === objective?.id &&
    s.endedAt &&
    new Date(s.endedAt) >= todayStart
  ).length

  // ── Current milestone (first non-completed user milestone) ─────────────
  const currentMilestone = objective?.userMilestones?.find(m => !m.completed)?.title ?? null

  // ── Milestone confetti ────────────────────────────────────────────────────
  useEffect(() => {
    if (!objective || !visualPrefs.milestoneAnimations) return
    const progress   = objective.progress
    const milestones = [25, 50, 75, 100]
    for (const milestone of milestones) {
      if (progress >= milestone && lastMilestone < milestone) {
        setLastMilestone(milestone)
        const duration = 3000
        const end = Date.now() + duration
        const colors = milestone === 100 ? ["#FFD700", "#FFA500", "#00ff88"] : ["#00ff88"]
        const frame = () => {
          confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors })
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
        break
      }
    }
  }, [objective?.progress, visualPrefs.milestoneAnimations, lastMilestone])

  // ── Redirect if no objective ──────────────────────────────────────────────
  useEffect(() => {
    if (hasHydrated && hasSyncedRemote && !objective) {
      router.replace("/app/onboarding")
    }
  }, [hasHydrated, hasSyncedRemote, objective, router])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCompleteRightNow = () => {
    completeRightNow()
  }

  const handleCompleteToday = () => {
    completeTodayGoal()
    if (visualPrefs.confettiOnComplete) {
      confetti({ particleCount: 40, angle: 60,  spread: 55, origin: { x: 0, y: 0.7 }, colors: ["#10b723", "#ffffff"] })
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ["#10b723", "#ffffff"] })
    }
    setShowImpactCheck(true)
  }

  const handleImpactYes = () => {
    setShowImpactCheck(false)
    setShowTomorrowModal(true)
  }

  const handleImpactNo = () => {
    setShowImpactCheck(false)
    router.push("/app/define")
  }

  const handleConfirmTomorrow = (goal: string) => {
    if (goal.trim()) {
      updateCascade("todayGoal", goal.trim())
      resetTodayGoal()
    }
    setShowTomorrowModal(false)
  }

  const handleAbandonObjective = () => {
    failObjective()
    resetObjective()
    setShowAbandonModal(false)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!hasHydrated || !hasSyncedRemote || !objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo size="xl" className="drop-shadow-[0_0_16px_rgba(47,208,22,0.4)]" />
        </motion.div>
      </div>
    )
  }

  if (!dashboardData) return null

  // ── Completed state ───────────────────────────────────────────────────────
  if (objective.status === "completed") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20"
          >
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </motion.div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("Objective complete.", "Objectif accompli.")}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">
                &ldquo;{objective.somedayGoal || objective.title}&rdquo;
              </span>
              <br />
              {t("You stayed locked. One domino at a time.", "Tu es resté verrouillé. Un domino à la fois.")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t("Sessions", "Sessions"), value: completedSessions.toString() },
              { label: t("Days",     "Jours"),    value: `${dashboardData.dayNumber}d` },
              { label: t("Dominos",  "Dominos"),  value: (dominoChain?.completedDominos ?? 0).toString() },
            ].map(stat => (
              <div key={stat.label} className="liquid-glass p-4 text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <Link href="/app/onboarding">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2"
            >
              {t("Define my next ONE Thing", "Définir mon prochain ONE Thing")}
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center px-5 py-8 sm:px-8">
      <div className="max-w-md mx-auto w-full">

        {/* Hero — the launch pad */}
        <HomeHero
          homeState={homeState}
          rightNowAction={objective.rightNowAction}
          rightNowCompleted={rightNowCompleted}
          weekGoal={objective.weekGoal}
          todayGoal={objective.todayGoal}
          somedayGoal={objective.somedayGoal || objective.title}
          currentMilestone={currentMilestone}
          dayNumber={dashboardData.dayNumber}
          totalDays={dashboardData.totalDays}
          isOverdue={dashboardData.isOverdue}
          statusLabel={dashboardData.statusLabel}
          projectStatus={dashboardData.status}
          streak={streak}
          momentumToday={momentumToday}
          showWeekNudge={showWeekNudge}
          onCompleteRightNow={handleCompleteRightNow}
          onUncompleteRightNow={uncompleteRightNow}
          onSetNewAction={setNewRightNowAction}
          onDefineTomorrow={handleCompleteToday}
          onPlanWeek={() => router.push("/app/411")}
        />

        {/* Objective progress */}
        <div className="mt-4">
          <ObjectiveProgressBar />
        </div>

        {/* Loop indicator */}
        <div className="mt-4">
          <LoopIndicator />
        </div>

        {/* Stats */}
        <div className="mt-3">
          <CompactStats
            sessions={completedSessions}
            totalMinutes={totalFocusMinutes}
            streak={streak}
            momentumToday={momentumToday}
          />
        </div>

        {/* Focusing Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => setShowFocusingQuestion(true)}
            className="text-[11px] text-white/12 italic hover:text-white/22 transition-colors leading-relaxed max-w-sm mx-auto block"
          >
            {t(
              '"What is the ONE thing I can do, such that by doing it, everything else becomes easier or unnecessary?"',
              '"Quelle est la SEULE chose que je puisse faire, telle qu\'en la faisant, tout le reste devient plus simple ou inutile ?"'
            )}
          </button>
        </motion.div>

        {/* Abandon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-4 flex justify-center"
        >
          <button
            onClick={() => setShowAbandonModal(true)}
            className="flex items-center gap-1.5 text-[10px] text-white/10 hover:text-red-400/50 transition-colors"
          >
            <Flag className="h-3 w-3" />
            {t("Abandon objective", "Abandonner l'objectif")}
          </button>
        </motion.div>
      </div>

      {/* Impact Check */}
      <ImpactCheckModal
        show={showImpactCheck}
        action={objective.todayGoal || objective.rightNowAction}
        onYes={handleImpactYes}
        onNo={handleImpactNo}
      />

      {/* Modals */}
      <TomorrowModal
        show={showTomorrowModal}
        onConfirm={handleConfirmTomorrow}
        onSkip={() => setShowTomorrowModal(false)}
      />

      <FocusingQuestionDrawer
        open={showFocusingQuestion}
        onClose={() => setShowFocusingQuestion(false)}
        objectiveTitle={objective.somedayGoal || objective.title}
      />

      {/* Abandon modal */}
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
              className="liquid-glass p-6 w-full max-w-md border border-red-500/20 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  {t("Abandon objective", "Abandonner l'objectif")}
                </h2>
                <button
                  onClick={() => setShowAbandonModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {t("Are you sure? Your contract will be marked as broken.", "Tu es sûr ? Ton contrat sera marqué comme rompu.")}
                {" "}<span className="text-foreground/70 font-medium">&ldquo;{objective.somedayGoal || objective.title}&rdquo;</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbandonModal(false)}
                  className="flex-1 h-11 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  {t("Cancel", "Annuler")}
                </button>
                <button
                  onClick={handleAbandonObjective}
                  className="flex-1 h-11 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm font-medium text-red-400"
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
