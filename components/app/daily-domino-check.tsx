"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Check, Edit3, Target, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"

export function DailyDominoCheck() {
  const hasHydrated = useHasHydrated()
  const {
    objective,
    needsDailyCheck,
    setLastDailyCheckDate,
    updateCascade,
    getDominoProgress,
  } = useAppStore()

  const [showCheck, setShowCheck] = useState(false)
  const [mode, setMode] = useState<"confirm" | "edit">("confirm")
  const [editTodayGoal, setEditTodayGoal] = useState("")
  const [editRightNowAction, setEditRightNowAction] = useState("")

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    if (hasHydrated && needsDailyCheck() && objective?.status === "active") {
      setShowCheck(true)
      setEditTodayGoal(objective.todayGoal)
      setEditRightNowAction(objective.rightNowAction)
    }
  }, [hasHydrated, needsDailyCheck, objective])

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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-lg space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
            >
              <Sun className="w-8 h-8 text-amber-400" />
            </motion.div>
            <h2 className="text-2xl font-bold">Domino Check</h2>
            <p className="text-muted-foreground text-sm">
              {completed > 0
                ? lang === 'fr'
                  ? `${completed} domino${completed > 1 ? "s" : ""} déjà tombé${completed > 1 ? "s" : ""}. Vérifie ton alignement avant de continuer.`
                  : `${completed} domino${completed > 1 ? "s" : ""} already fallen. Check your alignment before continuing.`
                : t("Before starting your day, check your alignment.", "Avant de commencer ta journée, vérifie ton alignement.")}
            </p>
          </div>

          {/* Current goals display */}
          <div className="liquid-glass p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-3 h-3" />
                {t("Today's goal", "Objectif du jour")}
              </p>
              {mode === "edit" ? (
                <input
                  type="text"
                  value={editTodayGoal}
                  onChange={(e) => setEditTodayGoal(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              ) : (
                <p className="text-lg font-medium">{objective.todayGoal}</p>
              )}
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {t("Immediate action", "Action immédiate")}
              </p>
              {mode === "edit" ? (
                <input
                  type="text"
                  value={editRightNowAction}
                  onChange={(e) => setEditRightNowAction(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <p className="text-emerald-400 font-medium">{objective.rightNowAction}</p>
              )}
            </div>
          </div>

          {/* Question */}
          <p className="text-center text-muted-foreground text-sm">
            {t("Is this still your priority today?", "C'est toujours ta priorité aujourd'hui ?")}
          </p>

          {/* Actions */}
          {mode === "confirm" ? (
            <div className="flex gap-3">
              <Button
                onClick={() => setMode("edit")}
                variant="outline"
                className="h-12 px-6 rounded-xl"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                {t("Adjust", "Ajuster")}
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-12 rounded-xl glow-green"
              >
                <Check className="mr-2 h-4 w-4" />
                {t("Confirmed, let's go", "Confirmé, c'est bon")}
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => setMode("confirm")}
                variant="outline"
                className="h-12 px-6 rounded-xl"
              >
                {t("Cancel", "Annuler")}
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 h-12 rounded-xl glow-green"
              >
                <Check className="mr-2 h-4 w-4" />
                {t("Save", "Sauvegarder")}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
