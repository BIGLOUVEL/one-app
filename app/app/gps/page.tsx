"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  Navigation,
  Plus,
  X,
  Check,
  Star,
  Save,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

interface LocalPriority {
  id: string
  name: string
  strategies: string[]
  isActive: boolean
}

export default function GPSPage() {
  const router = useRouter()
  const { objective, gpsPlan, setGPSPlan, setActivePriority } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [goal, setGoal] = useState("")
  const [priorities, setPriorities] = useState<LocalPriority[]>([
    { id: "1", name: "", strategies: ["", "", ""], isActive: true },
  ])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setIsLoading(false)
    // Load existing data if available
    if (gpsPlan) {
      setGoal(gpsPlan.goal)
      setPriorities(
        gpsPlan.priorities.map((p) => ({
          id: p.id,
          name: p.name,
          strategies: [
            p.strategies[0] ?? "",
            p.strategies[1] ?? "",
            p.strategies[2] ?? "",
          ],
          isActive: p.isActive,
        }))
      )
    } else if (objective) {
      // Pre-fill goal from objective
      setGoal(objective.todayGoal)
    }
  }, [gpsPlan, objective])

  // Redirect if no objective
  useEffect(() => {
    if (!isLoading && !objective) {
      router.push("/app/define")
    }
  }, [objective, isLoading, router])

  const handleGoalChange = (value: string) => {
    setGoal(value)
    setHasUnsavedChanges(true)
  }

  const handlePriorityNameChange = (id: string, value: string) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: value } : p))
    )
    setHasUnsavedChanges(true)
  }

  const handleStrategyChange = (priorityId: string, strategyIndex: number, value: string) => {
    setPriorities((prev) =>
      prev.map((p) =>
        p.id === priorityId
          ? {
              ...p,
              strategies: p.strategies.map((s, i) =>
                i === strategyIndex ? value : s
              ),
            }
          : p
      )
    )
    setHasUnsavedChanges(true)
  }

  const handleSetActive = (id: string) => {
    setPriorities((prev) =>
      prev.map((p) => ({ ...p, isActive: p.id === id }))
    )
    setHasUnsavedChanges(true)
  }

  const handleAddPriority = () => {
    if (priorities.length >= 3) return
    const newId = Date.now().toString()
    setPriorities((prev) => [
      ...prev,
      { id: newId, name: "", strategies: ["", "", ""], isActive: false },
    ])
    setHasUnsavedChanges(true)
  }

  const handleRemovePriority = (id: string) => {
    if (priorities.length <= 1) return
    setPriorities((prev) => {
      const filtered = prev.filter((p) => p.id !== id)
      // If we removed the active one, make first one active
      if (!filtered.some((p) => p.isActive)) {
        filtered[0].isActive = true
      }
      return filtered
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    setGPSPlan(
      goal,
      priorities.map((p) => ({
        name: p.name,
        strategies: p.strategies.filter((s) => s.trim()),
      }))
    )
    // Set the active priority in store
    const activePriority = priorities.find((p) => p.isActive)
    if (activePriority && gpsPlan) {
      const storePriority = gpsPlan.priorities.find(
        (p) => p.name === activePriority.name
      )
      if (storePriority) {
        setActivePriority(storePriority.id)
      }
    }
    setHasUnsavedChanges(false)
  }

  const handlePrint = () => {
    window.print()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-3xl p-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/4" />
          <div className="h-20 bg-white/5 rounded-2xl" />
          <div className="h-40 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Target className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  const activePriority = priorities.find((p) => p.isActive)

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 print:p-8 print:bg-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none print:hidden" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between print:hidden"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">GPS Plan</h1>
            </div>
            <p className="text-muted-foreground">
              One-page strategic plan for your ONE thing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="hidden sm:flex"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button onClick={handleSave} className="glow-green">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold text-black">GPS One-Page Plan</h1>
          <p className="text-gray-500">Generated from ONE</p>
        </div>

        {/* Goal Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="liquid-glass p-4 sm:p-6 print:border print:border-gray-200 print:bg-white print:shadow-none"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 print:bg-green-50 print:border-green-200">
              <Target className="h-4 w-4 text-primary print:text-green-600" />
            </div>
            <h2 className="font-semibold print:text-black">Goal</h2>
          </div>
          <input
            type="text"
            value={goal}
            onChange={(e) => handleGoalChange(e.target.value)}
            placeholder="One sentence that captures your ultimate goal..."
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40 print:bg-gray-50 print:text-black print:border print:border-gray-200"
          />
        </motion.div>

        {/* Active Priority Highlight */}
        {activePriority && activePriority.name && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="liquid-glass-green p-4 print:bg-green-50 print:border print:border-green-200"
          >
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary print:text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-500">THE ONE Priority Right Now</p>
                <p className="font-semibold text-lg print:text-black">{activePriority.name}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Priorities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg print:text-black">Priorities (Max 3)</h2>
            {priorities.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPriority}
                className="print:hidden"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Priority
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {priorities.map((priority, index) => (
              <motion.div
                key={priority.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`liquid-glass p-4 sm:p-6 transition-all print:border print:bg-white print:shadow-none ${
                  priority.isActive
                    ? "border-primary/30 bg-primary/5 print:border-green-300 print:bg-green-50"
                    : "print:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground print:text-gray-500">
                        Priority {index + 1}
                      </span>
                      {priority.isActive && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full print:bg-green-100 print:text-green-700">
                          Active
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={priority.name}
                      onChange={(e) =>
                        handlePriorityNameChange(priority.id, e.target.value)
                      }
                      placeholder="Priority name..."
                      className="w-full bg-white/5 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40 print:bg-gray-50 print:text-black print:border print:border-gray-200"
                    />
                  </div>

                  <div className="flex gap-2 print:hidden">
                    {!priority.isActive && (
                      <button
                        onClick={() => handleSetActive(priority.id)}
                        className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                        title="Set as active priority"
                      >
                        <Star className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </button>
                    )}
                    {priorities.length > 1 && (
                      <button
                        onClick={() => handleRemovePriority(priority.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Remove priority"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Strategies */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground print:text-gray-500">
                    Strategies (Max 3)
                  </p>
                  {priority.strategies.map((strategy, stratIndex) => (
                    <div key={stratIndex} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0 print:bg-green-400" />
                      <input
                        type="text"
                        value={strategy}
                        onChange={(e) =>
                          handleStrategyChange(
                            priority.id,
                            stratIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Strategy ${stratIndex + 1}...`}
                        className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40 print:bg-gray-50 print:text-black print:border print:border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] print:hidden"
        >
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">GPS Principle:</strong> Your Goal is the destination,
            Priorities are the major roads, and Strategies are the specific turns. Keep it on one page
            to maintain clarity.
          </p>
        </motion.div>

        {/* Print Footer */}
        <div className="hidden print:block text-center text-sm text-gray-400 mt-8 pt-4 border-t">
          ONE - The ONE Thing Operating System
        </div>
      </div>
    </div>
  )
}
