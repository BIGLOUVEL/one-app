"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  ChevronRight,
  Check,
  RefreshCw,
  Copy,
  Heart,
  Zap,
  Users,
  Hand,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconShield, IconTarget } from "@/components/ui/custom-icons"
import { useAppStore } from "@/store/useAppStore"
import type { ThiefType } from "@/lib/types"

interface Question {
  id: string
  text: string
  thief: ThiefType
}

interface ThiefInfo {
  type: ThiefType
  name: string
  icon: typeof Hand
  color: string
  bgColor: string
  description: string
  playbook: {
    title: string
    items: string[]
  }
}

const QUESTIONS: Question[] = [
  // Say No (2 questions)
  {
    id: "sn1",
    text: "I often take on tasks or commitments that don't serve my main goal because I don't want to disappoint others.",
    thief: "say-no",
  },
  {
    id: "sn2",
    text: "I feel guilty when I decline requests, even when I know I should.",
    thief: "say-no",
  },
  // Fear/Chaos (2 questions)
  {
    id: "fc1",
    text: "I avoid starting important tasks because I'm afraid of what success (or failure) might bring.",
    thief: "fear-chaos",
  },
  {
    id: "fc2",
    text: "My environment is usually cluttered or chaotic, making it hard to focus on what matters.",
    thief: "fear-chaos",
  },
  // Poor Health (2 questions)
  {
    id: "ph1",
    text: "I often sacrifice sleep, exercise, or healthy eating to get more work done.",
    thief: "poor-health",
  },
  {
    id: "ph2",
    text: "I feel physically drained most days, which affects my focus and productivity.",
    thief: "poor-health",
  },
  // Unsupportive Environment (2 questions)
  {
    id: "ue1",
    text: "The people around me (family, friends, colleagues) don't understand or support my goals.",
    thief: "unsupportive-environment",
  },
  {
    id: "ue2",
    text: "My physical workspace or daily routine makes it difficult to do focused work.",
    thief: "unsupportive-environment",
  },
]

const THIEVES: Record<ThiefType, ThiefInfo> = {
  "say-no": {
    type: "say-no",
    name: "Inability to Say No",
    icon: Hand,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    description:
      "You're spreading yourself thin by taking on commitments that don't serve your ONE thing. Every yes to something unimportant is a no to your goal.",
    playbook: {
      title: "Say No Scripts",
      items: [
        '"I appreciate you thinking of me, but I\'m fully committed to my current priority right now."',
        '"That sounds interesting, but it doesn\'t align with what I\'m focused on this month. Can we revisit later?"',
        '"I have to say no to this so I can say yes to what matters most. Thank you for understanding."',
      ],
    },
  },
  "fear-chaos": {
    type: "fear-chaos",
    name: "Fear of Chaos",
    icon: Zap,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
    description:
      "You're paralyzed by the fear of what might happen if you truly commit to your goal, or you're overwhelmed by disorder that prevents focused action.",
    playbook: {
      title: "Chaos Budget",
      items: [
        "Accept that pursuing ONE thing means other areas will be messy. This is okay.",
        "List 3 things you're choosing to let be imperfect this month.",
        "Set a \"minimum viable order\" standard - what's the least organization you need to function?",
      ],
    },
  },
  "poor-health": {
    type: "poor-health",
    name: "Poor Health Habits",
    icon: Heart,
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    description:
      "Your physical foundation is shaky. Without energy, sleep, and basic health, even the best plans fail. Your body is the vehicle for your goals.",
    playbook: {
      title: "One Minimum Standard",
      items: [
        "Pick ONE non-negotiable health habit. Examples: 7 hours sleep, 20 min walk, no screens after 9pm.",
        "Write it down: \"My minimum standard is ___________\"",
        "Protect this like a meeting with your most important client - because it is.",
      ],
    },
  },
  "unsupportive-environment": {
    type: "unsupportive-environment",
    name: "Unsupportive Environment",
    icon: Users,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
    description:
      "Your surroundings - physical or social - are working against your goals. Success requires an environment that supports what you're trying to achieve.",
    playbook: {
      title: "3-Step Environment Audit",
      items: [
        "Physical: Identify one change to make your workspace support deep focus.",
        "Social: Have one honest conversation with someone who needs to understand your commitment.",
        "Digital: Remove or hide one app/notification that consistently pulls you away from your ONE thing.",
      ],
    },
  },
}

