"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dot,
  Ruler,
  Baby,
  TreePine,
  Building,
  Landmark,
  Mountain,
  MountainSnow,
  Rocket,
  Moon,
  Orbit,
  Check,
  Play,
  ArrowRight,
  Flame,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { DOMINO_LANDMARKS, getDominoLandmarkProgress } from "@/lib/domino-landmarks"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, LucideIcon> = {
  Dot, Ruler, Baby, TreePine, Building, Landmark,
  Mountain, MountainSnow, Rocket, Moon, Orbit,
}

// Gradient colors per landmark index for visual variety
const LANDMARK_COLORS = [
  { from: "from-emerald-500", to: "to-emerald-600", glow: "emerald", hex: "#10b981" },
  { from: "from-teal-500", to: "to-teal-600", glow: "teal", hex: "#14b8a6" },
  { from: "from-cyan-500", to: "to-cyan-600", glow: "cyan", hex: "#06b6d4" },
  { from: "from-blue-500", to: "to-blue-600", glow: "blue", hex: "#3b82f6" },
  { from: "from-indigo-500", to: "to-indigo-600", glow: "indigo", hex: "#6366f1" },
  { from: "from-violet-500", to: "to-violet-600", glow: "violet", hex: "#8b5cf6" },
  { from: "from-purple-500", to: "to-purple-600", glow: "purple", hex: "#a855f7" },
  { from: "from-pink-500", to: "to-pink-600", glow: "pink", hex: "#ec4899" },
  { from: "from-rose-500", to: "to-rose-600", glow: "rose", hex: "#f43f5e" },
  { from: "from-orange-500", to: "to-orange-600", glow: "orange", hex: "#f97316" },
  { from: "from-amber-400", to: "to-amber-500", glow: "amber", hex: "#fbbf24" },
]

