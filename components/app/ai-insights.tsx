"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  ChevronRight,
  RefreshCw,
  Loader2,
  Lightbulb,
  Zap,
  Heart,
  ArrowRight,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"

interface AIInsightsData {
  summary: string
  insights: string[]
  nextActions: string[]
  warning: string | null
  encouragement: string
  stats: {
    totalSessions: number
    totalMinutes: number
    avgSessionMinutes: number
    peakHour: number | null
    peakDay: string | null
    daysRemaining: number
    daysElapsed: number
    totalDays: number
    expectedProgress: number
    actualProgress: number
  }
}

export function AIInsights() {
  const {
    objective,
    sessions,
    habitChallenge,
    thievesAssessment,
    reviews,
  } = useAppStore()

  const [insights, setInsights] = useState<AIInsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetchInsights = async () => {
    if (!objective) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: {
            title: objective.title,
            somedayGoal: objective.somedayGoal,
            monthGoal: objective.monthGoal,
            weekGoal: objective.weekGoal,
            todayGoal: objective.todayGoal,
            rightNowAction: objective.rightNowAction,
            deadline: objective.deadline,
            createdAt: objective.createdAt,
            progress: objective.progress,
            why: objective.why,
          },
          sessions: sessions.map(s => ({
            startedAt: s.startedAt,
            endedAt: s.endedAt,
            duration: s.duration,
            actualDuration: s.actualDuration,
            distractions: s.distractions,
            reflection: s.reflection,
            nextAction: s.nextAction,
          })),
          habitChallenge: habitChallenge ? {
            startDate: habitChallenge.startDate,
            currentStreak: habitChallenge.currentStreak,
            longestStreak: habitChallenge.longestStreak,
            days: habitChallenge.days,
          } : undefined,
          primaryThief: thievesAssessment?.primaryThief,
          reviews: reviews.map(r => ({
            weekOf: r.weekOf,
            accomplishments: r.accomplishments,
            blockers: r.blockers,
            nextWeekOneThink: r.nextWeekOneThink,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data)
        setLastFetched(new Date())
      } else {
        setError("Impossible de générer les insights")
      }
    } catch (err) {
      setError("Erreur de connexion")
      console.error("Failed to fetch insights:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch on mount if no insights
  useEffect(() => {
    if (objective && !insights && !isLoading) {
      fetchInsights()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective])

  if (!objective) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-primary/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50" />

      <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.05] to-primary/[0.05] overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-primary/20 border border-violet-500/30">
              <Brain className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                AI Coach
                <Sparkles className="h-4 w-4 text-violet-400" />
              </h3>
              <p className="text-xs text-muted-foreground">
                {lastFetched
                  ? `Mis à jour ${lastFetched.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                  : "Analyse de vos données"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                fetchInsights()
              }}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <ChevronRight
              className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-violet-400 animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Analyse en cours...</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">L'IA examine vos sessions, objectifs et patterns</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="h-8 w-8 text-amber-400 mb-3" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <button
                      onClick={fetchInsights}
                      className="mt-3 text-xs text-primary hover:underline"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : insights ? (
                  <>
                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-sm leading-relaxed">{insights.summary}</p>
                    </div>

                    {/* Warning if any */}
                    {insights.warning && (
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                      >
                        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">{insights.warning}</p>
                      </motion.div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        </div>
                        <p className="text-lg font-bold">{Math.round(insights.stats.totalMinutes / 60)}h</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Travaillées</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <p className="text-lg font-bold">{insights.stats.totalSessions}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessions</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                        <p className="text-lg font-bold">{insights.stats.daysRemaining}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Jours restants</p>
                      </div>
                    </div>

                    {/* Peak time insight */}
                    {(insights.stats.peakHour !== null || insights.stats.peakDay) && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          Votre pic de productivité :{" "}
                          <span className="text-foreground font-medium">
                            {insights.stats.peakDay}{insights.stats.peakHour !== null && ` vers ${insights.stats.peakHour}h`}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Insights */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-3">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Insights
                      </div>
                      {insights.insights.map((insight, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                          <p className="text-sm leading-relaxed">{insight}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Next Actions */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-3">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Actions suggérées
                      </div>
                      {insights.nextActions.map((action, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors cursor-pointer"
                        >
                          <div className="p-1 rounded-md bg-primary/20">
                            <ChevronRight className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-sm font-medium">{action}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Encouragement */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20"
                    >
                      <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm italic">{insights.encouragement}</p>
                    </motion.div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Brain className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Cliquez sur Refresh pour générer vos insights</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
