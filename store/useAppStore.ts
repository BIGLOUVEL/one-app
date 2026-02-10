import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useState, useEffect } from "react"
import {
  Objective,
  FourOneOne,
  GPSPlan,
  FocusBlock,
  FocusSession,
  HabitChallenge,
  HabitDay,
  WeeklyReview,
  ThievesAssessment,
  ThiefType,
  Distraction,
  AIGeneratedPlan,
  AIRoadmap,
  Milestone,
  DominoChain,
  ContractMeter,
  ContractState,
  PostItCollection,
  PostIt,
  TimetableAnalysis,
} from "@/lib/types"

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

export type Language = 'en' | 'fr'

interface AppStore {
  // Language preference
  language: Language
  setLanguage: (lang: Language) => void

  // User profile
  firstName: string
  setFirstName: (name: string) => void
  aiName: string
  setAIName: (name: string) => void

  // User tracking (to clear data on user change)
  userId: string | null

  // Core State
  objective: Objective | null
  hasCompletedOnboarding: boolean
  fourOneOne: FourOneOne | null
  gpsPlan: GPSPlan | null
  focusBlock: FocusBlock | null
  habitChallenge: HabitChallenge | null
  sessions: FocusSession[]
  currentSession: FocusSession | null
  reviews: WeeklyReview[]
  thievesAssessment: ThievesAssessment | null
  aiPlan: AIGeneratedPlan | null
  aiRoadmap: AIRoadmap | null
  isGeneratingRoadmap: boolean

  // Core Mechanic: Domino + Contract
  dominoChain: DominoChain | null
  contractMeter: ContractMeter | null
  plannedSessionsPerDay: number

  // Domino Effect
  lastDailyCheckDate: string | null
  needsRecenter: boolean

  // Task completion
  rightNowCompleted: boolean
  todayGoalCompleted: boolean

  // Session post-its (persist across page refreshes during session)
  sessionPostIts: Array<{ id: string; text: string; x: number; y: number; rotation: number }>

  // Timetable Analyzer
  timetableAnalysis: TimetableAnalysis | null
  isAnalyzingTimetable: boolean
  setTimetableAnalysis: (analysis: TimetableAnalysis) => void
  clearTimetableAnalysis: () => void
  setIsAnalyzingTimetable: (value: boolean) => void

  // AI Insights cache (rate limited: 1 per 48h)
  aiInsightsCache: {
    data: Record<string, unknown> | null
    lastFetched: string | null
  }

  // Post-it Collections
  postItCollections: PostItCollection[]

  // Visual Preferences (toggleable effects)
  visualPrefs: {
    breathingGradient: boolean      // Dashboard hero breathing effect
    circularProgress: boolean       // Circular progress around lock icon
    immersiveFocus: boolean         // Dark immersive focus mode
    confettiOnComplete: boolean     // Confetti when session ends
    tiltPostIts: boolean            // 3D tilt effect on post-its
    bouncingHeart: boolean          // Bouncing animation on like
    bounceIcons: boolean            // Sidebar icons bounce on hover
    milestoneAnimations: boolean    // Celebrate 25%, 50%, 75%
    streakFire: boolean             // Fire animation for 7+ day streak
  }
  setVisualPref: (key: keyof AppStore['visualPrefs'], value: boolean) => void
  resetVisualPrefs: () => void

  // Post-it Actions
  setSessionPostIts: (postIts: Array<{ id: string; text: string; x: number; y: number; rotation: number }>) => void
  clearSessionPostIts: () => void
  togglePostItLike: (sessionId: string, postItId: string) => void

  // Collection Actions
  createCollection: (name: string, emoji?: string, description?: string) => string
  deleteCollection: (collectionId: string) => void
  renameCollection: (collectionId: string, name: string) => void
  addPostItToCollection: (collectionId: string, postItId: string) => void
  removePostItFromCollection: (collectionId: string, postItId: string) => void
  getAllPostIts: () => PostIt[]

  // AI Insights Actions
  setAIInsightsCache: (data: Record<string, unknown>) => void
  canFetchAIInsights: () => boolean
  getAIInsightsCooldown: () => { canFetch: boolean; hoursRemaining: number }

  // AI Actions
  setAIPlan: (plan: AIGeneratedPlan) => void
  setObjectiveFromAI: (plan: AIGeneratedPlan, deadline: string) => void
  clearAIPlan: () => void

