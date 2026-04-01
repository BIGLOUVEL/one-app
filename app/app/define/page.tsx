"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, ChevronDown, Edit3, Check, X } from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"

const smooth = [0.25, 0.46, 0.45, 0.94] as const

type EditableField = "todayGoal" | "rightNowAction" | null

export default function DefinePage() {
  const router = useRouter()
  const { objective, dominoChain, failObjective, resetObjective, updateCascade } = useAppStore()
  const hasHydrated = useHasHydrated()
  const lang = useAppStore((s) => s.language)
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en)

  const [showConfirm, setShowConfirm]       = useState(false)
  const [showCascade, setShowCascade]       = useState(false)
  const [editingField, setEditingField]     = useState<EditableField>(null)
  const [editValue, setEditValue]           = useState("")

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!objective) {
    router.replace("/app")
    return null
  }

  const handleAbandon = () => {
    failObjective()
    resetObjective()
    setTimeout(() => router.replace("/app"), 50)
  }

  const startEdit = (field: EditableField, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const confirmEdit = () => {
    if (!editingField || !editValue.trim()) { setEditingField(null); return }
    updateCascade(editingField, editValue.trim())
    setEditingField(null)
  }

  const cancelEdit = () => setEditingField(null)

  // Stats
  const daysSinceStart = Math.max(1,
    Math.ceil((Date.now() - new Date(objective.createdAt).getTime()) / 86400000)
  )
  const daysLeft = objective.deadline
    ? Math.max(0, Math.ceil((new Date(objective.deadline).getTime() - Date.now()) / 86400000))
    : null
  const dominosCompleted = dominoChain?.completedDominos ?? 0

  // Cascade levels (top → bottom, some locked, some editable)
  const cascadeLevels = [
    { key: "yearGoal",     label: t("Year",    "Année"),     value: objective.yearGoal,      locked: true  },
    { key: "monthGoal",    label: t("Month",   "Mois"),      value: objective.monthGoal,     locked: true  },
    { key: "weekGoal",     label: t("Week",    "Semaine"),   value: objective.weekGoal,      locked: true  },
    { key: "todayGoal",    label: t("Today",   "Aujourd'hui"), value: objective.todayGoal,   locked: false },
    { key: "rightNowAction", label: t("Right now", "Maintenant"), value: objective.rightNowAction, locked: false },
  ] as const

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 pt-12 pb-20">
      <div className="w-full max-w-xl space-y-10">

        {/* Someday Goal — THE hero */}
        <motion.div
          className="space-y-3 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: smooth }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">
            {t("MY ONE THING", "MON ESSENTIEL")}
          </p>
          <h1 className="font-black tracking-tight leading-[1.1]" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
            {objective.somedayGoal}
          </h1>
          {objective.why && (
            <p className="text-sm text-muted-foreground/50 italic max-w-sm mx-auto leading-relaxed">
              &ldquo;{objective.why}&rdquo;
            </p>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: smooth }}
        >
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-2xl sm:text-3xl font-black tabular-nums">{daysSinceStart}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-1">
              {t("days in", "jours")}
            </p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-2xl sm:text-3xl font-black tabular-nums text-primary">{dominosCompleted}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-1">
              {t("dominos", "dominos")}
            </p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-2xl sm:text-3xl font-black tabular-nums">{daysLeft !== null ? daysLeft : "∞"}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-1">
              {t("days left", "restants")}
            </p>
          </div>
        </motion.div>

        {/* Cascade — collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: smooth }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          {/* Toggle header */}
          <button
            onClick={() => setShowCascade(!showCascade)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 font-medium">
              {t("Goal cascade", "Cascade d'objectifs")}
            </span>
            <motion.div animate={{ rotate: showCascade ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground/30" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showCascade && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/[0.05] divide-y divide-white/[0.04]">
                  {cascadeLevels.map((level) => {
                    const isEditing = editingField === level.key
                    const isEditable = !level.locked

                    return (
                      <div key={level.key} className="px-5 py-3.5 flex items-start gap-4">
                        {/* Label */}
                        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/30 font-medium pt-0.5 w-20 shrink-0">
                          {level.label}
                        </span>

                        {/* Value */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit() }}
                              className="w-full bg-transparent text-sm font-medium text-primary focus:outline-none border-b border-primary/40 pb-0.5"
                              autoFocus
                            />
                          ) : (
                            <p className={[
                              "text-sm leading-snug",
                              level.locked ? "text-muted-foreground/50" : "font-medium",
                              level.key === "rightNowAction" ? "text-primary" : "",
                            ].join(" ")}>
                              {level.value || <span className="text-muted-foreground/20 italic">{t("Not set", "Non défini")}</span>}
                            </p>
                          )}
                        </div>

                        {/* Edit / confirm / cancel */}
                        {isEditable && (
                          <div className="shrink-0 flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button onClick={confirmEdit} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground/40 transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEdit(level.key as EditableField, level.value)}
                                className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground/20 hover:text-muted-foreground/60 transition-colors"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Abandon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35, ease: smooth }}
        >
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3 text-sm text-muted-foreground/30 hover:text-red-400 transition-colors"
            >
              {t("Abandon this objective", "Abandonner cet objectif")}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-red-500/[0.05] border border-red-500/15 space-y-5"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">{t("Are you sure?", "Es-tu sûr ?")}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {t(
                      "This objective will be marked as abandoned. All progress, dominos, and streak will be lost.",
                      "Cet objectif sera marqué comme abandonné. Toute ta progression, tes dominos et ta série seront perdus."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all"
                >
                  {t("No, keep going", "Non, je continue")}
                </button>
                <button
                  onClick={handleAbandon}
                  className="flex-1 h-11 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 text-sm font-medium transition-all"
                >
                  {t("Yes, abandon", "Oui, abandonner")}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
