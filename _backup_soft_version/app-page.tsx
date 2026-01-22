"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Lock,
  Timer,
  ArrowRight,
  XCircle,
  Plus,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { DominoChain } from "@/components/app/DominoChain"
import { ContractMeter } from "@/components/app/ContractMeter"

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
      <div className="countdown-unit">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="countdown-value"
        >
          {value.toString().padStart(2, "0")}
        </motion.span>
      </div>
      <p className="countdown-label">{label}</p>
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

  useEffect(() => {
    if (!hasCompletedOnboarding || !objective) {
      router.push("/app/define")
    }
  }, [hasCompletedOnboarding, objective, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining())
    }, 1000)
    return () => clearInterval(timer)
  }, [getTimeRemaining])

  useEffect(() => {
    setPressurePhrase(pressurePhrases[Math.floor(Math.random() * pressurePhrases.length)])
  }, [])

  if (!objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  const isCompleted = objective.status === "completed"
  const isFailed = objective.status === "failed"
  const isOverdue = timeRemaining.isOverdue && !isCompleted && !isFailed

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Locked indicator + Contract Meter */}
      {!isCompleted && !isFailed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
            <Lock className="h-3 w-3" />
            <span className="text-xs uppercase tracking-widest font-medium">Objective Locked</span>
          </div>
          <ContractMeter variant="line" showLabel={true} />
        </motion.div>
      )}

      <div className="w-full max-w-2xl space-y-10 relative z-10 pt-16 sm:pt-20">
        {/* Main objective */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </div>
          ) : isFailed ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              <XCircle className="h-4 w-4" />
              Failed
            </div>
          ) : isOverdue ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              Overdue
            </div>
          ) : null}

          <h1 className={`font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight ${
            isCompleted ? "text-success" : isFailed || isOverdue ? "text-destructive" : ""
          }`}>
            {objective.title}
          </h1>

          <p className="text-muted-foreground text-lg italic max-w-lg mx-auto">
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
            <div className="flex justify-center gap-3 sm:gap-4">
              <CountdownUnit value={timeRemaining.days} label="Days" />
              <CountdownUnit value={timeRemaining.hours} label="Hours" />
              <CountdownUnit value={timeRemaining.minutes} label="Min" />
              <CountdownUnit value={timeRemaining.seconds} label="Sec" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-center mt-6 text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
            >
              {isOverdue ? "You're past the deadline." : pressurePhrase}
            </motion.p>
          </motion.div>
        )}

        {/* Domino Chain */}
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

        {/* THE NOW - Action card */}
        {!isCompleted && !isFailed && objective.rightNowAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="card-feature p-6 sm:p-8">
              <div className="text-center space-y-5">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  <span className="uppercase tracking-wider text-xs font-semibold">Do Now</span>
                </div>

                {/* The action */}
                <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
                  {objective.rightNowAction}
                </h2>

                {/* Why this is THE thing */}
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This is <span className="text-foreground font-medium">the only thing</span> that matters right now.
                  Everything else can wait.
                </p>

                {/* CTA Button */}
                <Link href="/app/focus">
                  <Button size="lg" className="h-12 px-6 text-base gap-2 mt-2">
                    <Timer className="h-4 w-4" />
                    Start Focus Session
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Expandable cascade link */}
              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => setShowCascade(!showCascade)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Why is this THE thing to do?</span>
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
                      <div className="mt-4 p-4 rounded-lg bg-secondary/50 space-y-3">
                        <p className="text-xs text-muted-foreground text-center mb-4">
                          Each action flows from the one before. You're on the right path.
                        </p>

                        <div className="space-y-2">
                          {[
                            { label: "Someday", value: objective.somedayGoal },
                            { label: "This Month", value: objective.monthGoal },
                            { label: "This Week", value: objective.weekGoal },
                            { label: "Today", value: objective.todayGoal },
                          ].filter(item => item.value).map((item, idx) => (
                            <div key={idx} className="p-2 rounded bg-background/50 flex items-start gap-2">
                              <span className="text-xs text-muted-foreground font-medium shrink-0 w-20">{item.label}</span>
                              <span className="text-xs line-clamp-1">{item.value}</span>
                            </div>
                          ))}

                          <div className="flex justify-center py-1">
                            <ChevronDown className="h-4 w-4 text-accent" />
                          </div>

                          <div className="p-3 rounded bg-accent/10 border border-accent/20">
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-accent font-semibold shrink-0 w-20">NOW</span>
                              <span className="text-sm font-medium">{objective.rightNowAction}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-center text-accent pt-2">
                          Do this action → Everything else follows.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
            <span className={`font-medium ${isCompleted ? "text-success" : ""}`}>
              {objective.progress}%
            </span>
          </div>

          <div className="progress-track">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${objective.progress}%` }}
              transition={{ duration: 0.5 }}
              className={`progress-fill ${
                isCompleted ? "bg-success" : isFailed || isOverdue ? "bg-destructive" : "bg-foreground"
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
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    objective.progress === val
                      ? "bg-foreground text-background"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
            className="flex flex-col sm:flex-row justify-center gap-3 pt-4"
          >
            <Button
              onClick={completeObjective}
              disabled={objective.progress < 100}
              className={`h-12 px-6 ${
                objective.progress >= 100
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : ""
              }`}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>

            {!showFailConfirm ? (
              <Button
                onClick={() => setShowFailConfirm(true)}
                variant="outline"
                className="h-12 px-6 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="mr-2 h-4 w-4" />
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
                  className="h-12 px-6"
                >
                  Confirm Fail
                </Button>
                <Button
                  onClick={() => setShowFailConfirm(false)}
                  variant="outline"
                  className="h-12 px-6"
                >
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Completion screen */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-8 pt-4"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-success">
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
              className="h-12 px-6 gap-2"
            >
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          </motion.div>
        )}

        {/* Failure screen */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-8 pt-4"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <XCircle className="h-8 w-8 text-destructive" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">
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
              className="h-12 px-6 gap-2"
            >
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