  // AI Roadmap Actions
  setAIRoadmap: (roadmap: AIRoadmap) => void
  setIsGeneratingRoadmap: (value: boolean) => void
  updateMilestoneStatus: (milestoneId: string, status: Milestone["status"]) => void
  completeMilestone: (milestoneId: string) => void
  completeCheckpoint: (milestoneId: string, checkpointId: string) => void
  clearAIRoadmap: () => void

  // Objective Actions
  setObjective: (data: {
    somedayGoal: string
    monthGoal: string
    weekGoal: string
    todayGoal: string
    rightNowAction: string
    deadline: string
    why: string
  }) => void
  completeObjective: () => void
  failObjective: () => void
  updateProgress: (progress: number) => void
  resetObjective: () => void
  updateCascade: (field: keyof Pick<Objective, 'somedayGoal' | 'monthGoal' | 'weekGoal' | 'todayGoal' | 'rightNowAction'>, value: string) => void

  // 4-1-1 Actions
  setFourOneOne: (data: Omit<FourOneOne, 'id' | 'objectiveId'>) => void
  updateWeeklyOutcome: (weekNumber: number, outcomes: string[], reflection?: string, completed?: boolean) => void

  // GPS Actions
  setGPSPlan: (goal: string, priorities: { name: string; strategies: string[] }[]) => void
  setActivePriority: (priorityId: string) => void

  // Focus Block Actions
  setFocusBlock: (days: string[], startTime: string, duration: number) => void

  // Focus Session Actions
  startSession: (duration?: number) => void
  endSession: (reflection?: string, nextAction?: string) => void
  addDistraction: (text: string) => void
  markDistractionHandled: (distractionId: string) => void

  // Habit Challenge Actions
  initHabitChallenge: (minimumMinutes: number) => void
  markDayComplete: (date: string, sessionMinutes: number) => void

  // Thieves Assessment Actions
  setThievesAssessment: (answers: Record<string, number>, primaryThief: ThiefType, secondaryThief?: ThiefType) => void

  // Weekly Review Actions
  addWeeklyReview: (accomplishments: string, blockers: string, nextWeekOneThink: string) => void

  // Domino & Contract Actions
  initDominoContract: () => void
  advanceDomino: () => void
  updateContractState: () => ContractState
  setPlannedSessionsPerDay: (count: number) => void

  // Domino Effect Actions
  setLastDailyCheckDate: (date: string) => void
  needsDailyCheck: () => boolean
  setNeedsRecenter: (value: boolean) => void

  // Task Completion Actions
  completeRightNow: () => void
  completeTodayGoal: () => void
  setNewRightNowAction: (action: string) => void

  // User tracking
  setUserId: (id: string) => void
  clearAllData: () => void

  // Computed
  isLocked: () => boolean
  canCreateNew: () => boolean
  getTimeRemaining: () => { days: number; hours: number; minutes: number; seconds: number; isOverdue: boolean }
  getHabitProgress: () => { day: number; streak: number; percentage: number }
  getDominoProgress: () => { completed: number; total: number; percentage: number }
  getContractInfo: () => { state: ContractState; daysInactive: number; tensionLevel: number }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Language
      language: 'en' as Language,
      setLanguage: (lang: Language) => set({ language: lang }),

      // User profile
      firstName: '',
      setFirstName: (name: string) => set({ firstName: name }),
      aiName: 'Tony',
      setAIName: (name: string) => set({ aiName: name }),

      // User tracking
      userId: null,

      // Initial State
      objective: null,
      hasCompletedOnboarding: false,
      fourOneOne: null,
      gpsPlan: null,
      focusBlock: null,
      habitChallenge: null,
      sessions: [],
      currentSession: null,
      reviews: [],
      thievesAssessment: null,
      aiPlan: null,
      aiRoadmap: null,
      isGeneratingRoadmap: false,

      // Core Mechanic
      dominoChain: null,
      contractMeter: null,
      plannedSessionsPerDay: 1,

      // Domino Effect
      lastDailyCheckDate: null,
      needsRecenter: false,

      // Task completion
      rightNowCompleted: false,
      todayGoalCompleted: false,

      // Timetable Analyzer
      timetableAnalysis: null,
      isAnalyzingTimetable: false,

      // Session post-its
      sessionPostIts: [],

      // AI Insights cache
      aiInsightsCache: {
        data: null,
        lastFetched: null,
      },

      // Post-it Collections
      postItCollections: [],

      // Visual Preferences (all enabled by default)
      visualPrefs: {
        breathingGradient: true,
        circularProgress: true,
        immersiveFocus: true,
        confettiOnComplete: true,
        tiltPostIts: true,
        bouncingHeart: true,
        bounceIcons: true,
        milestoneAnimations: true,
        streakFire: true,
      },

