"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  Square,
  AlertCircle,
  Plus,
  X,
  Check,
  Timer,
  Smartphone,
  Bell,
  DoorClosed,
  Volume2,
  Target,
  Quote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

type SessionState = "idle" | "bunker-checklist" | "active" | "paused" | "reflection"

interface BunkerItem {
  id: string
  label: string
  icon: typeof Smartphone
  checked: boolean
}

const initialBunkerChecklist: BunkerItem[] = [
  { id: "phone", label: "Phone on silent / Do Not Disturb", icon: Smartphone, checked: false },
  { id: "notifications", label: "All notifications disabled", icon: Bell, checked: false },
  { id: "door", label: "Door closed / signal set", icon: DoorClosed, checked: false },
  { id: "noise", label: "Noise handled (headphones/quiet)", icon: Volume2, checked: false },
]

// Motivational quotes from successful people
const motivationalQuotes = [
  { text: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Victory belongs to the most persevering.", author: "Napoleon Bonaparte" },
  { text: "Impossible is a word to be found only in the dictionary of fools.", author: "Napoleon Bonaparte" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Success is going from failure to failure without losing your enthusiasm.", author: "Winston Churchill" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "The harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "I find that the harder I work, the more luck I have.", author: "Benjamin Franklin" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The person who says it cannot be done should not interrupt the person who is doing it.", author: "Chinese Proverb" },
]

export default function FocusPage() {
  const router = useRouter()
  const {
    objective,
    currentSession,
    focusBlock,
    startSession,
    endSession,
    addDistraction,
  } = useAppStore()

  const [sessionState, setSessionState] = useState<SessionState>("idle")
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [bunkerChecklist, setBunkerChecklist] = useState(initialBunkerChecklist)
  const [showDistractionModal, setShowDistractionModal] = useState(false)
  const [distractionText, setDistractionText] = useState("")
  const [reflectionText, setReflectionText] = useState("")
  const [nextActionText, setNextActionText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showMotivationalQuotes, setShowMotivationalQuotes] = useState(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  // Session duration in minutes (default 50, or from focus block)
  const sessionDuration = focusBlock?.duration ?? 50

  // Initialize
  useEffect(() => {
    setIsLoading(false)
    if (currentSession && !currentSession.endedAt) {
      // Resume existing session
      const elapsed = Math.floor(
        (Date.now() - new Date(currentSession.startedAt).getTime()) / 1000
      )
      const remaining = Math.max(0, currentSession.duration * 60 - elapsed)
      setTimeLeft(remaining)
      setSessionState("active")
    }
  }, [currentSession])

  // Timer countdown
  useEffect(() => {
    if (sessionState !== "active" || isPaused) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setSessionState("reflection")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionState, isPaused])

  // Redirect if no objective
  useEffect(() => {
    if (!isLoading && !objective) {
      router.push("/app/define")
    }
  }, [objective, isLoading, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleBunkerCheck = (id: string) => {
    setBunkerChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const allBunkerChecked = bunkerChecklist.every((item) => item.checked)

  const handleStartChecklist = () => {
    setSessionState("bunker-checklist")
    setCurrentQuoteIndex(0)
  }

  const handleStartSession = () => {
    startSession()
    setTimeLeft(sessionDuration * 60)
    setSessionState("active")
    setIsPaused(false)
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
    setSessionState(isPaused ? "active" : "paused")
  }

  const handleEndSession = () => {
    setSessionState("reflection")
  }

  const handleCompleteSession = () => {
    endSession(reflectionText, nextActionText)
    setSessionState("idle")
    setReflectionText("")
    setNextActionText("")
    setBunkerChecklist(initialBunkerChecklist)
    setShowMotivationalQuotes(false)
    router.push("/app")
  }

  // Rotate motivational quotes during active session
  useEffect(() => {
    if (sessionState === "active" && showMotivationalQuotes && !isPaused) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)
      }, 12000) // Change quote every 12 seconds

      return () => clearInterval(interval)
    }
  }, [sessionState, showMotivationalQuotes, isPaused])

  const handleAddDistraction = useCallback(() => {
    if (distractionText.trim()) {
      addDistraction(distractionText.trim())
      setDistractionText("")
      setShowDistractionModal(false)
    }
  }, [distractionText, addDistraction])

  // Handle keyboard shortcut for distraction dump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionState === "active" || sessionState === "paused") {
        if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setShowDistractionModal(true)
        }
        if (e.key === "Escape" && showDistractionModal) {
          setShowDistractionModal(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sessionState, showDistractionModal])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-lg p-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/3 mx-auto" />
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-12 bg-white/5 rounded-xl" />
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

  const progress = timeLeft > 0 ? ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100 : 100

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Ambient glow - stronger during active session */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] blur-[120px] rounded-full pointer-events-none transition-all duration-1000 ${
          sessionState === "active"
            ? "bg-emerald-500/20"
            : sessionState === "paused"
            ? "bg-orange-500/15"
            : "bg-primary/5"
        }`}
      />

      <div className="w-full max-w-2xl relative z-10">
        {/* Idle State - Start Button */}
        <AnimatePresence mode="wait">
          {sessionState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <Timer className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">Focus Session</h1>
                <p className="text-muted-foreground">
                  {sessionDuration} minutes of deep work on your ONE thing.
                </p>
              </div>

              {/* Current objective preview */}
              <div className="liquid-glass p-6 text-left space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's ONE Thing</p>
                  <p className="text-lg font-medium">{objective.todayGoal}</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Right Now Action</p>
                  <p className="text-emerald-400">{objective.rightNowAction}</p>
                </div>
              </div>

              <Button
                onClick={handleStartChecklist}
                className="h-14 px-8 rounded-2xl text-base font-medium glow-green"
              >
                <Play className="mr-2 h-5 w-5" />
                Enter Bunker Mode
              </Button>
            </motion.div>
          )}

          {/* Bunker Checklist */}
          {sessionState === "bunker-checklist" && (
            <motion.div
              key="bunker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Bunker Checklist</h1>
                <p className="text-muted-foreground">
                  Eliminate all distractions before you begin.
                </p>
              </div>

              <div className="liquid-glass p-6 space-y-4">
                {bunkerChecklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleBunkerCheck(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      item.checked
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                        item.checked
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-white/30"
                      }`}
                    >
                      {item.checked && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <item.icon className={`h-5 w-5 ${item.checked ? "text-emerald-400" : "text-muted-foreground"}`} />
                    <span className={item.checked ? "text-emerald-400" : ""}>{item.label}</span>
                  </button>
                ))}
                
                {/* Motivational quotes toggle */}
                <button
                  onClick={() => setShowMotivationalQuotes(!showMotivationalQuotes)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    showMotivationalQuotes
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                      showMotivationalQuotes
                        ? "bg-amber-500 border-amber-500"
                        : "border-white/30"
                    }`}
                  >
                    {showMotivationalQuotes && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <Quote className={`h-5 w-5 ${showMotivationalQuotes ? "text-amber-400" : "text-muted-foreground"}`} />
                  <span className={showMotivationalQuotes ? "text-amber-400" : ""}>
                    Show motivational quotes during session
                  </span>
                </button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSessionState("idle")}
                  className="h-14 px-6 rounded-2xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleStartSession}
                  disabled={!allBunkerChecked}
                  className={`flex-1 h-14 rounded-2xl text-base font-medium transition-all ${
                    allBunkerChecked
                      ? "glow-green bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-white/5 text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Session
                </Button>
              </div>
            </motion.div>
          )}

          {/* Active/Paused Session */}
          {(sessionState === "active" || sessionState === "paused") && (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-8"
            >
              {/* Timer display */}
              <div className="space-y-4">
                <motion.div
                  animate={{
                    opacity: isPaused ? 0.5 : 1,
                    scale: isPaused ? 0.98 : 1,
                  }}
                  className="relative inline-block"
                >
                  <span className={`text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums ${
                    isPaused ? "text-orange-400" : timeLeft < 300 ? "text-orange-400" : "text-emerald-400"
                  }`}>
                    {formatTime(timeLeft)}
                  </span>
                  {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-medium text-orange-400 bg-background/80 px-4 py-2 rounded-xl">
                        PAUSED
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Progress bar */}
                <div className="h-2 w-full max-w-md mx-auto bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${
                      isPaused ? "bg-orange-400" : "bg-emerald-400"
                    }`}
                  />
                </div>
              </div>

              {/* Current focus */}
              <div className="liquid-glass-green p-6 text-left max-w-md mx-auto">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Focus On</p>
                <p className="text-lg font-medium">{objective.rightNowAction}</p>
              </div>

              {/* Motivational quotes display */}
              {showMotivationalQuotes && (
                <motion.div
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-lg mx-auto px-4"
                >
                  <div className="liquid-glass p-6 text-center border border-amber-500/10">
                    <Quote className="h-5 w-5 text-amber-400/40 mx-auto mb-3" />
                    <p className="text-sm sm:text-base italic text-foreground/80 mb-2">
                      "{motivationalQuotes[currentQuoteIndex].text}"
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      — {motivationalQuotes[currentQuoteIndex].author}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handlePauseResume}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl p-0"
                >
                  {isPaused ? (
                    <Play className="h-6 w-6" />
                  ) : (
                    <Pause className="h-6 w-6" />
                  )}
                </Button>

                <Button
                  onClick={() => setShowDistractionModal(true)}
                  variant="outline"
                  className="h-14 px-6 rounded-2xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Dump Distraction
                </Button>

                <Button
                  onClick={handleEndSession}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl p-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Square className="h-5 w-5" />
                </Button>
              </div>

              {/* Keyboard hint */}
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/10">D</kbd> to dump a distraction
              </p>

              {/* Distraction count */}
              {currentSession && currentSession.distractions.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  {currentSession.distractions.length} distraction{currentSession.distractions.length > 1 ? "s" : ""} captured
                </div>
              )}
            </motion.div>
          )}

          {/* Reflection State */}
          {sessionState === "reflection" && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Session Complete</h1>
                <p className="text-muted-foreground">
                  Take a moment to reflect on your progress.
                </p>
              </div>

              <div className="liquid-glass p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    What did you move forward?
                  </label>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Describe what you accomplished..."
                    rows={3}
                    className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    What's the next action? (optional)
                  </label>
                  <input
                    type="text"
                    value={nextActionText}
                    onChange={(e) => setNextActionText(e.target.value)}
                    placeholder="The very next thing to do..."
                    className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Distractions summary */}
              {currentSession && currentSession.distractions.length > 0 && (
                <div className="liquid-glass p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Distractions to handle later ({currentSession.distractions.length})
                  </p>
                  <ul className="space-y-2">
                    {currentSession.distractions.map((d) => (
                      <li key={d.id} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                        <span>{d.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={handleCompleteSession}
                className="w-full h-14 rounded-2xl text-base font-medium glow-green"
              >
                <Check className="mr-2 h-5 w-5" />
                Complete Session
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Distraction Dump Modal */}
      <AnimatePresence>
        {showDistractionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowDistractionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Dump Distraction</h2>
                <button
                  onClick={() => setShowDistractionModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Write it down, let it go, get back to work.
              </p>

              <input
                type="text"
                value={distractionText}
                onChange={(e) => setDistractionText(e.target.value)}
                placeholder="What's distracting you?"
                className="w-full bg-white/5 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddDistraction()
                  }
                }}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDistractionModal(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDistraction}
                  disabled={!distractionText.trim()}
                  className="flex-1 h-12 rounded-xl glow-green"
                >
                  Capture & Return
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