export default function ShieldPage() {
  const router = useRouter()
  const { objective, thievesAssessment, setThievesAssessment } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    setIsLoading(false)
    if (thievesAssessment) {
      setShowResults(true)
    }
  }, [thievesAssessment])

  // Redirect if no objective
  useEffect(() => {
    if (!isLoading && !objective) {
      router.push("/app/define")
    }
  }, [objective, isLoading, router])

  // Calculate results
  const results = useMemo(() => {
    const scores: Record<ThiefType, number> = {
      "say-no": 0,
      "fear-chaos": 0,
      "poor-health": 0,
      "unsupportive-environment": 0,
    }

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = QUESTIONS.find((q) => q.id === questionId)
      if (question) {
        scores[question.thief] += score
      }
    })

    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [
      ThiefType,
      number
    ][]

    return {
      primary: sorted[0][0],
      secondary: sorted[1][1] > 3 ? sorted[1][0] : undefined,
      scores,
    }
  }, [answers])

  const handleAnswer = (score: number) => {
    const questionId = QUESTIONS[currentQuestion].id
    setAnswers((prev) => ({ ...prev, [questionId]: score }))

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // Quiz complete
      setThievesAssessment(
        { ...answers, [questionId]: score },
        results.primary,
        results.secondary
      )
      setShowResults(true)
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setCurrentQuestion(0)
    setQuizStarted(true)
    setShowResults(false)
  }

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-lg p-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/3 mx-auto" />
          <div className="h-48 bg-white/5 rounded-2xl" />
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

  const primaryThief = thievesAssessment
    ? THIEVES[thievesAssessment.primaryThief]
    : THIEVES[results.primary]
  const secondaryThief = thievesAssessment?.secondaryThief
    ? THIEVES[thievesAssessment.secondaryThief]
    : results.secondary
    ? THIEVES[results.secondary]
    : undefined

  // Show results if already completed
  if (showResults) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-3">
              <IconShield size="lg" className="drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
              <h1 className="text-2xl sm:text-3xl font-bold">Your Four Thieves</h1>
            </div>
            <p className="text-muted-foreground">
              Obstacles stealing your focus from the ONE thing
            </p>
          </motion.div>

          {/* Primary Thief */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`liquid-glass p-6 border-2 ${primaryThief.bgColor}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${primaryThief.bgColor}`}>
                <primaryThief.icon className={`h-6 w-6 ${primaryThief.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                    Primary Thief
                  </span>
                </div>
                <h2 className={`text-xl font-bold ${primaryThief.color}`}>
                  {primaryThief.name}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {primaryThief.description}
                </p>
              </div>
            </div>

            {/* Playbook */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-semibold mb-4">{primaryThief.playbook.title}</h3>
              <div className="space-y-3">
                {primaryThief.playbook.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 group"
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${primaryThief.bgColor} ${primaryThief.color} shrink-0`}>
                      {i + 1}
                    </div>
                    <p className="flex-1 text-sm">{item}</p>
                    {primaryThief.type === "say-no" && (
                      <button
                        onClick={() => handleCopy(item, i)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === i ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Secondary Thief */}
          {secondaryThief && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="liquid-glass p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${secondaryThief.bgColor}`}>
                  <secondaryThief.icon
                    className={`h-6 w-6 ${secondaryThief.color}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      Secondary Thief
                    </span>
                  </div>
                  <h2 className={`text-lg font-semibold ${secondaryThief.color}`}>
                    {secondaryThief.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {secondaryThief.description}
                  </p>
                </div>
              </div>

              {/* Collapsed playbook */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  View playbook
                </summary>
                <div className="mt-3 space-y-2">
                  {secondaryThief.playbook.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-4 h-4 rounded flex items-center justify-center text-xs bg-white/5 shrink-0">
                        {i + 1}
                      </div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </details>
            </motion.div>
          )}

          {/* Retake button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Button variant="outline" onClick={handleRetake}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Assessment
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Quiz intro
  if (!quizStarted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-8 relative z-10"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <IconShield size="xl" className="drop-shadow-[0_0_12px_rgba(0,255,136,0.4)]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">The Four Thieves</h1>
            <p className="text-muted-foreground">
              Discover what's stealing your focus from the ONE thing. This
              2-minute assessment will identify your primary obstacle.
            </p>
          </div>

          <div className="liquid-glass p-6">
            <h2 className="font-semibold mb-4">The Four Thieves of Productivity:</h2>
            <div className="space-y-3">
              {Object.values(THIEVES).map((thief) => (
                <div key={thief.type} className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${thief.bgColor}`}>
                    <thief.icon className={`h-4 w-4 ${thief.color}`} />
                  </div>
                  <span className="text-sm">{thief.name}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setQuizStarted(true)}
            className="w-full h-14 rounded-2xl text-base font-medium glow-green"
          >
            Start Assessment
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    )
  }

  // Quiz questions
  const question = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="liquid-glass p-6">
              <p className="text-lg leading-relaxed">{question.text}</p>
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {[
                { score: 1, label: "Strongly Disagree" },
                { score: 2, label: "Disagree" },
                { score: 3, label: "Neutral" },
                { score: 4, label: "Agree" },
                { score: 5, label: "Strongly Agree" },
              ].map((option) => (
                <button
                  key={option.score}
                  onClick={() => handleAnswer(option.score)}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-primary/30 transition-all text-left flex items-center justify-between group"
                >
                  <span>{option.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