export function DominoPath() {
  const { dominoChain, sessions, objective } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const completedDominos = dominoChain?.completedDominos ?? 0
  const totalDominos = dominoChain?.totalDominos ?? 0
  const [hoveredLandmark, setHoveredLandmark] = useState<number | null>(null)

  const { current, next, reached } = useMemo(
    () => getDominoLandmarkProgress(completedDominos),
    [completedDominos]
  )

  const landmarkProgress = useMemo(() => {
    if (!next) return 100
    const prevNumber = current?.number ?? 0
    const range = next.number - prevNumber
    const done = completedDominos - prevNumber
    return range > 0 ? Math.round((done / range) * 100) : 0
  }, [completedDominos, current, next])

  // Recent sessions for momentum
  const recentSessions = useMemo(() => {
    if (!objective) return []
    return sessions
      .filter(s => s.objectiveId === objective.id)
      .slice(-14)
  }, [sessions, objective])

  // 14-day activity grid
  const activityGrid = useMemo(() => {
    const grid: { active: boolean; date: string; label: string }[] = []
    const today = new Date()
    const dayLabels = ["D", "L", "M", "M", "J", "V", "S"]
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const hasSession = recentSessions.some(s => {
        const sDate = (s.endedAt || s.startedAt)?.split("T")[0]
        return sDate === dateStr
      })
      grid.push({ active: hasSession, date: dateStr, label: dayLabels[d.getDay()] })
    }
    return grid
  }, [recentSessions])

  const streak = useMemo(() => {
    let s = 0
    for (let i = activityGrid.length - 1; i >= 0; i--) {
      if (activityGrid[i].active) s++
      else break
    }
    return s
  }, [activityGrid])

  const activeDays = activityGrid.filter(d => d.active).length

  if (!dominoChain) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        {t("No objective defined. Dominos will appear here.", "Aucun objectif défini. Les dominos apparaîtront ici.")}
      </div>
    )
  }

  const CurrentIcon = current ? (ICON_MAP[current.icon] || Dot) : Dot
  const NextIcon = next ? (ICON_MAP[next.icon] || Dot) : null
  const currentColorIdx = current ? DOMINO_LANDMARKS.findIndex(l => l.number === current.number) : 0

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════
          HERO: Current Level — cinematic card
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-violet-500/[0.04]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.05] rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-500/[0.04] rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/4" />

        <div className="relative liquid-glass p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Level icon with glow ring animation */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {/* Orbital ring */}
                <motion.div
                  className="absolute -inset-3 rounded-full border border-primary/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/40" />
                </motion.div>

                {/* Pulse ring */}
                <motion.div
                  className="absolute -inset-2 rounded-2xl border border-primary/15"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Icon container */}
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))`,
                    border: "1px solid hsl(var(--primary) / 0.2)",
                    boxShadow: "0 0 30px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--primary) / 0.1)",
                  }}
                >
                  <CurrentIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </motion.div>
              </div>

              <div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1"
                >
                  {t("Current level", "Niveau actuel")}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                >
                  {current?.name ?? t("Start", "Départ")}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground mt-0.5"
                >
                  {current?.heightLabel ?? "5 cm"} {current?.description ? `— ${current.description}` : ""}
                </motion.p>
              </div>
            </div>

            {/* Domino counter — big number */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="sm:ml-auto text-left sm:text-right"
            >
              <div className="flex items-baseline gap-1.5 sm:justify-end">
                <motion.span
                  key={completedDominos}
                  initial={{ y: -20, opacity: 0, scale: 1.2 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-5xl sm:text-6xl font-black tabular-nums text-primary"
                  style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.25)" }}
                >
                  {completedDominos}
                </motion.span>
                <span className="text-lg text-muted-foreground/50 font-medium">
                  /{totalDominos}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'fr'
                  ? `domino${completedDominos !== 1 ? "s" : ""} tombé${completedDominos !== 1 ? "s" : ""}`
                  : `domino${completedDominos !== 1 ? "s" : ""} fallen`}
              </p>
            </motion.div>
          </div>

          {/* Progress to next landmark */}
          {next && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative mt-6 pt-5 border-t border-border/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {NextIcon && (
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <NextIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {t("Next: ", "Prochain : ")}<span className="text-foreground font-semibold">{next.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs tabular-nums font-bold text-primary">
                    {next.number - completedDominos}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{lang === 'fr' ? `restant${next.number - completedDominos > 1 ? "s" : ""}` : "remaining"}</span>
                </div>
              </div>

              {/* Animated progress bar */}
              <div className="relative h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${landmarkProgress}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
                    boxShadow: "0 0 20px hsl(var(--primary) / 0.3)",
                  }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${landmarkProgress}%` }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Moon reached state */}
          {!next && completedDominos >= 57 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative mt-6 pt-5 border-t border-border/30 text-center"
            >
              <motion.p
                className="text-primary font-bold text-lg"
                animate={{ textShadow: ["0 0 20px hsl(var(--primary) / 0.3)", "0 0 40px hsl(var(--primary) / 0.5)", "0 0 20px hsl(var(--primary) / 0.3)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {t("You have reached the Moon.", "Tu as atteint la Lune.")}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-1">{t("384,400 km of geometric progression.", "384 400 km de progression géométrique.")}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          DOMINO CHAIN — 3D isometric falling dominos
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="liquid-glass p-5 sm:p-6 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {t("Domino chain", "Chaîne de dominos")}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-5 rounded-sm bg-primary/60 rotate-[60deg]" />
              <span className="text-[9px] text-muted-foreground">{t("Fallen", "Tombé")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-5 rounded-sm bg-white/10 border border-white/20" />
              <span className="text-[9px] text-muted-foreground">{t("Standing", "Debout")}</span>
            </div>
          </div>
        </div>

        {/* The domino chain visual */}
        <div className="relative flex items-end gap-[3px] sm:gap-1 h-24 sm:h-32 overflow-x-auto pb-2 scrollbar-hide">
          {/* Render up to 30 visible dominos */}
          {Array.from({ length: Math.min(totalDominos, 40) }, (_, i) => {
            const isFallen = i < completedDominos
            const isLast = i === completedDominos - 1
            const isNext = i === completedDominos
            // Height grows slightly with index for perspective
            const baseHeight = 40 + Math.min(i * 1.5, 40)

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.8), duration: 0.3 }}
                className="relative flex-shrink-0"
                style={{ height: `${baseHeight}%` }}
              >
                <motion.div
                  initial={isFallen ? { rotateZ: 0 } : false}
                  animate={{
                    rotateZ: isFallen ? 60 : 0,
                    originY: 1,
                    originX: 0.5,
                  }}
                  transition={
                    isFallen
                      ? { duration: 0.4, ease: "easeIn", delay: Math.min(i * 0.03, 0.6) }
                      : undefined
                  }
                  className={cn(
                    "relative w-2.5 sm:w-3.5 h-full rounded-sm transition-colors",
                    isFallen
                      ? "bg-gradient-to-t from-primary/80 to-primary/40"
                      : isNext
                      ? "bg-white/15 border border-primary/30"
                      : "bg-white/[0.06] border border-white/[0.08]"
                  )}
                  style={
                    isFallen
                      ? { boxShadow: `0 0 ${isLast ? 12 : 6}px hsl(var(--primary) / ${isLast ? 0.4 : 0.15})` }
                      : isNext
                      ? { boxShadow: "0 0 10px hsl(var(--primary) / 0.1)" }
                      : undefined
                  }
                >
                  {/* Dots on domino */}
                  {!isFallen && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                    </div>
                  )}

                  {/* Glow on the last fallen domino */}
                  {isLast && (
                    <motion.div
                      className="absolute -inset-1 rounded-sm pointer-events-none"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ boxShadow: "0 0 15px hsl(var(--primary) / 0.4)" }}
                    />
                  )}

                  {/* Pulse on next domino */}
                  {isNext && (
                    <motion.div
                      className="absolute -inset-0.5 rounded-sm border border-primary/20 pointer-events-none"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </motion.div>
            )
          })}

          {/* "More" indicator if totalDominos > 40 */}
          {totalDominos > 40 && (
            <div className="flex-shrink-0 flex items-center justify-center px-2 self-center">
              <span className="text-[10px] text-muted-foreground/40">+{totalDominos - 40}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          MILESTONE JOURNEY — Horizontal scrollable
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {t("Journey — From Earth to the Moon", "Parcours — De la Terre à la Lune")}
          </p>
          <p className="text-[10px] text-muted-foreground tabular-nums">
            {reached.length}/{DOMINO_LANDMARKS.length} {t("levels", "paliers")}
          </p>
        </div>

        <div className="relative">
          {/* Vertical timeline */}
          <div className="absolute left-[19px] sm:left-[23px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-border/50 via-border/30 to-border/10 rounded-full" />

          {/* Completed progress line */}
          {completedDominos > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: `${(() => {
                  const reachedCount = reached.length
                  if (reachedCount === DOMINO_LANDMARKS.length) return 100
                  const base = (reachedCount / DOMINO_LANDMARKS.length) * 100
                  if (next) {
                    const prevN = current?.number ?? 0
                    const range = next.number - prevN
                    const done = completedDominos - prevN
                    const seg = range > 0 ? done / range : 0
                    return base + (seg * (100 / DOMINO_LANDMARKS.length))
                  }
                  return base
                })()}%`,
              }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="absolute left-[19px] sm:left-[23px] top-0 w-[2px] rounded-full"
              style={{
                background: "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.3))",
                boxShadow: "0 0 8px hsl(var(--primary) / 0.3)",
              }}
            />
          )}

          <div className="space-y-0">
            {DOMINO_LANDMARKS.map((landmark, i) => {
              const isReached = completedDominos >= landmark.number
              const isCurrentLevel = current?.number === landmark.number
              const isNextLevel = next?.number === landmark.number
              const Icon = ICON_MAP[landmark.icon] || Dot
              const dominosNeeded = landmark.number - completedDominos
              const colorSet = LANDMARK_COLORS[i % LANDMARK_COLORS.length]

              return (
                <motion.div
                  key={landmark.number}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
                  onMouseEnter={() => setHoveredLandmark(landmark.number)}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  className={cn(
                    "relative flex items-start gap-4 py-3 sm:py-3.5 pl-10 sm:pl-14 pr-3 rounded-xl transition-all duration-300",
                    isReached && "hover:bg-white/[0.02]",
                    isCurrentLevel && "bg-primary/[0.03]",
                    isNextLevel && "bg-white/[0.02]",
                    !isReached && !isNextLevel && "opacity-30"
                  )}
                >
                  {/* Timeline node */}
                  <div className="absolute left-0 top-3 sm:top-3.5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 300 }}
                      className={cn(
                        "w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] rounded-xl flex items-center justify-center transition-all",
                        isReached
                          ? `bg-gradient-to-br ${colorSet.from} ${colorSet.to} text-white shadow-lg`
                          : isNextLevel
                          ? "bg-background border-2 border-primary/40 text-primary"
                          : "bg-background border border-border text-muted-foreground/30"
                      )}
                      style={isReached ? {
                        boxShadow: `0 4px 20px ${colorSet.hex}30, 0 0 0 1px ${colorSet.hex}20`,
                      } : isNextLevel ? {
                        boxShadow: "0 0 20px hsl(var(--primary) / 0.15)",
                      } : undefined}
                    >
                      {isReached ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </motion.div>

                    {/* Pulse on next level */}
                    {isNextLevel && (
                      <motion.div
                        className="absolute -inset-1 rounded-xl border border-primary/20 pointer-events-none"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className={cn(
                        "text-sm sm:text-[15px] font-semibold tracking-tight",
                        isReached || isNextLevel ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {landmark.name}
                      </h3>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-md font-bold tabular-nums",
                        isReached
                          ? "bg-white/10 text-white/70"
                          : "bg-secondary text-muted-foreground/60"
                      )}>
                        #{landmark.number}
                      </span>
                      {isCurrentLevel && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[8px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider border border-primary/20"
                        >
                          {t("Here", "Ici")}
                        </motion.span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-muted-foreground font-medium">{landmark.heightLabel}</span>
                      <span className="text-muted-foreground/20">&middot;</span>
                      <span className="text-xs text-muted-foreground/70">{landmark.description}</span>
                    </div>

                    {/* Mini progress bar for next level */}
                    {isNextLevel && dominosNeeded > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-2.5 flex items-center gap-2.5"
                      >
                        <div className="h-1.5 flex-1 max-w-[180px] bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${landmarkProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
                            className="h-full rounded-full bg-primary/50"
                          />
                        </div>
                        <span className="text-[10px] text-primary font-semibold tabular-nums">{landmarkProgress}%</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Right side indicator for reached */}
                  {isReached && !isCurrentLevel && (
                    <div className="pt-2">
                      <Icon className="w-4 h-4" style={{ color: `${colorSet.hex}40` }} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          MOMENTUM — 14 Day Activity
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="liquid-glass p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Momentum
            </p>
            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20"
              >
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-400 tabular-nums">{streak}{t("d", "j")}</span>
              </motion.div>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">{t("Last 14 days", "14 derniers jours")}</p>
        </div>

        {/* Activity grid — larger, with day labels */}
        <div className="space-y-1.5">
          <div className="flex gap-1.5 sm:gap-2">
            {activityGrid.map((day, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.5 + i * 0.03,
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-full aspect-square rounded-lg transition-all relative overflow-hidden",
                    day.active
                      ? "bg-primary/50"
                      : "bg-white/[0.03] border border-white/[0.04]"
                  )}
                  style={day.active ? {
                    boxShadow: "0 0 12px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--primary) / 0.2)",
                  } : undefined}
                >
                  {day.active && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </div>
                <span className="text-[8px] text-muted-foreground/40 font-medium">{day.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/20">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-lg font-bold text-foreground tabular-nums">{activeDays}</span>
              <span className="text-xs text-muted-foreground ml-1">{t("/ 14 days", "/ 14 jours")}</span>
            </div>
            <div className="h-4 w-px bg-border/30" />
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold tabular-nums">{Math.round((activeDays / 14) * 100)}%</span> {t("consistency", "de régularité")}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          CTA — Start Focus Session
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center pt-2 pb-6"
      >
        <Link href="/app/focus">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex items-center gap-3 px-7 py-4 rounded-2xl overflow-hidden text-sm font-semibold text-primary-foreground transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
              boxShadow: "0 4px 24px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--primary) / 0.3)",
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            />
            <Play className="h-4 w-4 relative z-10" />
            <span className="relative z-10">{t("Knock down the next domino", "Faire tomber le prochain domino")}</span>
            <ArrowRight className="h-4 w-4 relative z-10 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}
