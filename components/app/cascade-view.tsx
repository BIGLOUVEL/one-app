"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mountain,
  Target,
  Calendar,
  Sun,
  Zap,
  ChevronDown,
  Check,
  AlertCircle,
  Edit3,
  X,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import type { Objective } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CascadeLevel {
  key: keyof Pick<Objective, "somedayGoal" | "monthGoal" | "weekGoal" | "todayGoal" | "rightNowAction">
  label: string
  sublabel: string
  icon: typeof Mountain
  color: string
  iconBg: string
  activeBorder: string
}

const getCascadeLevels = (lang: string): CascadeLevel[] => {
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  return [
    {
      key: "somedayGoal",
      label: "Someday",
      sublabel: t("Long-term vision", "Vision long terme"),
      icon: Mountain,
      color: "text-violet-400",
      iconBg: "bg-violet-500/10 border-violet-500/20",
      activeBorder: "border-violet-500/30",
    },
    {
      key: "monthGoal",
      label: t("This month", "Ce mois"),
      sublabel: t("Monthly objective", "Objectif mensuel"),
      icon: Target,
      color: "text-primary",
      iconBg: "bg-primary/10 border-primary/20",
      activeBorder: "border-primary/30",
    },
    {
      key: "weekGoal",
      label: t("This week", "Cette semaine"),
      sublabel: t("Weekly focus", "Focus hebdomadaire"),
      icon: Calendar,
      color: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      activeBorder: "border-cyan-500/30",
    },
    {
      key: "todayGoal",
      label: t("Today", "Aujourd'hui"),
      sublabel: t("Today's priority", "La priorité du jour"),
      icon: Sun,
      color: "text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      activeBorder: "border-orange-500/30",
    },
    {
      key: "rightNowAction",
      label: t("Now", "Maintenant"),
      sublabel: t("Immediate action", "Action immédiate"),
      icon: Zap,
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      activeBorder: "border-emerald-500/30",
    },
  ]
}

