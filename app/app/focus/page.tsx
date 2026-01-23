"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Smartphone,
  Bell,
  DoorClosed,
  Volume2,
  Clock,
  StickyNote,
  Sparkles,
  Quote,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconBolt, IconTarget } from "@/components/ui/custom-icons"
import { useAppStore } from "@/store/useAppStore"

// ============================================
// TYPES
// ============================================
type SessionState = "idle" | "bunker-checklist" | "session-setup" | "active" | "paused" | "reflection"

interface BunkerItem {
  id: string
  label: string
  icon: typeof Smartphone
  checked: boolean
}

interface PostIt {
  id: string
  text: string
  x: number
  y: number
  rotation: number // slight tilt for realism
  color: string
}

// ============================================
// CONSTANTS
// ============================================
const initialBunkerChecklist: BunkerItem[] = [
  { id: "phone", label: "Phone on silent / Do Not Disturb", icon: Smartphone, checked: false },
  { id: "notifications", label: "All notifications disabled", icon: Bell, checked: false },
  { id: "door", label: "Door closed / signal set", icon: DoorClosed, checked: false },
  { id: "noise", label: "Noise handled (headphones/quiet)", icon: Volume2, checked: false },
]

const durationPresets = [
  { label: "25 min", value: 25, description: "Pomodoro" },
  { label: "50 min", value: 50, description: "Deep work" },
  { label: "90 min", value: 90, description: "Flow state" },
]

// Post-it color - classic yellow
const postItColor = "bg-yellow-200"

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