      setVisualPref: (key, value) => {
        const { visualPrefs } = get()
        set({ visualPrefs: { ...visualPrefs, [key]: value } })
      },

      resetVisualPrefs: () => {
        set({
          visualPrefs: {
            breathingGradient: true,
            circularProgress: true,
            immersiveFocus: true,
            confettiOnComplete: true,
            tiltPostIts: true,
            bouncingHeart: true,
            bounceIcons: true,
            milestoneAnimations: true,
            streakFire: true,
          },
        })
      },

      // Post-it Actions
      setSessionPostIts: (postIts) => {
        set({ sessionPostIts: postIts })
      },

      clearSessionPostIts: () => {
        set({ sessionPostIts: [] })
      },

      togglePostItLike: (sessionId, postItId) => {
        const { sessions } = get()
        set({
          sessions: sessions.map(session => {
            if (session.id !== sessionId) return session
            return {
              ...session,
              postIts: session.postIts?.map(postIt =>
                postIt.id === postItId
                  ? { ...postIt, liked: !postIt.liked }
                  : postIt
              ),
            }
          }),
        })
      },

      createCollection: (name, emoji, description) => {
        const id = generateId()
        const { postItCollections } = get()
        const newCollection: PostItCollection = {
          id,
          name,
          emoji,
          description,
          postItIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set({ postItCollections: [...postItCollections, newCollection] })
        return id
      },

      deleteCollection: (collectionId) => {
        const { postItCollections } = get()
        set({ postItCollections: postItCollections.filter(c => c.id !== collectionId) })
      },

      renameCollection: (collectionId, name) => {
        const { postItCollections } = get()
        set({
          postItCollections: postItCollections.map(c =>
            c.id === collectionId
              ? { ...c, name, updatedAt: new Date().toISOString() }
              : c
          ),
        })
      },

      addPostItToCollection: (collectionId, postItId) => {
        const { postItCollections } = get()
        set({
          postItCollections: postItCollections.map(c =>
            c.id === collectionId && !c.postItIds.includes(postItId)
              ? { ...c, postItIds: [...c.postItIds, postItId], updatedAt: new Date().toISOString() }
              : c
          ),
        })
      },

      removePostItFromCollection: (collectionId, postItId) => {
        const { postItCollections } = get()
        set({
          postItCollections: postItCollections.map(c =>
            c.id === collectionId
              ? { ...c, postItIds: c.postItIds.filter(id => id !== postItId), updatedAt: new Date().toISOString() }
              : c
          ),
        })
      },

      getAllPostIts: () => {
        const { sessions } = get()
        return sessions.flatMap(session =>
          (session.postIts || []).map(postIt => ({
            ...postIt,
            sessionId: session.id,
            createdAt: session.endedAt || session.startedAt,
          }))
        )
      },

      // AI Insights Actions
      setAIInsightsCache: (data) => {
        set({
          aiInsightsCache: {
            data,
            lastFetched: new Date().toISOString(),
          },
        })
      },

      canFetchAIInsights: () => {
        const { aiInsightsCache } = get()
        if (!aiInsightsCache.lastFetched) return true
        const lastFetched = new Date(aiInsightsCache.lastFetched)
        const now = new Date()
        const hoursSince = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60)
        return hoursSince >= 48
      },

