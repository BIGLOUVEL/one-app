"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7
type StepType = "month" | "week" | "today" | "rightNow" | "why"

const stepToType: Partial<Record<Step, StepType>> = {
  2: "month",
  3: "week",
  4: "today",
  5: "rightNow",
  7: "why",
}

interface StepConfig {
  number: string
  title: string
  subtitle: string
  placeholder: string
  helperText: string
}

const stepConfigs: Record<Step, StepConfig> = {
  1: {
    number: "01",
    title: "What is your Someday goal?",
    subtitle: "The big picture. Where does all this lead?",
    placeholder: "e.g., Build a profitable business that gives me freedom",
    helperText: "Think 5-10 years out. One sentence.",
  },
  2: {
    number: "02",
    title: "What matters most this month?",
    subtitle: "If you could only accomplish ONE thing this month...",
    placeholder: "e.g., Launch the MVP and get 10 paying users",
    helperText: "What would make this month a success?",
  },
  3: {
    number: "03",
    title: "What's the ONE thing this week?",
    subtitle: "If you only win at one thing this week, it's...",
    placeholder: "e.g., Finish the landing page and payment integration",
    helperText: "Be specific. One outcome.",
  },
  4: {
    number: "04",
    title: "What's the ONE thing today?",
    subtitle: "The single most important thing to do today.",
    placeholder: "e.g., Complete the Stripe integration",
    helperText: "This becomes your locked objective.",
  },
  5: {
    number: "05",
    title: "What's the RIGHT NOW action?",
    subtitle: "The very next thing you'll do in your focus block.",
    placeholder: "e.g., Read Stripe docs and set up test environment",
    helperText: "Concrete, actionable, no thinking required.",
  },
  6: {
    number: "06",
    title: "You start today",
    subtitle: "No delays. No excuses. This begins now.",
    placeholder: "",
    helperText: "Your deadline is set. The journey starts today.",
  },
  7: {
    number: "07",
    title: "Why does this matter?",
    subtitle: "One sentence to remind you when motivation fades.",
    placeholder: "e.g., To prove I can ship something real",
    helperText: "This will fuel you on hard days.",
  },
}

const stoicQuotes = [
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "How long are you going to wait before you demand the best for yourself?", author: "Epictetus" },
  { text: "You become what you give your attention to.", author: "Epictetus" },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
]

