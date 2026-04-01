"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Plus,
  X,
  Flag,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

export default function MilestonesPage() {
  const { objective, addUserMilestone, completeUserMilestone, removeUserMilestone } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  const [newTitle, setNewTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  if (!objective || objective.status !== "active") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="h-12 w-12 rounded-2xl border border-white/[0.07] flex items-center justify-center mb-4">
          <Flag className="h-5 w-5 text-white/20" />
        </div>
        <p className="text-sm text-white/30 mb-1">{t("No active objective", "Aucun objectif actif")}</p>
        <p className="text-xs text-white/15">{t("Define an objective first.", "Définis un objectif d'abord.")}</p>
      </div>
    )
  }

  const milestones = objective.userMilestones ?? []
  const completed  = milestones.filter(m => m.completed).length
  const total      = milestones.length
  const current    = milestones.find(m => !m.completed)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addUserMilestone(newTitle.trim())
    setNewTitle("")
    setIsAdding(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.25em] font-bold mb-1">
          {t("Milestones", "Jalons")}
        </p>
        <h1 className="text-lg font-bold text-white leading-tight truncate">
          {objective.somedayGoal}
        </h1>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/25 tabular-nums">
              {completed}/{total} {t("milestones", "jalons")}
            </span>
            <span className="text-[10px] text-primary/50 font-semibold tabular-nums">
              {Math.round((completed / total) * 100)}%
            </span>
          </div>
          <div className="relative h-[2px] w-full rounded-full bg-white/[0.04]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: completed / total }}
              style={{ originX: 0, background: "hsl(var(--primary) / 0.6)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 right-0 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Milestone list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {milestones.map((milestone, i) => {
            const isActive = !milestone.completed && milestone.id === current?.id
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border p-3.5 transition-all",
                  milestone.completed
                    ? "border-white/[0.04] bg-white/[0.01] opacity-40"
                    : isActive
                      ? "border-primary/20 bg-primary/[0.04]"
                      : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.1]"
                )}
              >
                {/* Step indicator */}
                <button
                  onClick={() => !milestone.completed && completeUserMilestone(milestone.id)}
                  className="shrink-0 outline-none"
                  disabled={milestone.completed}
                >
                  <motion.div
                    whileTap={{ scale: 0.82 }}
                    className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center",
                      milestone.completed
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : isActive
                          ? "border-primary/40 hover:border-primary/60 hover:bg-primary/10"
                          : "border-white/[0.15] hover:border-white/30"
                    )}
                  >
                    {milestone.completed && <Check className="h-2.5 w-2.5 text-emerald-400" />}
                    {isActive && !milestone.completed && (
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </button>

                {/* Title */}
                <span className={cn(
                  "flex-1 text-sm leading-snug",
                  milestone.completed
                    ? "line-through decoration-white/20 text-white/30"
                    : isActive
                      ? "text-white font-medium"
                      : "text-white/60"
                )}>
                  {milestone.title}
                </span>

                {/* Current label */}
                {isActive && (
                  <span className="text-[9px] text-primary/50 uppercase tracking-wider font-bold shrink-0">
                    {t("now", "actuel")}
                  </span>
                )}

                {/* Remove button */}
                {!milestone.completed && (
                  <button
                    onClick={() => removeUserMilestone(milestone.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity outline-none"
                  >
                    <X className="h-3.5 w-3.5 text-white/20 hover:text-white/50" />
                  </button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state */}
        {total === 0 && !isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center"
          >
            <p className="text-sm text-white/20 mb-1">
              {t("No milestones yet.", "Aucun jalon défini.")}
            </p>
            <p className="text-xs text-white/12">
              {t(
                "Break your objective into 3–5 key phases.",
                "Décompose ton objectif en 3 à 5 phases clés."
              )}
            </p>
          </motion.div>
        )}

        {/* Add milestone row */}
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              key="adding"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd()
                  if (e.key === "Escape") { setIsAdding(false); setNewTitle("") }
                }}
                placeholder={t("Milestone title...", "Nom du jalon...")}
                autoFocus
                className="flex-1 h-10 px-3.5 rounded-xl bg-white/[0.04] border border-primary/20 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/30 transition-all"
              />
              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.93 }}
                disabled={!newTitle.trim()}
                className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors disabled:opacity-20"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              <button
                onClick={() => { setIsAdding(false); setNewTitle("") }}
                className="h-10 w-10 rounded-xl border border-white/[0.07] flex items-center justify-center text-white/20 hover:text-white/40 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            total < 7 && (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl border border-dashed border-white/[0.06] text-white/20 hover:text-white/35 hover:border-white/[0.1] transition-all"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">{t("Add milestone", "Ajouter un jalon")}</span>
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Hint: 4-level hierarchy */}
      {total > 0 && (
        <div className="pt-2 border-t border-white/[0.04] space-y-1">
          <p className="text-[9px] text-white/12 uppercase tracking-wider font-semibold mb-2">
            {t("Hierarchy", "Hiérarchie")}
          </p>
          {[
            { label: t("Objective", "Objectif"), value: objective.somedayGoal, dim: true },
            { label: t("Milestone", "Jalon"), value: current?.title ?? t("All done", "Tout complété"), active: !!current },
            { label: t("Today", "Aujourd'hui"), value: objective.todayGoal || "—", dim: true },
            { label: t("Next action", "Prochaine action"), value: objective.rightNowAction || "—", dim: true },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                "h-[2px] w-3 rounded-full shrink-0",
                row.active ? "bg-primary/40" : "bg-white/[0.06]"
              )} />
              <span className={cn(
                "text-[9px] uppercase tracking-wider font-semibold shrink-0 w-20",
                row.active ? "text-primary/50" : "text-white/15"
              )}>
                {row.label}
              </span>
              <span className={cn(
                "text-[10px] truncate",
                row.active ? "text-white/50" : "text-white/15"
              )}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
