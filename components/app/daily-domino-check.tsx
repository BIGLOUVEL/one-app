"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Edit3, Target, Clock, X } from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"

export function DailyDominoCheck() {
  const hasHydrated = useHasHydrated()
  const {
    objective,
    needsDailyCheck,
    setLastDailyCheckDate,
    updateCascade,
    getDominoProgress,
    visualPrefs,
  } = useAppStore()

  const [showCheck, setShowCheck] = useState(false)
  const [mode, setMode] = useState<"confirm" | "edit">("confirm")
  const [editTodayGoal, setEditTodayGoal] = useState("")
  const [editRightNowAction, setEditRightNowAction] = useState("")

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    if (hasHydrated && visualPrefs.dailyDominoCheck && needsDailyCheck() && objective?.status === "active") {
      setShowCheck(true)
      setEditTodayGoal(objective.todayGoal)
      setEditRightNowAction(objective.rightNowAction)
    }
  }, [hasHydrated, needsDailyCheck, objective, visualPrefs.dailyDominoCheck])

  const handleConfirm = () => {
    const today = new Date().toLocaleDateString("en-CA")
    setLastDailyCheckDate(today)
    setShowCheck(false)
  }

  const handleSaveEdit = () => {
    if (editTodayGoal.trim() && editTodayGoal.trim() !== objective?.todayGoal) {
      updateCascade("todayGoal", editTodayGoal.trim())
    }
    if (editRightNowAction.trim() && editRightNowAction.trim() !== objective?.rightNowAction) {
      updateCascade("rightNowAction", editRightNowAction.trim())
    }
    handleConfirm()
  }

  if (!showCheck || !objective) return null

  const { completed } = getDominoProgress()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={handleConfirm}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="w-full max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          {/* Card */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-background/95 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Green top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            {/* Dismiss button */}
            <button
              onClick={handleConfirm}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-muted-foreground/80 hover:bg-white/[0.06] transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="p-5 space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 font-medium">
                    {t("Daily check", "Check quotidien")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground/70 leading-snug">
                  {completed > 0
                    ? t(
                        `${completed} domino${completed > 1 ? "s" : ""} down. Still on track?`,
                        `${completed} domino${completed > 1 ? "s" : ""} tombé${completed > 1 ? "s" : ""}. Toujours aligné ?`
                      )
                    : t("Before you start — confirm your focus.", "Avant de commencer, confirme ton focus.")}
                </p>
              </div>

              {/* Goals */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06] overflow-hidden">
                {/* Today goal */}
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3 h-3" />
                    {t("Today", "Aujourd'hui")}
                  </p>
                  {mode === "edit" ? (
                    <input
                      type="text"
                      value={editTodayGoal}
                      onChange={e => setEditTodayGoal(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/30"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-medium leading-snug">{objective.todayGoal}</p>
                  )}
                </div>

                {/* Right now */}
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {t("Right now", "Maintenant")}
                  </p>
                  {mode === "edit" ? (
                    <input
                      type="text"
                      value={editRightNowAction}
                      onChange={e => setEditRightNowAction(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-primary focus:outline-none placeholder:text-muted-foreground/30"
                    />
                  ) : (
                    <p className="text-sm font-medium text-primary leading-snug">{objective.rightNowAction}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {mode === "confirm" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode("edit")}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground border border-white/[0.08] hover:border-white/[0.14] hover:text-foreground transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {t("Adjust", "Ajuster")}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t("Confirmed", "Confirmé")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode("confirm")}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground border border-white/[0.08] hover:border-white/[0.14] hover:text-foreground transition-all"
                  >
                    {t("Cancel", "Annuler")}
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t("Save", "Sauvegarder")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
