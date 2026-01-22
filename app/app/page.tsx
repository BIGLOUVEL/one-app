"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  CheckCircle2,
  Lock,
  Timer,
  ArrowRight,
  XCircle,
  Plus,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { DominoChain } from "@/components/app/DominoChain"
import { ContractMeter } from "@/components/app/ContractMeter"

// Pressure phrases - calm but serious
const pressurePhrases = [
  "Every second counts.",
  "The deadline approaches.",
  "Stay focused. Stay committed.",
  "No shortcuts. No excuses.",
  "This is what you chose.",
  "Time doesn't wait.",
  "You made a promise.",
  "The clock is ticking.",
  "Focus on the ONE thing.",
  "Extraordinary results require focus.",
]

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="liquid-glass px-4 sm:px-6 py-3 sm:py-4 min-w-[70px] sm:min-w-[90px]">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums"
        >
          {value.toString().padStart(2, "0")}
        </motion.span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const {
    objective,
    hasCompletedOnboarding,
    getTimeRemaining,
    completeObjective,
    failObjective,
    updateProgress,
    resetObjective,
  } = useAppStore()

  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining())
  const [pressurePhrase, setPressurePhrase] = useState("")
  const [showFailConfirm, setShowFailConfirm] = useState(false)
  const [showCascade, setShowCascade] = useState(false)

  // Redirect to define if no objective
  useEffect(() => {
    if (!hasCompletedOnboarding || !objective) {
      router.push("/app/define")
    }
  }, [hasCompletedOnboarding, objective, router])

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining())
    }, 1000)

    return () => clearInterval(timer)
  }, [getTimeRemaining])

  // Random pressure phrase
  useEffect(() => {
    setPressurePhrase(pressurePhrases[Math.floor(Math.random() * pressurePhrases.length)])
  }, [])

  if (!objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Target className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  const isCompleted = objective.status === "completed"
  const isFailed = objective.status === "failed"
  const isOverdue = timeRemaining.isOverdue && !isCompleted && !isFailed

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Ambient glow */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${
        isCompleted ? "bg-emerald-500/10" : isFailed ? "bg-red-500/10" : isOverdue ? "bg-red-500/10" : "bg-primary/5"
      }`} />

      {/* Locked indicator + Contract Meter */}
      {!isCompleted && !isFailed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
            <Lock className="h-3 w-3" />
            <span className="text-xs uppercase tracking-wider">Objective Locked</span>
          </div>
          {/* Hide label when overdue to avoid duplicate with Overdue badge below */}
          <ContractMeter variant="line" showLabel={!isOverdue} />
        </motion.div>
      )}

      <div className="w-full max-w-2xl space-y-8 sm:space-y-12 relative z-10 pt-8 sm:pt-12">
        {/* Main objective */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </div>
          ) : isFailed ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <XCircle className="h-4 w-4" />
              Failed
            </div>
          ) : isOverdue ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Overdue
            </div>
          ) : null}

          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight ${
            isCompleted ? "text-emerald-400" : isFailed || isOverdue ? "text-red-400" : ""
          }`}>
            {objective.title}
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg italic">
            "{objective.why}"
          </p>
        </motion.div>

        {/* Countdown */}
        {!isCompleted && !isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center gap-2 sm:gap-4">
              <CountdownUnit value={timeRemaining.days} label="Days" />
              <CountdownUnit value={timeRemaining.hours} label="Hours" />
              <CountdownUnit value={timeRemaining.minutes} label="Min" />
              <CountdownUnit value={timeRemaining.seconds} label="Sec" />
            </div>

            {/* Pressure phrase */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-center mt-6 sm:mt-8 text-sm ${
                isOverdue ? "text-red-400" : "text-muted-foreground"
              }`}
            >
              {isOverdue ? "You're past the deadline." : pressurePhrase}
            </motion.p>
          </motion.div>
        )}

        {/* Domino Chain - Momentum visualization */}
        {!isCompleted && !isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="px-4"
          >
            <DominoChain maxVisible={24} showLabel={true} />
          </motion.div>
        )}

        {/* THE NOW - ULTRA PROMINENT */}
        {!isCompleted && !isFailed && objective.rightNowAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />

            {/* Main NOW card */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/10 border-2 border-primary/40">
              <div className="text-center space-y-4">
                {/* Badge */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/30 border border-primary/50"
                >
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">
                    À FAIRE MAINTENANT
                  </span>
                </motion.div>

                {/* The action */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                  {objective.rightNowAction}
                </h2>

                {/* Why this is THE thing */}
                <div className="pt-2 pb-4">
                  <p className="text-sm text-muted-foreground">
                    C'est <span className="text-primary font-semibold">LA seule chose</span> qui compte maintenant.
                    <br />
                    Tout le reste peut attendre.
                  </p>
                </div>

                {/* CTA Button */}
                <Link href="/app/focus">
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-2xl glow-green gap-3">
                    <Timer className="h-5 w-5" />
                    Commencer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Why this action - Expandable cascade link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <button
                onClick={() => setShowCascade(!showCascade)}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Sparkles className="h-4 w-4" />
                <span>Pourquoi c'est LA chose à faire ?</span>
                {showCascade ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <AnimatePresence>
                {showCascade && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-xl bg-white/5 space-y-3">
                      <p className="text-xs text-muted-foreground text-center mb-4">
                        Chaque action découle de la précédente. Tu es sur le bon chemin.
                      </p>

                      {/* Mini cascade */}
                      <div className="space-y-2">
                        {[
                          { label: "Someday", value: objective.somedayGoal, color: "text-violet-400", bg: "bg-violet-500/10" },
                          { label: "Cette année", value: objective.yearGoal || "—", color: "text-blue-400", bg: "bg-blue-500/10" },
                          { label: "Ce mois", value: objective.monthGoal, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                          { label: "Cette semaine", value: objective.weekGoal, color: "text-green-400", bg: "bg-green-500/10" },
                          { label: "Aujourd'hui", value: objective.todayGoal, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                        ].filter(item => item.value && item.value !== "—").map((item, idx) => (
                          <div key={idx} className={`p-2 rounded-lg ${item.bg} flex items-start gap-2`}>
                            <span className={`text-xs ${item.color} font-medium shrink-0 w-20`}>{item.label}</span>
                            <span className="text-xs text-foreground/80 line-clamp-1">{item.value}</span>
                          </div>
                        ))}

                        {/* Arrow to NOW */}
                        <div className="flex justify-center py-1">
                          <ChevronDown className="h-4 w-4 text-primary" />
                        </div>

                        {/* NOW highlighted */}
                        <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-primary font-bold shrink-0 w-20">NOW</span>
                            <span className="text-sm text-foreground font-medium">{objective.rightNowAction}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-center text-primary/80 pt-2">
                        Fais cette action → Tout le reste suivra.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className={`font-medium ${isCompleted ? "text-emerald-400" : ""}`}>
              {objective.progress}%
            </span>
          </div>

          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${objective.progress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                isCompleted
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : isFailed || isOverdue
                  ? "bg-gradient-to-r from-red-500 to-red-400"
                  : "bg-gradient-to-r from-primary to-emerald-400"
              }`}
            />
          </div>

          {/* Progress controls */}
          {!isCompleted && !isFailed && (
            <div className="flex justify-center gap-2 pt-2 flex-wrap">
              {[0, 25, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => updateProgress(val)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-all ${
                    objective.progress === val
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        {!isCompleted && !isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-3 pt-4 sm:pt-8"
          >
            <Button
              onClick={completeObjective}
              disabled={objective.progress < 100}
              className={`h-12 sm:h-14 px-6 sm:px-8 rounded-2xl text-base font-medium transition-all duration-300 ${
                objective.progress >= 100
                  ? "bg-emerald-500 text-white hover:bg-emerald-400 glow-green"
                  : "bg-white/5 text-muted-foreground cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Mark as Complete
            </Button>

            {!showFailConfirm ? (
              <Button
                onClick={() => setShowFailConfirm(true)}
                variant="outline"
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl text-base border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Fail Objective
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    failObjective()
                    setShowFailConfirm(false)
                  }}
                  variant="destructive"
                  className="h-12 sm:h-14 px-6 rounded-2xl"
                >
                  Confirm Fail
                </Button>
                <Button
                  onClick={() => setShowFailConfirm(false)}
                  variant="outline"
                  className="h-12 sm:h-14 px-6 rounded-2xl"
                >
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Contract Fulfilled - Clean completion screen */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-8 pt-4 sm:pt-8"
          >
            {/* Contract fulfilled message */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-400">
                  The contract is fulfilled.
                </h2>
                <p className="text-muted-foreground">
                  Momentum compounds.
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                resetObjective()
                router.push("/app/define")
              }}
              className="h-14 px-8 rounded-2xl text-base font-medium bg-foreground/10 text-foreground hover:bg-foreground/20 gap-2"
            >
              <Plus className="h-5 w-5" />
              New Contract
            </Button>
          </motion.div>
        )}

        {/* Contract Broken - Failure screen */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-8 pt-4 sm:pt-8"
          >
            {/* Contract broken message */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"
              >
                <XCircle className="h-8 w-8 text-red-400" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  The contract was broken.
                </h2>
                <p className="text-muted-foreground">
                  What failed? Reflect, then rebuild.
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                resetObjective()
                router.push("/app/define")
              }}
              className="h-14 px-8 rounded-2xl text-base font-medium bg-foreground/10 text-foreground hover:bg-foreground/20 gap-2"
            >
              <Plus className="h-5 w-5" />
              New Contract
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