// ============================================
// POST-IT COMPONENT (Draggable + Editable)
// ============================================
function PostItElement({
  note,
  onDismiss,
  onDrag,
}: {
  note: PostIt
  onDismiss: (id: string) => void
  onDrag: (id: string, x: number, y: number) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const noteRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const rect = noteRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    onDrag(note.id, newX, newY)
  }, [isDragging, dragOffset, note.id, onDrag])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <motion.div
      ref={noteRef}
      initial={{ scale: 0.8, opacity: 0, rotate: note.rotation }}
      animate={{ scale: 1, opacity: 1, rotate: note.rotation }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed w-36 shadow-lg group select-none"
      style={{
        left: note.x,
        top: note.y,
        zIndex: isDragging ? 1000 : 100,
        cursor: isDragging ? 'grabbing' : 'grab',
        background: '#fef08a',
        boxShadow: '2px 3px 8px rgba(0,0,0,0.15)',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDismiss(note.id)
        }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-neutral-700"
      >
        <X className="h-3 w-3 text-white" />
      </button>

      {/* Text - simple paragraph */}
      <p className="p-3 text-neutral-800 text-sm leading-relaxed break-words">
        {note.text}
      </p>
    </motion.div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
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

  // States
  const [sessionState, setSessionState] = useState<SessionState>("idle")
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [bunkerChecklist, setBunkerChecklist] = useState(initialBunkerChecklist)
  const [showDistractionModal, setShowDistractionModal] = useState(false)
  const [distractionText, setDistractionText] = useState("")
  const [reflectionText, setReflectionText] = useState("")
  const [nextActionText, setNextActionText] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Session setup states
  const [sessionObjective, setSessionObjective] = useState("")
  const [sessionDuration, setSessionDuration] = useState(50)
  const [customDuration, setCustomDuration] = useState("")

  // Post-it notes states
  const [postIts, setPostIts] = useState<PostIt[]>([])
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [newNoteText, setNewNoteText] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Objective completion state
  const [objectiveCompleted, setObjectiveCompleted] = useState(false)

  // Motivational quotes states
  const [showMotivationalQuotes, setShowMotivationalQuotes] = useState(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  // Editable focus objective during session
  const [isEditingFocus, setIsEditingFocus] = useState(false)

  // Initialize session objective from today's goal
  useEffect(() => {
    if (objective?.todayGoal) {
      setSessionObjective(objective.todayGoal)
    }
  }, [objective])

  // Initialize
  useEffect(() => {
    setIsLoading(false)
    if (currentSession && !currentSession.endedAt) {
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


  // Rotate motivational quotes during active session
  useEffect(() => {
    if (sessionState === "active" && showMotivationalQuotes && !isPaused) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)
      }, 12000) // Change quote every 12 seconds

      return () => clearInterval(interval)
    }
  }, [sessionState, showMotivationalQuotes, isPaused])

  // Helpers
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
  }

  const handleProceedToSetup = () => {
    setSessionState("session-setup")
  }

  const handleStartSession = () => {
    const duration = customDuration ? parseInt(customDuration) : sessionDuration
    startSession()
    setTimeLeft(duration * 60)
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
    // TODO: Save session with postIts snapshot and objectiveCompleted status
    endSession(reflectionText, nextActionText)
    setSessionState("idle")
    setReflectionText("")
    setNextActionText("")
    setBunkerChecklist(initialBunkerChecklist)
    setPostIts([])
    setShowMotivationalQuotes(false)
    setIsEditingFocus(false)
    setObjectiveCompleted(false)
    router.push("/app")
  }

  // Post-it handlers
  const handleAddPostIt = () => {
    if (!newNoteText.trim()) return

    // Place at center of screen initially - user will drag to desired position
    const newPostIt: PostIt = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
      x: window.innerWidth / 2 - 96, // center horizontally (192px width / 2)
      y: window.innerHeight / 2 - 96, // center vertically (192px height / 2)
      rotation: 0, // no rotation for clean look
      color: postItColor,
    }

    setPostIts((prev) => [...prev, newPostIt])
    setNewNoteText("")
    setShowNoteInput(false)
  }

  const handleDragPostIt = useCallback((id: string, x: number, y: number) => {
    setPostIts((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, x, y } : note
      )
    )
  }, [])

  const handleDismissPostIt = (id: string) => {
    setPostIts((prev) => prev.filter((note) => note.id !== id))
  }

  const handleAddDistraction = useCallback(() => {
    if (distractionText.trim()) {
      addDistraction(distractionText.trim())
      setDistractionText("")
      setShowDistractionModal(false)
    }
  }, [distractionText, addDistraction])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionState === "active" || sessionState === "paused") {
        if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setShowDistractionModal(true)
        }
        if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setShowNoteInput(true)
        }
        if (e.key === "Escape") {
          setShowDistractionModal(false)
          setShowNoteInput(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sessionState])

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
        <IconTarget size="lg" className="animate-pulse" />
      </div>
    )
  }

  const progress = timeLeft > 0 ? ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100 : 100

  return (
    <div
      ref={containerRef}
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] blur-[120px] rounded-full pointer-events-none transition-all duration-1000 ${
          sessionState === "active"
            ? "bg-emerald-500/20"
            : sessionState === "paused"
            ? "bg-orange-500/15"
            : "bg-primary/5"
        }`}
      />

      {/* Post-it Notes Layer */}
      <AnimatePresence>
        {postIts.map((note) => (
          <PostItElement
            key={note.id}
            note={note}
            onDismiss={handleDismissPostIt}
            onDrag={handleDragPostIt}
          />
        ))}
      </AnimatePresence>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {/* ============================================
              IDLE STATE
              ============================================ */}
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
                    <IconBolt size="lg" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">Focus Session</h1>
                <p className="text-muted-foreground">
                  Deep work on your ONE thing.
                </p>
              </div>

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

          {/* ============================================
              BUNKER CHECKLIST
              ============================================ */}
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
                  onClick={handleProceedToSetup}
                  disabled={!allBunkerChecked}
                  className={`flex-1 h-14 rounded-2xl text-base font-medium transition-all ${
                    allBunkerChecked
                      ? "glow-green bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-white/5 text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============================================
              SESSION SETUP (NEW!)
              ============================================ */}
          {sessionState === "session-setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Configure Session</h1>
                <p className="text-muted-foreground">
                  Set your focus for this session.
                </p>
              </div>

              <div className="liquid-glass p-6 space-y-6">
                {/* Session Objective */}
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    What's your objective for this session?
                  </label>
                  <textarea
                    value={sessionObjective}
                    onChange={(e) => setSessionObjective(e.target.value)}
                    placeholder="Describe what you want to accomplish..."
                    rows={2}
                    className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: Today's goal. Change if you want to focus on something specific.
                  </p>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-sm text-muted-foreground block mb-3">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Session duration
                  </label>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {durationPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => {
                          setSessionDuration(preset.value)
                          setCustomDuration("")
                        }}
                        className={`p-3 rounded-xl transition-all text-center ${
                          sessionDuration === preset.value && !customDuration
                            ? "bg-primary/20 border-2 border-primary"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <p className="font-medium">{preset.label}</p>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* Custom duration */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Custom:</span>
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="e.g. 45"
                      min="5"
                      max="180"
                      className="w-20 bg-white/5 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSessionState("bunker-checklist")}
                  className="h-14 px-6 rounded-2xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleStartSession}
                  disabled={!sessionObjective.trim()}
                  className="flex-1 h-14 rounded-2xl text-base font-medium glow-green"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start {customDuration || sessionDuration} min Session
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============================================
              ACTIVE/PAUSED SESSION
              ============================================ */}
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

              {/* Current focus (session objective) - EDITABLE + COMPLETABLE */}
              <div className={`p-6 text-left max-w-md mx-auto relative group rounded-2xl border transition-all ${
                objectiveCompleted
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "liquid-glass-green"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Focus On</p>
                  <div className="flex items-center gap-2">
                    {!isEditingFocus && !objectiveCompleted && (
                      <button
                        onClick={() => setIsEditingFocus(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                        title="Edit focus"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                {isEditingFocus ? (
                  <div className="space-y-3">
                    <textarea
                      value={sessionObjective}
                      onChange={(e) => setSessionObjective(e.target.value)}
                      className="w-full bg-white/5 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-lg"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingFocus(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {/* Completion checkbox */}
                    <button
                      onClick={() => setObjectiveCompleted(!objectiveCompleted)}
                      className={`mt-1 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        objectiveCompleted
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-white/30 hover:border-emerald-400"
                      }`}
                      title={objectiveCompleted ? "Mark as incomplete" : "Mark as completed"}
                    >
                      {objectiveCompleted && <Check className="h-4 w-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-lg font-medium transition-all ${
                          objectiveCompleted
                            ? "line-through text-emerald-400/70"
                            : "cursor-pointer hover:text-primary/80"
                        }`}
                        onClick={() => !objectiveCompleted && setIsEditingFocus(true)}
                      >
                        {sessionObjective || objective.rightNowAction}
                      </p>
                      {objectiveCompleted && (
                        <p className="text-sm text-emerald-400 mt-1">Objective completed!</p>
                      )}
                    </div>
                  </div>
                )}
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
              <div className="flex justify-center gap-3 flex-wrap">
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
                  onClick={() => setShowNoteInput(true)}
                  variant="outline"
                  className="h-14 px-5 rounded-2xl"
                >
                  <StickyNote className="mr-2 h-5 w-5" />
                  Note
                </Button>

                <Button
                  onClick={() => setShowDistractionModal(true)}
                  variant="outline"
                  className="h-14 px-5 rounded-2xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Distraction
                </Button>

                <Button
                  onClick={handleEndSession}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl p-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Square className="h-5 w-5" />
                </Button>
              </div>

              {/* Keyboard hints */}
              <p className="text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10">Ctrl+N</kbd> Note
                {" · "}
                <kbd className="px-1.5 py-0.5 rounded bg-white/10">Ctrl+D</kbd> Distraction
              </p>

              {/* Post-it notes indicator */}
              {postIts.length > 0 && (
                <div className="text-sm text-yellow-400">
                  <StickyNote className="inline h-4 w-4 mr-1" />
                  {postIts.length} post-it{postIts.length > 1 ? "s" : ""} on board
                  <span className="text-muted-foreground"> — drag to move, hover to delete</span>
                </div>
              )}

              {/* Distraction count */}
              {currentSession && currentSession.distractions.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  {currentSession.distractions.length} distraction{currentSession.distractions.length > 1 ? "s" : ""} captured
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================
              REFLECTION STATE
              ============================================ */}
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
                    What did you accomplish?
                  </label>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Describe what you moved forward..."
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

      {/* ============================================
          POST-IT INPUT MODAL
          ============================================ */}
      <AnimatePresence>
        {showNoteInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowNoteInput(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-yellow-400" />
                  Add Post-it
                </h2>
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Write your note. It will appear on screen — drag it where you want.
              </p>

              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Quick thought..."
                className="w-full bg-white/5 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddPostIt()
                  }
                }}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNoteInput(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPostIt}
                  disabled={!newNoteText.trim()}
                  className="flex-1 h-12 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Add Post-it
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================
          DISTRACTION DUMP MODAL
          ============================================ */}
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