      getAIInsightsCooldown: () => {
        const { aiInsightsCache } = get()
        if (!aiInsightsCache.lastFetched) return { canFetch: true, hoursRemaining: 0 }
        const lastFetched = new Date(aiInsightsCache.lastFetched)
        const now = new Date()
        const hoursSince = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60)
        const hoursRemaining = Math.max(0, Math.ceil(48 - hoursSince))
        return { canFetch: hoursSince >= 48, hoursRemaining }
      },

      // Timetable Analyzer Actions
      setTimetableAnalysis: (analysis) => {
        const { objective } = get()
        if (objective) {
          analysis.objectiveId = objective.id
        }
        set({ timetableAnalysis: analysis, isAnalyzingTimetable: false })
      },

      clearTimetableAnalysis: () => {
        set({ timetableAnalysis: null, isAnalyzingTimetable: false })
      },

      setIsAnalyzingTimetable: (value) => {
        set({ isAnalyzingTimetable: value })
      },

      // User tracking actions
      setUserId: (id) => {
        set({ userId: id })
      },

      clearAllData: () => {
        set({
          objective: null,
          hasCompletedOnboarding: false,
          fourOneOne: null,
          gpsPlan: null,
          focusBlock: null,
          habitChallenge: null,
          sessions: [],
          currentSession: null,
          reviews: [],
          thievesAssessment: null,
          aiPlan: null,
          aiRoadmap: null,
          isGeneratingRoadmap: false,
          dominoChain: null,
          contractMeter: null,
          plannedSessionsPerDay: 1,
          sessionPostIts: [],
          aiInsightsCache: { data: null, lastFetched: null },
          postItCollections: [],
          lastDailyCheckDate: null,
          needsRecenter: false,
          rightNowCompleted: false,
          todayGoalCompleted: false,
          timetableAnalysis: null,
          isAnalyzingTimetable: false,
          // Note: visualPrefs are NOT cleared - they're user preferences
        })
      },

      // AI Actions
      setAIPlan: (plan) => {
        set({ aiPlan: plan })
      },

      setObjectiveFromAI: (plan, deadline) => {
        const { plannedSessionsPerDay } = get()
        const newObjective: Objective = {
          id: generateId(),
          somedayGoal: plan.cascade.somedayGoal,
          yearGoal: plan.cascade.yearGoal,
          monthGoal: plan.cascade.monthGoal,
          weekGoal: plan.cascade.weekGoal,
          todayGoal: plan.cascade.todayGoal,
          rightNowAction: plan.cascade.rightNowAction,
          title: plan.cascade.todayGoal,
          deadline: new Date(deadline).toISOString(),
          why: plan.why,
          status: "active",
          createdAt: new Date().toISOString(),
          progress: 0,
        }

        // Also set the thieves assessment based on AI analysis
        const thievesAssessment: ThievesAssessment = {
          id: generateId(),
          completedAt: new Date().toISOString(),
          answers: {},
          primaryThief: plan.risks.primaryThief,
        }

        // Initialize Domino Chain & Contract
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const daysUntilDeadline = Math.max(1, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        const totalDominos = daysUntilDeadline * plannedSessionsPerDay

        const dominoChain: DominoChain = {
          totalDominos,
          completedDominos: 0,
          lastSessionDate: undefined,
        }

        const contractMeter: ContractMeter = {
          state: "stable",
          lastActivityDate: new Date().toISOString(),
          tensionLevel: 0,
          daysInactive: 0,
        }

        set({
          objective: newObjective,
          hasCompletedOnboarding: true,
          aiPlan: plan,
          thievesAssessment,
          dominoChain,
          contractMeter,
        })
      },

      clearAIPlan: () => {
        set({ aiPlan: null })
      },

      // AI Roadmap Actions
      setAIRoadmap: (roadmap) => {
        const { objective } = get()
        if (objective) {
          roadmap.objectiveId = objective.id
        }
        set({ aiRoadmap: roadmap, isGeneratingRoadmap: false })
      },

      setIsGeneratingRoadmap: (value) => {
        set({ isGeneratingRoadmap: value })
      },

      updateMilestoneStatus: (milestoneId, status) => {
        const { aiRoadmap } = get()
        if (!aiRoadmap) return

        const updatedMilestones = aiRoadmap.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status } : m
        )
        set({
          aiRoadmap: { ...aiRoadmap, milestones: updatedMilestones },
        })
      },

      completeMilestone: (milestoneId) => {
        const { aiRoadmap } = get()
        if (!aiRoadmap) return

        const updatedMilestones = aiRoadmap.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, status: "completed" as const, completedAt: new Date().toISOString() }
            : m
        )
        set({
          aiRoadmap: { ...aiRoadmap, milestones: updatedMilestones },
        })
      },

      completeCheckpoint: (milestoneId, checkpointId) => {
        const { aiRoadmap } = get()
        if (!aiRoadmap) return

        const updatedMilestones = aiRoadmap.milestones.map((m) => {
          if (m.id !== milestoneId) return m
          const updatedCheckpoints = m.checkpoints.map((c) =>
            c.id === checkpointId
              ? { ...c, isCompleted: true, completedAt: new Date().toISOString() }
              : c
          )
          return { ...m, checkpoints: updatedCheckpoints }
        })
        set({
          aiRoadmap: { ...aiRoadmap, milestones: updatedMilestones },
        })
      },

      clearAIRoadmap: () => {
        set({ aiRoadmap: null, isGeneratingRoadmap: false })
      },

      // Objective Actions
      setObjective: (data) => {
        const { plannedSessionsPerDay } = get()
        const newObjective: Objective = {
          id: generateId(),
          somedayGoal: data.somedayGoal,
          monthGoal: data.monthGoal,
          weekGoal: data.weekGoal,
          todayGoal: data.todayGoal,
          rightNowAction: data.rightNowAction,
          title: data.todayGoal,
          deadline: data.deadline,
          why: data.why,
          status: "active",
          createdAt: new Date().toISOString(),
          progress: 0,
        }

        // Initialize Domino Chain & Contract
        const now = new Date()
        const deadlineDate = new Date(data.deadline)
        const daysUntilDeadline = Math.max(1, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        const totalDominos = daysUntilDeadline * plannedSessionsPerDay

        const dominoChain: DominoChain = {
          totalDominos,
          completedDominos: 0,
          lastSessionDate: undefined,
        }

        const contractMeter: ContractMeter = {
          state: "stable",
          lastActivityDate: new Date().toISOString(),
          tensionLevel: 0,
          daysInactive: 0,
        }

        set({
          objective: newObjective,
          hasCompletedOnboarding: true,
          dominoChain,
          contractMeter,
        })
      },

      completeObjective: () => {
        const { objective, contractMeter } = get()
        if (!objective) return

        set({
          objective: {
            ...objective,
            status: "completed",
            completedAt: new Date().toISOString(),
            progress: 100,
          },
          contractMeter: contractMeter ? {
            ...contractMeter,
            state: "fulfilled",
          } : null,
        })
      },

      failObjective: () => {
        const { objective, contractMeter } = get()
        if (!objective) return

        set({
          objective: {
            ...objective,
            status: "failed",
          },
          contractMeter: contractMeter ? {
            ...contractMeter,
            state: "broken",
          } : null,
        })
      },

      updateProgress: (progress) => {
        const { objective } = get()
        if (!objective || objective.status !== "active") return

        set({
          objective: {
            ...objective,
            progress: Math.min(100, Math.max(0, progress)),
          },
        })
      },

      resetObjective: () => {
        const { objective } = get()
        if (objective?.status === "completed" || objective?.status === "failed") {
          set({
            objective: null,
            fourOneOne: null,
            gpsPlan: null,
            habitChallenge: null,
            currentSession: null,
            dominoChain: null,
            contractMeter: null,
          })
        }
      },

      updateCascade: (field, value) => {
        const { objective } = get()
        if (!objective) return

        set({
          objective: {
            ...objective,
            [field]: value,
            title: field === 'todayGoal' ? value : objective.title,
          },
        })
      },

      // 4-1-1 Actions
      setFourOneOne: (data) => {
        const { objective } = get()
        if (!objective) return

        const newFourOneOne: FourOneOne = {
          id: generateId(),
          objectiveId: objective.id,
          yearlyGoals: data.yearlyGoals,
          monthlyGoals: data.monthlyGoals,
          weeks: data.weeks,
        }
        set({ fourOneOne: newFourOneOne })
      },

      updateWeeklyOutcome: (weekNumber, outcomes, reflection, completed) => {
        const { fourOneOne } = get()
        if (!fourOneOne) return

        const updatedWeeks = fourOneOne.weeks.map((week) =>
          week.weekNumber === weekNumber
            ? {
                ...week,
                outcomes,
                reflection: reflection ?? week.reflection,
                completed: completed ?? week.completed,
              }
            : week
        )

        set({
          fourOneOne: {
            ...fourOneOne,
            weeks: updatedWeeks,
          },
        })
      },

      // GPS Actions
      setGPSPlan: (goal, priorities) => {
        const { objective } = get()
        if (!objective) return

        const newGPSPlan: GPSPlan = {
          id: generateId(),
          objectiveId: objective.id,
          goal,
          priorities: priorities.map((p, i) => ({
            id: generateId(),
            name: p.name,
            strategies: p.strategies,
            isActive: i === 0,
          })),
        }
        set({ gpsPlan: newGPSPlan })
      },

      setActivePriority: (priorityId) => {
        const { gpsPlan } = get()
        if (!gpsPlan) return

        set({
          gpsPlan: {
            ...gpsPlan,
            priorities: gpsPlan.priorities.map((p) => ({
              ...p,
              isActive: p.id === priorityId,
            })),
          },
        })
      },

      // Focus Block Actions
      setFocusBlock: (days, startTime, duration) => {
        const { objective } = get()
        if (!objective) return

        const newFocusBlock: FocusBlock = {
          id: generateId(),
          objectiveId: objective.id,
          days,
          startTime,
          duration,
        }
        set({ focusBlock: newFocusBlock })
      },

      // Focus Session Actions
      startSession: (duration?: number) => {
        const { objective, focusBlock } = get()
        if (!objective) return

        const newSession: FocusSession = {
          id: generateId(),
          objectiveId: objective.id,
          startedAt: new Date().toISOString(),
          duration: duration ?? focusBlock?.duration ?? 50,
          distractions: [],
        }
        set({ currentSession: newSession })
      },

      endSession: (reflection, nextAction) => {
        const { currentSession, sessions, habitChallenge, dominoChain, contractMeter, sessionPostIts, objective, plannedSessionsPerDay } = get()
        if (!currentSession) return

        const endedSession: FocusSession = {
          ...currentSession,
          endedAt: new Date().toISOString(),
          actualDuration: Math.floor(
            (new Date().getTime() - new Date(currentSession.startedAt).getTime()) / 60000
          ),
          postIts: sessionPostIts.length > 0 ? [...sessionPostIts] : undefined,
          reflection,
          nextAction,
        }

        // Advance Domino Chain & stabilize Contract
        const now = new Date().toISOString()
        let updatedDominoChain = dominoChain
        let updatedContractMeter = contractMeter

        if (dominoChain) {
          updatedDominoChain = {
            ...dominoChain,
            completedDominos: dominoChain.completedDominos + 1,
            lastSessionDate: now,
          }
        }

        if (contractMeter) {
          updatedContractMeter = {
            ...contractMeter,
            state: "stable",
            lastActivityDate: now,
            tensionLevel: Math.max(0, contractMeter.tensionLevel - 20),
            daysInactive: 0,
          }
        }

        // Calculate and update progress based on sessions completed
        let updatedObjective = objective
        if (objective && objective.status === "active") {
          const startDate = new Date(objective.createdAt)
          const endDate = new Date(objective.deadline)
          const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
          const totalExpectedSessions = totalDays * plannedSessionsPerDay

          // Count sessions for this objective (including the one just ended)
          const objectiveSessions = sessions.filter(s => s.objectiveId === objective.id).length + 1

          // Calculate progress as percentage of expected sessions completed
          const newProgress = Math.min(99, Math.round((objectiveSessions / totalExpectedSessions) * 100))

          updatedObjective = {
            ...objective,
            progress: newProgress,
          }
        }

        // Update habit challenge if active
        if (habitChallenge) {
          const today = new Date().toISOString().split('T')[0]
          const existingDayIndex = habitChallenge.days.findIndex((d) => d.date === today)

          let updatedDays = [...habitChallenge.days]
          if (existingDayIndex >= 0) {
            updatedDays[existingDayIndex] = {
              ...updatedDays[existingDayIndex],
              completed: true,
              sessionMinutes: (updatedDays[existingDayIndex].sessionMinutes || 0) + (endedSession.actualDuration || 0),
            }
          } else {
            updatedDays.push({
              date: today,
              completed: true,
              sessionMinutes: endedSession.actualDuration,
            })
          }

          // Calculate streak
          let streak = 0
          const sortedDays = updatedDays.filter(d => d.completed).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )

          for (let i = 0; i < sortedDays.length; i++) {
            const dayDate = new Date(sortedDays[i].date)
            const expectedDate = new Date()
            expectedDate.setDate(expectedDate.getDate() - i)

            if (dayDate.toDateString() === expectedDate.toDateString()) {
              streak++
            } else {
              break
            }
          }

          set({
            habitChallenge: {
              ...habitChallenge,
              days: updatedDays,
              currentStreak: streak,
              longestStreak: Math.max(habitChallenge.longestStreak, streak),
            },
          })
        }

        set({
          currentSession: null,
          sessions: [...sessions, endedSession],
          dominoChain: updatedDominoChain,
          contractMeter: updatedContractMeter,
          sessionPostIts: [], // Clear post-its after saving to session
          objective: updatedObjective,
          needsRecenter: true,
        })
      },

      addDistraction: (text) => {
        const { currentSession } = get()
        if (!currentSession) return

        const newDistraction: Distraction = {
          id: generateId(),
          text,
          timestamp: new Date().toISOString(),
          handled: false,
        }

        set({
          currentSession: {
            ...currentSession,
            distractions: [...currentSession.distractions, newDistraction],
          },
        })
      },

      markDistractionHandled: (distractionId) => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: {
            ...currentSession,
            distractions: currentSession.distractions.map((d) =>
              d.id === distractionId ? { ...d, handled: true } : d
            ),
          },
        })
      },

      // Habit Challenge Actions
      initHabitChallenge: (minimumMinutes) => {
        const { objective } = get()
        if (!objective) return

        const newChallenge: HabitChallenge = {
          id: generateId(),
          objectiveId: objective.id,
          startDate: new Date().toISOString(),
          minimumSessionMinutes: minimumMinutes,
          days: [],
          currentStreak: 0,
          longestStreak: 0,
        }
        set({ habitChallenge: newChallenge })
      },

      markDayComplete: (date, sessionMinutes) => {
        const { habitChallenge } = get()
        if (!habitChallenge) return

        const existingDayIndex = habitChallenge.days.findIndex((d) => d.date === date)
        let updatedDays = [...habitChallenge.days]

        if (existingDayIndex >= 0) {
          updatedDays[existingDayIndex] = {
            ...updatedDays[existingDayIndex],
            completed: true,
            sessionMinutes,
          }
        } else {
          updatedDays.push({ date, completed: true, sessionMinutes })
        }

        set({
          habitChallenge: {
            ...habitChallenge,
            days: updatedDays,
          },
        })
      },

      // Thieves Assessment Actions
      setThievesAssessment: (answers, primaryThief, secondaryThief) => {
        const newAssessment: ThievesAssessment = {
          id: generateId(),
          completedAt: new Date().toISOString(),
          answers,
          primaryThief,
          secondaryThief,
        }
        set({ thievesAssessment: newAssessment })
      },

      // Weekly Review Actions
      addWeeklyReview: (accomplishments, blockers, nextWeekOneThink) => {
        const { objective, reviews } = get()
        if (!objective) return

        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())

        const newReview: WeeklyReview = {
          id: generateId(),
          objectiveId: objective.id,
          weekOf: startOfWeek.toISOString(),
          accomplishments,
          blockers,
          nextWeekOneThink,
          createdAt: new Date().toISOString(),
        }
        set({ reviews: [...reviews, newReview] })
      },

      // Domino & Contract Actions
      initDominoContract: () => {
        const { objective, plannedSessionsPerDay } = get()
        if (!objective) return

        // Calculate total dominos based on days until deadline * sessions per day
        const now = new Date()
        const deadline = new Date(objective.deadline)
        const daysUntilDeadline = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        const totalDominos = daysUntilDeadline * plannedSessionsPerDay

        const dominoChain: DominoChain = {
          totalDominos,
          completedDominos: 0,
          lastSessionDate: undefined,
        }

        const contractMeter: ContractMeter = {
          state: "stable",
          lastActivityDate: new Date().toISOString(),
          tensionLevel: 0,
          daysInactive: 0,
        }

        set({ dominoChain, contractMeter })
      },

      advanceDomino: () => {
        const { dominoChain, contractMeter } = get()
        if (!dominoChain || !contractMeter) return

        const now = new Date().toISOString()

        set({
          dominoChain: {
            ...dominoChain,
            completedDominos: dominoChain.completedDominos + 1,
            lastSessionDate: now,
          },
          contractMeter: {
            ...contractMeter,
            state: "stable",
            lastActivityDate: now,
            tensionLevel: Math.max(0, contractMeter.tensionLevel - 20),
            daysInactive: 0,
          },
        })
      },

      updateContractState: () => {
        const { objective, contractMeter, dominoChain } = get()
        if (!objective || !contractMeter) return "stable"

        const now = new Date()
        const deadline = new Date(objective.deadline)
        const lastActivity = contractMeter.lastActivityDate ? new Date(contractMeter.lastActivityDate) : now

        // Calculate days inactive
        const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

        // Check if deadline passed
        if (now > deadline && objective.status === "active") {
          set({
            contractMeter: { ...contractMeter, state: "broken", daysInactive },
          })
          return "broken"
        }

        // Check if objective completed
        if (objective.status === "completed") {
          set({
            contractMeter: { ...contractMeter, state: "fulfilled", daysInactive: 0 },
          })
          return "fulfilled"
        }

        // Calculate tension based on inactivity and deadline proximity
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const progressRatio = dominoChain ? dominoChain.completedDominos / Math.max(1, dominoChain.totalDominos) : 0
        const timeRatio = daysUntilDeadline / Math.max(1, Math.ceil((deadline.getTime() - new Date(objective.createdAt).getTime()) / (1000 * 60 * 60 * 24)))

        // Tension increases with inactivity and when behind schedule
        let tensionLevel = 0
        tensionLevel += daysInactive * 15 // 15% per day inactive
        if (progressRatio < timeRatio - 0.1) {
          tensionLevel += 20 // Behind schedule
        }
        tensionLevel = Math.min(100, tensionLevel)

        const newState: ContractState = tensionLevel > 40 ? "tension" : "stable"

        set({
          contractMeter: {
            ...contractMeter,
            state: newState,
            tensionLevel,
            daysInactive,
          },
        })

        return newState
      },

      setPlannedSessionsPerDay: (count) => {
        set({ plannedSessionsPerDay: Math.max(1, Math.min(5, count)) })
        // Recalculate dominos if objective exists
        const { objective, plannedSessionsPerDay } = get()
        if (objective) {
          const now = new Date()
          const deadline = new Date(objective.deadline)
          const daysUntilDeadline = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          const { dominoChain } = get()
          if (dominoChain) {
            set({
              dominoChain: {
                ...dominoChain,
                totalDominos: daysUntilDeadline * count,
              },
            })
          }
        }
      },

      // Domino Effect Actions
      setLastDailyCheckDate: (date) => {
        set({ lastDailyCheckDate: date, rightNowCompleted: false, todayGoalCompleted: false })
      },

      needsDailyCheck: () => {
        const { lastDailyCheckDate, objective } = get()
        if (!objective || objective.status !== "active") return false
        const today = new Date().toLocaleDateString("en-CA") // YYYY-MM-DD local
        return lastDailyCheckDate !== today
      },

      setNeedsRecenter: (value) => {
        set({ needsRecenter: value })
      },

      // Task Completion Actions
      completeRightNow: () => {
        set({ rightNowCompleted: true })
      },

      completeTodayGoal: () => {
        const { dominoChain, contractMeter } = get()
        const now = new Date().toISOString()

        let updatedDominoChain = dominoChain
        let updatedContractMeter = contractMeter

        if (dominoChain) {
          updatedDominoChain = {
            ...dominoChain,
            completedDominos: dominoChain.completedDominos + 1,
            lastSessionDate: now,
          }
        }

        if (contractMeter) {
          updatedContractMeter = {
            ...contractMeter,
            state: "stable",
            lastActivityDate: now,
            tensionLevel: Math.max(0, contractMeter.tensionLevel - 20),
            daysInactive: 0,
          }
        }

        set({
          todayGoalCompleted: true,
          dominoChain: updatedDominoChain,
          contractMeter: updatedContractMeter,
        })
      },

      setNewRightNowAction: (action) => {
        const { objective } = get()
        if (!objective) return

        set({
          objective: {
            ...objective,
            rightNowAction: action,
            title: objective.title,
          },
          rightNowCompleted: false,
        })
      },

      // Computed
      isLocked: () => {
        const { objective } = get()
        return objective !== null && objective.status === "active"
      },

      canCreateNew: () => {
        const { objective } = get()
        return objective === null || objective.status === "completed" || objective.status === "failed"
      },

      getTimeRemaining: () => {
        const { objective } = get()
        if (!objective) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false }
        }

        const now = new Date().getTime()
        const deadline = new Date(objective.deadline).getTime()
        const diff = deadline - now

        if (diff <= 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true }
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        return { days, hours, minutes, seconds, isOverdue: false }
      },

      getHabitProgress: () => {
        const { habitChallenge } = get()
        if (!habitChallenge) {
          return { day: 0, streak: 0, percentage: 0 }
        }

        const startDate = new Date(habitChallenge.startDate)
        const today = new Date()
        const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        return {
          day: Math.min(dayNumber, 66),
          streak: habitChallenge.currentStreak,
          percentage: Math.round((habitChallenge.days.filter(d => d.completed).length / 66) * 100),
        }
      },

      getDominoProgress: () => {
        const { dominoChain } = get()
        if (!dominoChain) {
          return { completed: 0, total: 0, percentage: 0 }
        }

        return {
          completed: dominoChain.completedDominos,
          total: dominoChain.totalDominos,
          percentage: Math.round((dominoChain.completedDominos / Math.max(1, dominoChain.totalDominos)) * 100),
        }
      },

      getContractInfo: () => {
        const { contractMeter } = get()
        if (!contractMeter) {
          return { state: "stable" as ContractState, daysInactive: 0, tensionLevel: 0 }
        }

        return {
          state: contractMeter.state,
          daysInactive: contractMeter.daysInactive,
          tensionLevel: contractMeter.tensionLevel,
        }
      },
    }),
    {
      name: "one-app",
    }
  )
)

// Hydration hook - use this to wait for localStorage data to load
export const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const unsubFinishHydration = useAppStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })

    // Check if already hydrated
    if (useAppStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }

    return () => {
      unsubFinishHydration()
    }
  }, [])

  return hasHydrated
}

// Keep the old store for backwards compatibility
export { useAppStore as useObjectiveStore }
