"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

type LoopStep = "plan" | "focus" | "done"

function getLoopStep(
  rightNowAction: string,
  todayGoalCompleted: boolean,
  hasActiveSession: boolean,
): LoopStep {
  if (todayGoalCompleted) return "done"
  if (hasActiveSession || rightNowAction.trim()) return "focus"
  return "plan"
}

const STEPS: {
  id: LoopStep
  labelEn: string
  labelFr: string
  href: string | null
}[] = [
  { id: "plan",  labelEn: "Define",  labelFr: "Définir", href: "/app/define" },
  { id: "focus", labelEn: "Focus",   labelFr: "Focus",   href: "/app/focus"  },
  { id: "done",  labelEn: "Complete", labelFr: "Terminé", href: null          },
]

export function LoopIndicator() {
  const { objective, todayGoalCompleted, currentSession } = useAppStore()
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  if (!objective || objective.status !== "active") return null

  const activeStep  = getLoopStep(objective.rightNowAction, todayGoalCompleted, !!currentSession)
  const activeIndex = STEPS.findIndex(s => s.id === activeStep)

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isActive   = step.id === activeStep
        const isComplete = i < activeIndex
        const isLast     = i === STEPS.length - 1

        const pill = (
          <motion.div
            whileHover={step.href ? { scale: 1.03 } : {}}
            whileTap={step.href ? { scale: 0.97 } : {}}
            className={cn(
              "h-7 px-3.5 rounded-full flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 select-none",
              isActive  && "bg-primary/12 text-primary ring-1 ring-primary/25",
              isComplete && "text-primary/35",
              !isActive && !isComplete && "text-white/18",
              step.href && !isActive && "hover:text-white/35 cursor-pointer",
              step.href && isActive  && "cursor-pointer",
              !step.href && "cursor-default",
            )}
          >
            {isActive && (
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            )}
            {isComplete && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary/35 shrink-0" />
            )}
            {t(step.labelEn, step.labelFr)}
          </motion.div>
        )

        return (
          <div key={step.id} className="flex items-center">
            {step.href ? <Link href={step.href}>{pill}</Link> : <div>{pill}</div>}
            {!isLast && (
              <span className="text-white/10 text-[10px] mx-0.5 select-none">·</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
