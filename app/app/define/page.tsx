"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"

const smooth = [0.25, 0.46, 0.45, 0.94] as const

export default function DefinePage() {
  const router = useRouter()
  const { objective, dominoChain, failObjective, resetObjective } = useAppStore()
  const lang = useAppStore((s) => s.language)
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en)

  const [showConfirm, setShowConfirm] = useState(false)

  // No objective → back to dashboard (which shows empty state)
  useEffect(() => {
    if (!objective) router.push("/app")
  }, [objective, router])

  if (!objective) return null

  const handleAbandon = () => {
    failObjective()
    resetObjective()
    router.push("/app")
  }

  // Stats
  const daysSinceStart = Math.max(
    1,
    Math.ceil(
      (Date.now() - new Date(objective.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  )

  const daysLeft = objective.deadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(objective.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null

  const dominosCompleted = dominoChain?.completedDominos ?? 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-12">

        {/* Objective — THE main thing */}
        <motion.div
          className="space-y-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: smooth }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">
            {t("MY ONE THING", "MON ESSENTIEL")}
          </p>
          <h1
            className="font-black tracking-tight leading-[1.1]"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
          >
            {objective.somedayGoal}
          </h1>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: smooth }}
        >
          {/* Days committed */}
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-2xl sm:text-3xl font-black tabular-nums text-foreground">
              {daysSinceStart}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mt-1">
              {daysSinceStart === 1
                ? t("day committed", "jour engagé")
                : t("days committed", "jours engagés")}
            </p>
          </div>

          {/* Dominos */}
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-2xl sm:text-3xl font-black tabular-nums text-primary">
              {dominosCompleted}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mt-1">
              {dominosCompleted === 1
                ? t("domino fallen", "domino tombé")
                : t("dominos fallen", "dominos tombés")}
            </p>
          </div>

          {/* Time left */}
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-2xl sm:text-3xl font-black tabular-nums text-foreground">
              {daysLeft !== null ? daysLeft : "∞"}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mt-1">
              {t("days left", "jours restants")}
            </p>
          </div>
        </motion.div>

        {/* Why */}
        {objective.why && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: smooth }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
              {t("WHY THIS MATTERS", "POURQUOI C'EST IMPORTANT")}
            </p>
            <p className="text-base sm:text-lg text-muted-foreground italic leading-relaxed max-w-md mx-auto">
              &ldquo;{objective.why}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Abandon */}
        <motion.div
          className="pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: smooth }}
        >
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3 text-sm text-muted-foreground/40 hover:text-red-400 transition-colors"
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
                  <p className="text-sm font-semibold text-red-400">
                    {t("Are you sure?", "Es-tu sûr ?")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {t(
                      "This objective will be marked as abandoned. All your progress, dominos, and streak will be lost. You'll restart from scratch with a new onboarding.",
                      "Cet objectif sera marqué comme abandonné. Toute ta progression, tes dominos et ta série seront perdus. Tu repartiras de zéro avec un nouvel onboarding."
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
