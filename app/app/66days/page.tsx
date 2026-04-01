"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertTriangle, Trophy, Sparkles, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"

const SESSION_OPTIONS = [
  { value: 15, label: "15 min", description: "Light commitment" },
  { value: 30, label: "30 min", description: "Moderate focus" },
  { value: 50, label: "50 min", description: "Deep work" },
]

export default function SixtyDaysPage() {
  const router      = useRouter()
  const hasHydrated = useHasHydrated()
  const {
    objective,
    habitChallenge,
    initHabitChallenge,
    markDayComplete,
    getHabitProgress,
  } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t    = (en: string, fr: string) => lang === "fr" ? fr : en

  const [selectedMinutes, setSelectedMinutes] = useState(30)

  useEffect(() => {
    if (hasHydrated && !objective) router.replace("/app")
  }, [hasHydrated, objective, router])

  const progress = getHabitProgress()

  const dayGrid = useMemo(() => {
    if (!habitChallenge) return []
    const startDate = new Date(habitChallenge.startDate)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    return Array.from({ length: 66 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      date.setHours(0, 0, 0, 0)
      const dateStr   = date.toLocaleDateString("en-CA")
      const dayRecord = habitChallenge.days.find(d => d.date === dateStr)
      return {
        dayNumber: i + 1,
        date: dateStr,
        isCompleted:    dayRecord?.completed ?? false,
        sessionMinutes: dayRecord?.sessionMinutes,
        isToday:  date.getTime() === today.getTime(),
        isPast:   date.getTime() <  today.getTime(),
        isFuture: date.getTime() >  today.getTime(),
      }
    })
  }, [habitChallenge])

  const yesterdayMissed = useMemo(() => {
    if (!habitChallenge || dayGrid.length === 0) return false
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const startDate = new Date(habitChallenge.startDate); startDate.setHours(0, 0, 0, 0)
    if (yesterday < startDate) return false
    const rec = habitChallenge.days.find(d => d.date === yesterday.toLocaleDateString("en-CA"))
    return !rec?.completed
  }, [habitChallenge, dayGrid])

  const todayCompleted = useMemo(() => {
    const today = dayGrid.find(d => d.isToday)
    return today?.isCompleted ?? false
  }, [dayGrid])

  if (!hasHydrated || !objective) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Setup screen ──
  if (!habitChallenge) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-6 relative z-10"
        >
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <Flame className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">{t("66-Day Challenge", "Défi 66 Jours")}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {t(
                "Research shows it takes ~66 days to form a lasting habit. Commit to daily focus sessions on your ONE thing.",
                "La recherche montre qu'il faut ~66 jours pour ancrer une habitude. Engage-toi pour des sessions focus quotidiennes."
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium text-center mb-4">
              {t("Minimum daily commitment", "Engagement quotidien minimum")}
            </p>
            {SESSION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedMinutes(opt.value)}
                className={[
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all border-2",
                  selectedMinutes === opt.value
                    ? "bg-primary/8 border-primary/40 text-foreground"
                    : "bg-white/[0.02] border-transparent hover:border-white/[0.08]"
                ].join(" ")}
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{t(opt.description, opt.description)}</p>
                </div>
                {selectedMinutes === opt.value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>

          <Button
            onClick={() => initHabitChallenge(selectedMinutes)}
            className="w-full h-13 rounded-xl text-sm font-semibold"
          >
            <Flame className="mr-2 h-4 w-4" />
            {t("Start the challenge", "Commencer le défi")}
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── Active challenge ──
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-orange-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-2"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-medium mb-1">
            {t("Plugin", "Plugin")}
          </p>
          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight">
            {t("66-Day Challenge", "Défi 66 Jours")}
          </h1>
          <p className="text-[13px] text-muted-foreground/60 mt-1">
            {habitChallenge.minimumSessionMinutes} min / {t("day minimum", "jour minimum")}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: progress.day,                      label: t("Day", "Jour"),   color: "text-foreground" },
            { value: progress.streak,                    label: t("Streak", "Série"), color: "text-orange-400" },
            { value: habitChallenge.longestStreak ?? 0,  label: t("Best", "Record"), color: "text-amber-400" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p className={["text-2xl font-black tabular-nums", stat.color].join(" ")}>{stat.value}</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div className="flex justify-between text-[11px] mb-2">
            <span className="text-muted-foreground/50">{t("Progress", "Progression")}</span>
            <span className="font-semibold text-primary">{progress.percentage}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
            />
          </div>
          <p className="text-[11px] text-muted-foreground/40 text-center mt-2">
            {habitChallenge.days.filter(d => d.completed).length} / 66 {t("days", "jours")}
          </p>
        </motion.div>

        {/* Never miss twice */}
        <AnimatePresence>
          {yesterdayMissed && !todayCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/8 border border-orange-500/20"
            >
              <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-400">{t("Never miss twice!", "Ne rate jamais deux fois !")}</p>
                <p className="text-xs text-muted-foreground/60">
                  {t("You missed yesterday. Don't let the chain break further.", "Tu as raté hier. Ne laisse pas la chaîne se briser.")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mark today */}
        {!todayCompleted ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Button
              onClick={() => markDayComplete(new Date().toLocaleDateString("en-CA"), habitChallenge.minimumSessionMinutes)}
              className="w-full h-12 rounded-xl text-sm font-semibold"
            >
              <Check className="mr-2 h-4 w-4" />
              {t("Mark today complete", "Valider aujourd'hui")}
            </Button>
            <p className="text-[11px] text-muted-foreground/35 text-center mt-2">
              {t("Or complete a focus session to auto-mark", "Ou fais une session focus pour valider automatiquement")}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/15"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{t("Today complete!", "Journée complète !")}</span>
          </motion.div>
        )}

        {/* 66-day grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40 font-semibold mb-4">
            {t("Your 66 days", "Tes 66 jours")}
          </p>
          <div className="grid grid-cols-11 gap-1.5 sm:gap-2">
            {dayGrid.map(day => (
              <motion.div
                key={day.dayNumber}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: day.dayNumber * 0.008, duration: 0.15 }}
                className={[
                  "aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all cursor-default",
                  day.isCompleted
                    ? "bg-primary text-primary-foreground shadow-[0_0_8px_rgba(0,255,136,0.3)]"
                    : day.isToday
                    ? "bg-orange-500/15 border border-orange-500/40 text-orange-400"
                    : day.isPast
                    ? "bg-red-500/[0.07] text-red-400/40"
                    : "bg-white/[0.03] text-muted-foreground/20",
                ].join(" ")}
              >
                {day.isCompleted ? <Check className="h-2.5 w-2.5" /> : day.dayNumber}
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {[
              { cls: "bg-primary",             label: t("Done", "Fait") },
              { cls: "border border-orange-500/40 bg-orange-500/15", label: t("Today", "Auj.") },
              { cls: "bg-red-500/[0.07]",       label: t("Missed", "Raté") },
              { cls: "bg-white/[0.03]",          label: t("Upcoming", "À venir") },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={["w-3 h-3 rounded", item.cls].join(" ")} />
                <span className="text-[10px] text-muted-foreground/40">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
