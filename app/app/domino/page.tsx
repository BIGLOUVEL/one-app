"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  GitBranch,
  Mountain,
  Target,
  Calendar,
  Sun,
  Clock,
  ChevronDown,
  Check,
  AlertCircle,
  Edit3,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import type { Objective } from "@/lib/types"

interface DominoLevel {
  key: keyof Pick<Objective, 'somedayGoal' | 'monthGoal' | 'weekGoal' | 'todayGoal' | 'rightNowAction'>
  label: string
  icon: typeof Mountain
  color: string
  bgColor: string
}

const dominoLevels: DominoLevel[] = [
  { key: "somedayGoal", label: "Someday", icon: Mountain, color: "text-violet-400", bgColor: "bg-violet-500/10 border-violet-500/20" },
  { key: "monthGoal", label: "This Month", icon: Target, color: "text-primary", bgColor: "bg-primary/10 border-primary/20" },
  { key: "weekGoal", label: "This Week", icon: Calendar, color: "text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
  { key: "todayGoal", label: "Today", icon: Sun, color: "text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/20" },
  { key: "rightNowAction", label: "Right Now", icon: Clock, color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
]

export default function DominoPage() {
  const router = useRouter()
  const { objective, updateCascade } = useAppStore()
  const [editingLevel, setEditingLevel] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showAlignmentCheck, setShowAlignmentCheck] = useState(false)
  const [alignmentAnswer, setAlignmentAnswer] = useState<"yes" | "no" | null>(null)

  if (!objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No objective set yet.</p>
          <Button onClick={() => router.push("/app/define")}>
            Define Your ONE Thing
          </Button>
        </div>
      </div>
    )
  }

  const startEditing = (level: DominoLevel) => {
    setEditingLevel(level.key)
    setEditValue(objective[level.key] || "")
  }

  const saveEdit = (key: string) => {
    if (editValue.trim()) {
      updateCascade(key as keyof Pick<typeof objective, 'somedayGoal' | 'monthGoal' | 'weekGoal' | 'todayGoal' | 'rightNowAction'>, editValue.trim())
    }
    setEditingLevel(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingLevel(null)
    setEditValue("")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Domino Path</h1>
          <p className="text-muted-foreground">
            Your goal cascade — from someday vision to right-now action
          </p>
        </motion.div>

        {/* Domino Chain */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {dominoLevels.map((level, index) => {
            const value = objective[level.key]
            const isEditing = editingLevel === level.key
            const Icon = level.icon

            return (
              <motion.div
                key={level.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Connector line */}
                {index > 0 && (
                  <div className="flex justify-center -my-2 relative z-0">
                    <div className="w-px h-6 bg-gradient-to-b from-white/10 to-white/5" />
                    <ChevronDown className="h-4 w-4 text-muted-foreground absolute top-1" />
                  </div>
                )}

                <div className={`relative rounded-2xl border p-4 sm:p-5 transition-all ${level.bgColor}`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${level.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {level.label}
                      </p>

                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-white/5 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(level.key)
                              if (e.key === "Escape") cancelEdit()
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(level.key)}
                              className="h-8"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-8"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base sm:text-lg font-medium">
                            {value || <span className="text-muted-foreground italic">Not set</span>}
                          </p>
                          <button
                            onClick={() => startEditing(level)}
                            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Alignment Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          {!showAlignmentCheck ? (
            <Button
              onClick={() => setShowAlignmentCheck(true)}
              variant="outline"
              className="w-full h-12 rounded-2xl"
            >
              <Check className="mr-2 h-4 w-4" />
              Run Domino Check
            </Button>
          ) : (
            <div className="liquid-glass p-6 space-y-4">
              <h3 className="font-semibold text-center">Domino Alignment Check</h3>
              <p className="text-center text-muted-foreground text-sm">
                Does your <span className="text-emerald-400">Right Now Action</span> directly move your{" "}
                <span className="text-orange-400">Today</span> goal forward?
              </p>

              {alignmentAnswer === null ? (
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setAlignmentAnswer("yes")}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Yes, aligned
                  </Button>
                  <Button
                    onClick={() => setAlignmentAnswer("no")}
                    variant="outline"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    No, misaligned
                  </Button>
                </div>
              ) : alignmentAnswer === "yes" ? (
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Check className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-emerald-400 font-medium">Perfect alignment.</p>
                  <p className="text-muted-foreground text-sm">
                    Your dominoes are lined up. Execute your Right Now Action.
                  </p>
                  <Button
                    onClick={() => {
                      setShowAlignmentCheck(false)
                      setAlignmentAnswer(null)
                    }}
                    variant="ghost"
                    className="text-muted-foreground"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <AlertCircle className="h-6 w-6 text-orange-400" />
                      </div>
                    </div>
                    <p className="text-orange-400 font-medium">Misalignment detected.</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Update your Right Now Action to serve Today's goal.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      startEditing(dominoLevels[4])
                      setShowAlignmentCheck(false)
                      setAlignmentAnswer(null)
                    }}
                    className="w-full"
                  >
                    Edit Right Now Action
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* The Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-muted-foreground italic">
            "What's the ONE thing I can do such that by doing it everything else will be easier or unnecessary?"
          </p>
        </motion.div>
      </div>
    </div>
  )
}