export function CascadeView() {
  const { objective, updateCascade } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const cascadeLevels = getCascadeLevels(lang)
  const [editingLevel, setEditingLevel] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showAlignmentCheck, setShowAlignmentCheck] = useState(false)
  const [alignmentAnswer, setAlignmentAnswer] = useState<"yes" | "no" | null>(null)

  if (!objective) return null

  const startEditing = (level: CascadeLevel) => {
    setEditingLevel(level.key)
    setEditValue(objective[level.key] || "")
  }

  const saveEdit = (key: string) => {
    if (editValue.trim()) {
      updateCascade(key as keyof Pick<typeof objective, "somedayGoal" | "monthGoal" | "weekGoal" | "todayGoal" | "rightNowAction">, editValue.trim())
    }
    setEditingLevel(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingLevel(null)
    setEditValue("")
  }

  return (
    <div className="space-y-6">
      {/* Cascade Chain */}
      <div className="relative">
        {/* Vertical connector line through all levels */}
        <div className="absolute left-[23px] sm:left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-violet-500/20 via-primary/20 to-emerald-500/20" />

        <div className="space-y-1">
          {cascadeLevels.map((level, index) => {
            const value = objective[level.key]
            const isEditing = editingLevel === level.key
            const Icon = level.icon
            const isLast = index === cascadeLevels.length - 1

            return (
              <motion.div
                key={level.key}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className={cn(
                  "relative flex items-start gap-4 p-4 sm:p-5 rounded-xl transition-all group",
                  "hover:bg-white/[0.02]",
                  isEditing && "bg-white/[0.03]"
                )}>
                  {/* Node circle */}
                  <div className="relative z-10 shrink-0">
                    <div className={cn(
                      "w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] rounded-xl flex items-center justify-center border",
                      level.iconBg
                    )}>
                      <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", level.color)} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] uppercase tracking-[0.15em] font-medium", level.color)}>
                        {level.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50">{level.sublabel}</span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-white/5 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-white/10"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(level.key)
                            if (e.key === "Escape") cancelEdit()
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(level.key)}
                            className="h-8 px-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/15 transition-colors"
                          >
                            {t("Save", "Sauvegarder")}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="h-8 px-3 rounded-lg text-muted-foreground text-xs hover:text-foreground transition-colors"
                          >
                            {t("Cancel", "Annuler")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm sm:text-base font-medium leading-relaxed">
                          {value || <span className="text-muted-foreground/50 italic">{t("Not defined", "Non défini")}</span>}
                        </p>
                        <button
                          onClick={() => startEditing(level)}
                          className="shrink-0 p-1.5 rounded-lg text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-white/5 transition-all"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow between levels */}
                {!isLast && (
                  <div className="flex justify-center -my-1.5 relative z-0">
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/20" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Alignment Check */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {!showAlignmentCheck ? (
          <button
            onClick={() => setShowAlignmentCheck(true)}
            className="w-full h-12 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Check className="h-4 w-4" />
            {t("Check alignment", "Vérifier l'alignement")}
          </button>
        ) : (
          <div className="liquid-glass p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{t("Alignment check", "Vérification d'alignement")}</h3>
              <button
                onClick={() => { setShowAlignmentCheck(false); setAlignmentAnswer(null) }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {lang === 'fr' ? (
                <>Est-ce que ton <span className="text-emerald-400 font-medium">action immédiate</span> fait directement avancer ton{" "}
                <span className="text-orange-400 font-medium">objectif du jour</span> ?</>
              ) : (
                <>Does your <span className="text-emerald-400 font-medium">immediate action</span> directly advance your{" "}
                <span className="text-orange-400 font-medium">today&apos;s objective</span>?</>
              )}
            </p>

            <AnimatePresence mode="wait">
              {alignmentAnswer === null ? (
                <motion.div
                  key="buttons"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex gap-3 justify-center"
                >
                  <button
                    onClick={() => setAlignmentAnswer("yes")}
                    className="flex items-center gap-2 h-10 px-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/15 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    {t("Yes, aligned", "Oui, aligné")}
                  </button>
                  <button
                    onClick={() => setAlignmentAnswer("no")}
                    className="flex items-center gap-2 h-10 px-5 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {t("No, misaligned", "Non, décalé")}
                  </button>
                </motion.div>
              ) : alignmentAnswer === "yes" ? (
                <motion.div
                  key="yes"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-3"
                >
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                    >
                      <Check className="h-6 w-6 text-emerald-400" />
                    </motion.div>
                  </div>
                  <p className="text-emerald-400 font-medium text-sm">{t("Perfect alignment.", "Alignement parfait.")}</p>
                  <p className="text-muted-foreground text-xs">{t("Your dominoes are aligned. Execute your immediate action.", "Tes dominos sont alignés. Exécute ton action immédiate.")}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="no"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2">
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"
                      >
                        <AlertCircle className="h-6 w-6 text-orange-400" />
                      </motion.div>
                    </div>
                    <p className="text-orange-400 font-medium text-sm">{t("Misalignment detected.", "Décalage détecté.")}</p>
                    <p className="text-muted-foreground text-xs">{t("Modify your immediate action to serve today's objective.", "Modifie ton action immédiate pour servir l'objectif du jour.")}</p>
                  </div>
                  <button
                    onClick={() => {
                      startEditing(cascadeLevels[4])
                      setShowAlignmentCheck(false)
                      setAlignmentAnswer(null)
                    }}
                    className="w-full h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
                  >
                    {t("Modify immediate action", "Modifier l'action immédiate")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* The Question */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-2"
      >
        <p className="text-sm text-muted-foreground/60 italic leading-relaxed max-w-lg mx-auto">
          {t(
            "\"What is the ONE thing I can do such that by doing it, everything else becomes easier or unnecessary?\"",
            "\"Quelle est la SEULE chose que je puisse faire, telle qu'en la faisant, tout le reste deviendra plus simple ou inutile ?\""
          )}
        </p>
      </motion.div>
    </div>
  )
}
