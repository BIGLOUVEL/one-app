"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Calendar,
  Target,
  StickyNote,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { FocusSession } from "@/lib/types"

export default function SessionsPage() {
  const router = useRouter()
  const hasHydrated = useHasHydrated()
  const { objective, sessions } = useAppStore()
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  // Redirect if no objective
  useEffect(() => {
    if (hasHydrated && !objective) {
      router.push("/app/define")
    }
  }, [objective, hasHydrated, router])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Filter sessions for current objective and sort by date (newest first)
  const objectiveSessions = sessions
    .filter((s) => s.objectiveId === objective?.id && s.endedAt)
    .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const getImpactLevel = (session: FocusSession) => {
    const distractions = session.distractions?.length || 0
    if (distractions === 0) return { label: "High Impact", color: "text-green-500", bg: "bg-green-500/10" }
    if (distractions <= 2) return { label: "Medium Impact", color: "text-yellow-500", bg: "bg-yellow-500/10" }
    return { label: "Low Impact", color: "text-red-500", bg: "bg-red-500/10" }
  }

  const toggleSession = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
          <p className="text-muted-foreground">
            Review your completed focus sessions and notes
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="w-4 h-4" />
              Total Sessions
            </div>
            <div className="text-2xl font-bold">{objectiveSessions.length}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="w-4 h-4" />
              Total Time
            </div>
            <div className="text-2xl font-bold">
              {formatDuration(
                objectiveSessions.reduce((sum, s) => sum + (s.actualDuration || s.duration), 0)
              )}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <CheckCircle2 className="w-4 h-4" />
              High Impact
            </div>
            <div className="text-2xl font-bold text-green-500">
              {objectiveSessions.filter((s) => (s.distractions?.length || 0) === 0).length}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <StickyNote className="w-4 h-4" />
              Notes Captured
            </div>
            <div className="text-2xl font-bold text-primary">
              {objectiveSessions.reduce((sum, s) => sum + (s.postIts?.length || 0), 0)}
            </div>
          </div>
        </motion.div>

        {/* Sessions List */}
        <div className="space-y-4">
          {objectiveSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-card border border-border rounded-xl"
            >
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start your first focus session to see your progress here
              </p>
              <button
                onClick={() => router.push("/app/focus")}
                className="text-primary hover:underline text-sm"
              >
                Go to Focus Mode
              </button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {objectiveSessions.map((session, index) => {
                const impact = getImpactLevel(session)
                const isExpanded = expandedSession === session.id
                const hasPostIts = session.postIts && session.postIts.length > 0

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Session Header - Clickable */}
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Date & Time */}
                        <div className="text-left">
                          <div className="font-medium">
                            {formatDate(session.endedAt!)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(session.startedAt)} - {formatTime(session.endedAt!)}
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDuration(session.actualDuration || session.duration)}
                        </div>

                        {/* Impact Badge */}
                        <div className={`hidden md:flex items-center gap-1 text-xs px-2 py-1 rounded-full ${impact.bg} ${impact.color}`}>
                          {impact.label}
                        </div>

                        {/* Post-its indicator */}
                        {hasPostIts && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <StickyNote className="w-4 h-4" />
                            <span className="hidden md:inline">{session.postIts!.length} notes</span>
                          </div>
                        )}
                      </div>

                      {/* Expand/Collapse */}
                      <div className="flex items-center gap-2">
                        {session.distractions?.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <AlertTriangle className="w-4 h-4" />
                            {session.distractions.length}
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border"
                        >
                          <div className="p-4 space-y-4">
                            {/* Mobile stats */}
                            <div className="flex md:hidden items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {formatDuration(session.actualDuration || session.duration)}
                              </div>
                              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${impact.bg} ${impact.color}`}>
                                {impact.label}
                              </div>
                            </div>

                            {/* Reflection */}
                            {session.reflection && (
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                  Reflection
                                </h4>
                                <p className="text-sm bg-muted/30 rounded-lg p-3">
                                  {session.reflection}
                                </p>
                              </div>
                            )}

                            {/* Next Action */}
                            {session.nextAction && (
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                  Next Action
                                </h4>
                                <p className="text-sm bg-primary/10 text-primary rounded-lg p-3">
                                  {session.nextAction}
                                </p>
                              </div>
                            )}

                            {/* Post-its */}
                            {hasPostIts && (
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                  <StickyNote className="w-4 h-4" />
                                  Session Notes ({session.postIts!.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {session.postIts!.map((postIt) => (
                                    <div
                                      key={postIt.id}
                                      className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 rounded-lg p-3 text-sm"
                                      style={{
                                        transform: `rotate(${postIt.rotation}deg)`,
                                      }}
                                    >
                                      {postIt.text}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Distractions */}
                            {session.distractions && session.distractions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Distractions ({session.distractions.length})
                                </h4>
                                <div className="space-y-1">
                                  {session.distractions.map((distraction) => (
                                    <div
                                      key={distraction.id}
                                      className="text-sm text-muted-foreground bg-muted/30 rounded px-3 py-2"
                                    >
                                      {distraction.text}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
