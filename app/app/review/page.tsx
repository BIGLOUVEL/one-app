"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar,
  Send,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

type ReviewStep = 1 | 2 | 3

const REVIEW_STEPS = [
  {
    step: 1 as ReviewStep,
    title: "What did you accomplish?",
    subtitle: "Celebrate your wins, big and small.",
    placeholder: "List your key accomplishments this week...",
  },
  {
    step: 2 as ReviewStep,
    title: "What blocked you?",
    subtitle: "Identify obstacles to address next week.",
    placeholder: "What got in the way of your progress?",
  },
  {
    step: 3 as ReviewStep,
    title: "What's the ONE thing next week?",
    subtitle: "Set your primary focus for the coming week.",
    placeholder: "The single most important thing to accomplish...",
  },
]

export default function ReviewPage() {
  const router = useRouter()
  const { objective, reviews, addWeeklyReview } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentStep, setCurrentStep] = useState<ReviewStep>(1)
  const [accomplishments, setAccomplishments] = useState("")
  const [blockers, setBlockers] = useState("")
  const [nextWeekOneThing, setNextWeekOneThing] = useState("")

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Redirect if no objective
  useEffect(() => {
    if (!isLoading && !objective) {
      router.push("/app/onboarding")
    }
  }, [objective, isLoading, router])

  const getCurrentValue = () => {
    switch (currentStep) {
      case 1:
        return accomplishments
      case 2:
        return blockers
      case 3:
        return nextWeekOneThing
    }
  }

  const setCurrentValue = (value: string) => {
    switch (currentStep) {
      case 1:
        setAccomplishments(value)
        break
      case 2:
        setBlockers(value)
        break
      case 3:
        setNextWeekOneThing(value)
        break
    }
  }

  const canProceed = getCurrentValue().trim().length >= 3

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as ReviewStep)
    } else {
      // Submit review
      addWeeklyReview(accomplishments, blockers, nextWeekOneThing)
      setShowModal(false)
      setCurrentStep(1)
      setAccomplishments("")
      setBlockers("")
      setNextWeekOneThing("")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as ReviewStep)
    }
  }

  const startReview = () => {
    setShowModal(true)
    setCurrentStep(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getWeekRange = (weekOf: string) => {
    const start = new Date(weekOf)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `${formatDate(weekOf)} - ${formatDate(end.toISOString())}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl p-6">
          <div className="h-8 bg-white/5 rounded-lg w-1/4" />
          <div className="h-32 bg-white/5 rounded-2xl" />
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

  // Sort reviews by date (newest first)
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const stepConfig = REVIEW_STEPS.find((s) => s.step === currentStep)!

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Weekly Review</h1>
          </div>
          <p className="text-muted-foreground">
            Reflect on your progress and plan the week ahead
          </p>
        </motion.div>

        {/* Start Review Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass-green p-6 text-center"
        >
          <h2 className="text-lg font-semibold mb-2">Ready for your weekly review?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Take a few minutes to reflect on the past week and set your focus for the next.
          </p>
          <Button onClick={startReview} className="glow-green h-12 px-8">
            <ClipboardCheck className="mr-2 h-5 w-5" />
            Run Weekly Review
          </Button>
        </motion.div>

        {/* Send to Buddy (Disabled stub) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="liquid-glass p-4 opacity-60"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Send className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="font-medium">Send to Accountability Buddy</p>
                <p className="text-xs text-muted-foreground">
                  Share your weekly summary with a partner
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
        </motion.div>

        {/* Review History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-lg">Past Reviews</h2>

          {sortedReviews.length === 0 ? (
            <div className="liquid-glass p-6 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">
                Complete your first weekly review to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="liquid-glass p-4 sm:p-6"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Week of {getWeekRange(review.weekOf)}</span>
                  </div>

                  <div className="space-y-4">
                    {/* Accomplishments */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Accomplishments
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{review.accomplishments}</p>
                    </div>

                    {/* Blockers */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Blockers
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{review.blockers}</p>
                    </div>

                    {/* Next Week ONE Thing */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        ONE Thing for Next Week
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {review.nextWeekOneThink}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Created {formatDate(review.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s === currentStep
                        ? "w-8 bg-primary"
                        : s < currentStep
                        ? "w-4 bg-primary/50"
                        : "w-4 bg-white/10"
                    }`}
                    animate={{ scale: s === currentStep ? 1.1 : 1 }}
                  />
                ))}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">{stepConfig.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {stepConfig.subtitle}
                    </p>
                  </div>

                  <textarea
                    value={getCurrentValue()}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder={stepConfig.placeholder}
                    rows={4}
                    className="w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40 resize-none"
                    autoFocus
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-12 px-4 rounded-xl"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`flex-1 h-12 rounded-xl text-base font-medium transition-all ${
                    canProceed
                      ? "glow-green"
                      : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {currentStep === 3 ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Complete Review
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Cancel */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
