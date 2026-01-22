"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  Sun,
  Clock,
  Mountain,
  Lock,
  AlertCircle,
  Wand2,
  Loader2,
  Quote,
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
  icon: typeof Target
  iconColor: string
  bgColor: string
  title: string
  subtitle: string
  placeholder: string
  helperText: string
}

const stepConfigs: Record<Step, StepConfig> = {
  1: {
    icon: Mountain,
    iconColor: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
    title: "What is your Someday goal?",
    subtitle: "The big picture. Where does all this lead?",
    placeholder: "e.g., Build a profitable business that gives me freedom",
    helperText: "Think 5-10 years out. One sentence.",
  },
  2: {
    icon: Target,
    iconColor: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
    title: "What matters most this month?",
    subtitle: "If you could only accomplish ONE thing this month...",
    placeholder: "e.g., Launch the MVP and get 10 paying users",
    helperText: "What would make this month a success?",
  },
  3: {
    icon: Calendar,
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
    title: "What's the ONE thing this week?",
    subtitle: "If you only win at one thing this week, it's...",
    placeholder: "e.g., Finish the landing page and payment integration",
    helperText: "Be specific. One outcome.",
  },
  4: {
    icon: Sun,
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    title: "What's the ONE thing today?",
    subtitle: "The single most important thing to do today.",
    placeholder: "e.g., Complete the Stripe integration",
    helperText: "This becomes your locked objective.",
  },
  5: {
    icon: Clock,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    title: "What's the RIGHT NOW action?",
    subtitle: "The very next thing you'll do in your focus block.",
    placeholder: "e.g., Read Stripe docs and set up test environment",
    helperText: "Concrete, actionable, no thinking required.",
  },
  6: {
    icon: Calendar,
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    title: "You start today",
    subtitle: "No delays. No excuses. This begins now.",
    placeholder: "",
    helperText: "Your deadline is set. The journey starts today.",
  },
  7: {
    icon: Sparkles,
    iconColor: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
    title: "Why does this matter?",
    subtitle: "One sentence to remind you when motivation fades.",
    placeholder: "e.g., To prove I can ship something real",
    helperText: "This will fuel you on hard days.",
  },
}

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

  // Stoic quotes generator
  const stoicQuotes = [
    { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
    { text: "We suffer more in imagination than in reality.", author: "Seneca" },
    { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
    { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
    { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
    { text: "If it is not right, do not do it. If it is not true, do not say it.", author: "Marcus Aurelius" },
    { text: "He who fears death will never do anything worth of a man who is alive.", author: "Seneca" },
    { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
    { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
    { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
    { text: "How long are you going to wait before you demand the best for yourself?", author: "Epictetus" },
    { text: "The only way to happiness is to cease worrying about things which are beyond the power of our will.", author: "Epictetus" },
    { text: "Life is very short and anxious for those who forget the past, neglect the present, and fear the future.", author: "Seneca" },
    { text: "You become what you give your attention to.", author: "Epictetus" },
    { text: "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.", author: "Marcus Aurelius" },
    { text: "No person has the power to have everything they want, but it is in their power not to want what they don't have.", author: "Seneca" },
    { text: "If you want to improve, be content to be thought foolish and stupid.", author: "Epictetus" },
    { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  ]

  const generateStoicQuote = () => {
    const randomQuote = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)]
    return randomQuote
  }

  // AI Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // If already locked, show message
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
    // Check for multiple tasks (contains "and", ",", or line breaks)
    if (step !== 6) {
      const hasMultipleIndicators = /\band\b|,|\n/.test(value) && value.length > 20
      setHasMultiple(hasMultipleIndicators)
    }
  }

  // Fetch AI suggestions
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

  // Can show AI suggestions for steps 2-5 and 7 (not 1 or 6)
  const canShowAISuggestions = step !== 1 && step !== 6 && somedayGoal.length > 0

  const canProceed = () => {
    const value = getCurrentValue()
    if (step === 6) {
      // Step 6 is automatic - they start today, so deadline is set automatically
      return true
    }
    return value.trim().length >= 3
  }

  const handleNext = () => {
    if (step === 6) {
      // Set deadline to today automatically
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      setDeadline(today.toISOString().split("T")[0])
    }
    
    if (step < 7) {
      setStep((step + 1) as Step)
      setHasMultiple(false)
      setShowSuggestions(false)
      setSuggestions([])
    } else {
      // Create the objective
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

  // If locked, show locked state
  if (locked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Objective Locked</h1>
            <p className="text-muted-foreground">
              You already have an active objective. Finish or fail it first.
            </p>
          </div>
          <div className="liquid-glass p-4">
            <p className="text-sm text-muted-foreground mb-1">Current Objective</p>
            <p className="font-medium">{objective?.title}</p>
          </div>
          <Button onClick={() => router.push("/app")} className="glow-green">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative">
        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5 mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <motion.div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-primary"
                  : s < step
                  ? "w-4 bg-primary/50"
                  : "w-4 bg-white/10"
              }`}
              animate={{ scale: s === step ? 1.1 : 1 }}
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
            className="space-y-6"
          >
            {/* Icon and title */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                {step === 1 ? (
                  <img
                    src="/trophy-icon.png"
                    alt="Trophy"
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div className={`p-3 rounded-2xl border ${config.bgColor}`}>
                    <config.icon className={`h-6 w-6 ${config.iconColor}`} />
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-semibold">
                {config.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {config.subtitle}
              </p>
            </div>

            {/* Input */}
            <div className="space-y-3">
              {step === 6 ? (
                <div className="liquid-glass p-6 text-center">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Today is the day</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString("fr-FR", { 
                        weekday: "long", 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="liquid-glass p-1">
                  <input
                    type="text"
                    value={getCurrentValue()}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={config.placeholder}
                    className="w-full bg-transparent px-4 py-4 text-lg focus:outline-none placeholder:text-muted-foreground/40"
                    autoFocus
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                {config.helperText}
              </p>

              {/* Multiple task warning */}
              {hasMultiple && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
                >
                  <AlertCircle className="h-4 w-4 text-orange-400 shrink-0" />
                  <p className="text-sm text-orange-300">
                    Looks like multiple things. Can you narrow it down to ONE?
                  </p>
                </motion.div>
              )}

              {/* Stoic Quote Generator for step 7 */}
              {step === 7 && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const quote = generateStoicQuote()
                      setWhy(quote.text)
                    }}
                    className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 text-sm text-amber-300 hover:text-amber-200"
                  >
                    <Quote className="h-4 w-4" />
                    <span>Générer une citation stoïcienne</span>
                  </button>
                </div>
              )}

              {/* AI Suggestions Button & Panel */}
              {canShowAISuggestions && (
                <div className="space-y-3">
                  {!showSuggestions ? (
                    <button
                      onClick={fetchSuggestions}
                      className="w-full p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-primary/10 border border-violet-500/20 hover:border-violet-500/40 transition-all flex items-center justify-center gap-2 text-sm text-violet-300 hover:text-violet-200"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>Pas d'idée ? L'IA te suggère</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-primary/5 border border-violet-500/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wand2 className="h-4 w-4 text-violet-400" />
                          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                            Suggestions IA
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowSuggestions(false)
                            setSuggestions([])
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Fermer
                        </button>
                      </div>

                      {isLoadingSuggestions ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">Génération en cours...</span>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="space-y-2">
                          {suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => selectSuggestion(suggestion)}
                              className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all text-left text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                          <button
                            onClick={fetchSuggestions}
                            className="w-full p-2 text-xs text-muted-foreground hover:text-violet-400 transition-colors"
                          >
                            Générer d'autres suggestions
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucune suggestion générée
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-4"
        >
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="h-14 px-6 rounded-2xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 h-14 rounded-2xl text-base font-medium transition-all duration-300 ${
                canProceed()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                  : "bg-white/5 text-muted-foreground"
              }`}
            >
              {step === 7 ? (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Lock It In
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
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

        {/* Cascade preview (shows after step 1) */}
        {step > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Your Cascade</p>
            <div className="space-y-2">
              {somedayGoal && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Someday</p>
                    <p className="text-sm truncate">{somedayGoal}</p>
                  </div>
                </div>
              )}
              {monthGoal && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">This Month</p>
                    <p className="text-sm truncate">{monthGoal}</p>
                  </div>
                </div>
              )}
              {weekGoal && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">This Week</p>
                    <p className="text-sm truncate">{weekGoal}</p>
                  </div>
                </div>
              )}
              {todayGoal && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Today</p>
                    <p className="text-sm truncate">{todayGoal}</p>
                  </div>
                </div>
              )}
              {rightNowAction && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Right Now</p>
                    <p className="text-sm truncate">{rightNowAction}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