export default function DefinePage() {
  const router = useRouter()
  const { objective, isLocked, setObjective } = useAppStore()

  const [step, setStep] = useState<Step>(1)
  const [somedayGoal, setSomedayGoal] = useState("")
  const [monthGoal, setMonthGoal] = useState("")
  const [weekGoal, setWeekGoal] = useState("")
  const [todayGoal, setTodayGoal] = useState("")
  const [rightNowAction, setRightNowAction] = useState("")
  const [deadline, setDeadline] = useState("")
  const [why, setWhy] = useState("")
  const [hasMultiple, setHasMultiple] = useState(false)

  // AI Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const locked = isLocked()

  useEffect(() => {
    if (locked) {
      // Already have an active objective
    }
  }, [locked])

  const getCurrentValue = () => {
    switch (step) {
      case 1: return somedayGoal
      case 2: return monthGoal
      case 3: return weekGoal
      case 4: return todayGoal
      case 5: return rightNowAction
      case 6: return deadline
      case 7: return why
      default: return ""
    }
  }

  const setCurrentValue = (value: string) => {
    switch (step) {
      case 1: setSomedayGoal(value); break
      case 2: setMonthGoal(value); break
      case 3: setWeekGoal(value); break
      case 4: setTodayGoal(value); break
      case 5: setRightNowAction(value); break
      case 6: setDeadline(value); break
      case 7: setWhy(value); break
    }
  }

  const handleInputChange = (value: string) => {
    setCurrentValue(value)
    if (step !== 6) {
      const hasMultipleIndicators = /\band\b|,|\n/.test(value) && value.length > 20
      setHasMultiple(hasMultipleIndicators)
    }
  }

  const fetchSuggestions = async () => {
    const stepType = stepToType[step]
    if (!stepType || !somedayGoal) return

    setIsLoadingSuggestions(true)
    setShowSuggestions(true)
    setSuggestions([])

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          somedayGoal,
          stepType,
          monthGoal: monthGoal || undefined,
          weekGoal: weekGoal || undefined,
          todayGoal: todayGoal || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setCurrentValue(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const generateStoicQuote = () => {
    const randomQuote = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)]
    setWhy(randomQuote.text)
  }

  const canShowAISuggestions = step !== 1 && step !== 6 && somedayGoal.length > 0

  const canProceed = () => {
    const value = getCurrentValue()
    if (step === 6) return true
    return value.trim().length >= 3
  }

  const handleNext = () => {
    if (step === 6) {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      setDeadline(today.toISOString().split("T")[0])
    }

    if (step < 7) {
      setStep((step + 1) as Step)
      setHasMultiple(false)
      setShowSuggestions(false)
      setSuggestions([])
    } else {
      const deadlineDate = deadline || new Date().toISOString().split("T")[0]
      setObjective({
        somedayGoal,
        monthGoal,
        weekGoal,
        todayGoal,
        rightNowAction,
        deadline: new Date(deadlineDate).toISOString(),
        why,
      })
      router.push("/app")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
      setHasMultiple(false)
    }
  }

  const config = stepConfigs[step]

  // Locked state
  if (locked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
            <Lock className="h-7 w-7 text-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold mb-3">Objective Locked</h1>
            <p className="text-muted-foreground">
              You already have an active objective. Finish or fail it first.
            </p>
          </div>
          <div className="card-editorial p-5 text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Objective</p>
            <p className="font-medium">{objective?.title}</p>
          </div>
          <Button onClick={() => router.push("/app")} className="w-full h-12">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg relative">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-foreground"
                  : s < step
                  ? "w-4 bg-foreground/30"
                  : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground font-medium tracking-wider">
                STEP {config.number}
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
                {config.title}
              </h1>
              <p className="text-muted-foreground">
                {config.subtitle}
              </p>
            </div>

            {/* Input */}
            <div className="space-y-4">
              {step === 6 ? (
                <div className="card-editorial p-8 text-center">
                  <p className="font-display text-xl font-semibold mb-2">Today is the day</p>
                  <p className="text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={getCurrentValue()}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={config.placeholder}
                    className="w-full bg-card border border-border rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background placeholder:text-muted-foreground/50 transition-shadow"
                    autoFocus
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {config.helperText}
              </p>

              {/* Multiple task warning */}
              {hasMultiple && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <AlertCircle className="h-5 w-5 text-accent shrink-0" />
                  <p className="text-sm text-accent">
                    Looks like multiple things. Can you narrow it down to ONE?
                  </p>
                </motion.div>
              )}

              {/* Stoic Quote Generator for step 7 */}
              {step === 7 && (
                <button
                  onClick={generateStoicQuote}
                  className="w-full p-4 rounded-lg border border-border hover:border-foreground/20 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate a Stoic quote</span>
                </button>
              )}

              {/* AI Suggestions */}
              {canShowAISuggestions && (
                <div className="space-y-3">
                  {!showSuggestions ? (
                    <button
                      onClick={fetchSuggestions}
                      className="w-full p-4 rounded-lg border border-border hover:border-foreground/20 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Need ideas? Get AI suggestions</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-editorial p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          AI Suggestions
                        </span>
                        <button
                          onClick={() => {
                            setShowSuggestions(false)
                            setSuggestions([])
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Close
                        </button>
                      </div>

                      {isLoadingSuggestions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Generating...</span>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="space-y-2">
                          {suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => selectSuggestion(suggestion)}
                              className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                          <button
                            onClick={fetchSuggestions}
                            className="w-full p-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Generate more suggestions
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No suggestions generated
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 space-y-4"
        >
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="h-12 px-5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-12 text-base font-medium"
            >
              {step === 7 ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock It In
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {step === 7 && (
            <p className="text-center text-xs text-muted-foreground">
              Once locked, you cannot change or escape until completion.
            </p>
          )}
        </motion.div>

        {/* Cascade preview */}
        {step > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 card-editorial p-5"
          >
            <p className="section-header mb-4">Your Cascade</p>
            <div className="space-y-3">
              {[
                { label: "Someday", value: somedayGoal },
                { label: "This Month", value: monthGoal },
                { label: "This Week", value: weekGoal },
                { label: "Today", value: todayGoal },
                { label: "Right Now", value: rightNowAction },
              ].filter(item => item.value).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    idx === 0 ? "bg-foreground" : "bg-foreground/30"
                  }`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
