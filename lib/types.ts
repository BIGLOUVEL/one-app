export type ObjectiveStatus = "active" | "completed" | "failed"

// Core Objective with cascade from "Goal Setting to the Now"
export interface Objective {
  id: string
  // Cascade - The focusing question flow
  somedayGoal: string       // Big picture / Someday goal
  yearGoal?: string         // This year (optional for MVP)
  monthGoal: string         // This month's focus
  weekGoal: string          // This week's ONE thing
  todayGoal: string         // Today's ONE thing
  rightNowAction: string    // Immediate next action

  // Legacy fields for compatibility
  title: string             // = todayGoal for display
  deadline: string          // ISO string
  why: string               // Core motivation

  status: ObjectiveStatus
  createdAt: string
  completedAt?: string
  progress: number          // 0-100
}

// 4-1-1 Planning
export interface FourOneOne {
  id: string
  objectiveId: string
  yearlyGoals: string[]     // Max 3
  monthlyGoals: string[]    // Max 3
  weeks: WeeklyOutcome[]    // 4 weeks
}

export interface WeeklyOutcome {
  weekNumber: number        // 1-4
  outcomes: string[]        // Max 3 outcomes per week
  reflection?: string       // "What moved the needle?"
  completed: boolean
}

// GPS One-Page Plan
export interface GPSPlan {
  id: string
  objectiveId: string
  goal: string              // One sentence goal
  priorities: Priority[]    // Max 3 priorities
}

export interface Priority {
  id: string
  name: string
  strategies: string[]      // Max 3 strategies per priority
  isActive: boolean         // Is this the ONE priority right now?
}

// Focus Session / Time Blocking
export interface FocusBlock {
  id: string
  objectiveId: string
  days: string[]            // Mon, Tue, etc.
  startTime: string         // "09:00"
  duration: number          // minutes: 25, 50, 90, 120
}

export interface PostIt {
  id: string
  text: string
  x: number
  y: number
  rotation: number
  sessionId?: string
  createdAt?: string
  liked?: boolean
  color?: "yellow" | "pink" | "blue" | "green" | "purple"
}

export interface PostItCollection {
  id: string
  name: string
  description?: string
  emoji?: string
  postItIds: string[]
  createdAt: string
  updatedAt: string
}

export interface FocusSession {
  id: string
  objectiveId: string
  startedAt: string
  endedAt?: string
  duration: number          // planned duration in minutes
  actualDuration?: number   // actual duration if ended early
  distractions: Distraction[]
  postIts?: PostIt[]        // Post-its captured during session
  reflection?: string       // "What did you move forward?"
  nextAction?: string       // Optional next action
}

export interface Distraction {
  id: string
  text: string
  timestamp: string
  handled: boolean
}

// 66-Day Habit Challenge
export interface HabitChallenge {
  id: string
  objectiveId: string
  startDate: string
  minimumSessionMinutes: number  // 15, 30, 50
  days: HabitDay[]
  currentStreak: number
  longestStreak: number
}

export interface HabitDay {
  date: string              // YYYY-MM-DD
  completed: boolean
  sessionMinutes?: number
}

// Four Thieves Assessment
export type ThiefType = "say-no" | "fear-chaos" | "poor-health" | "unsupportive-environment"

export interface ThievesAssessment {
  id: string
  completedAt: string
  answers: Record<string, number>  // Question ID -> score
  primaryThief: ThiefType
  secondaryThief?: ThiefType
}

export interface ThiefPlaybook {
  thief: ThiefType
  name: string
  description: string
  actions: PlaybookAction[]
}

export interface PlaybookAction {
  id: string
  title: string
  description: string
  completed: boolean
}

// Weekly Review
export interface WeeklyReview {
  id: string
  objectiveId: string
  weekOf: string            // ISO date of week start
  accomplishments: string
  blockers: string
  nextWeekOneThink: string
  createdAt: string
}

// Contract Meter States
export type ContractState = "stable" | "tension" | "broken" | "fulfilled"

// Domino Chain - Momentum tracking
export interface DominoChain {
  totalDominos: number          // Derived from planned sessions until deadline
  completedDominos: number      // Count of completed focus sessions
  lastSessionDate?: string      // ISO string of last completed session
}

// Contract Meter - Commitment tracking
export interface ContractMeter {
  state: ContractState
  lastActivityDate?: string     // ISO string
  tensionLevel: number          // 0-100, increases with inactivity
  daysInactive: number
}

// AI Onboarding Types
export interface OnboardingInput {
  somedayGoal: string
  context: {
    type: "student" | "freelance" | "startup" | "employee" | "other"
    horizon: string // "1 month", "3 months", "6 months", "1 year"
  }
  constraints: {
    hoursPerWeek: number
    deadline?: string
    resources?: string
  }
}

export interface AIGeneratedPlan {
  cascade: {
    somedayGoal: string
    yearGoal: string
    monthGoal: string
    weekGoal: string
    todayGoal: string
    rightNowAction: string
  }
  oneThingStatement: string
  focusBlockPlan: {
    duration: number
    steps: Array<{
      order: number
      action: string
      duration: number
    }>
  }
  risks: {
    primaryThief: ThiefType
    thiefDescription: string
    parade: string
  }
  why: string
}

// AI Roadmap Analysis - Generated after onboarding
export interface AIRoadmap {
  id: string
  objectiveId: string
  generatedAt: string

  // High-level summary
  summary: {
    totalWeeks: number
    totalMilestones: number
    estimatedCompletionDate: string
    confidenceLevel: "high" | "medium" | "low"
    riskLevel: "low" | "moderate" | "high"
  }

  // Detailed milestones with checkpoints
  milestones: Milestone[]

  // Weekly targets for trajectory
  weeklyTargets: WeeklyTarget[]

  // Risk analysis
  risks: RiskAnalysis[]

  // Key metrics to track
  keyMetrics: KeyMetric[]

  // AI recommendations
  recommendations: string[]
}

export interface Milestone {
  id: string
  order: number
  title: string
  description: string
  targetDate: string
  targetProgress: number // 0-100, cumulative progress at this milestone
  checkpoints: Checkpoint[]
  status: "upcoming" | "in_progress" | "completed" | "at_risk"
  completedAt?: string
}

export interface Checkpoint {
  id: string
  title: string
  description: string
  targetDate: string
  isCompleted: boolean
  completedAt?: string
}

export interface WeeklyTarget {
  weekNumber: number
  startDate: string
  endDate: string
  targetProgress: number // Expected cumulative progress by end of week
  targetSessions: number // Expected sessions this week
  focusArea: string // What to focus on this week
  milestone?: string // If a milestone falls this week
}

export interface RiskAnalysis {
  id: string
  category: "time" | "motivation" | "resources" | "external" | "skill"
  title: string
  description: string
  probability: "low" | "medium" | "high"
  impact: "low" | "medium" | "high"
  mitigation: string
}

export interface KeyMetric {
  id: string
  name: string
  target: number
  unit: string
  currentValue: number
  trend: "up" | "down" | "stable"
}

// Timetable Analyzer
export type TimetablePriority = "high" | "medium" | "low"

export interface TimetableBlock {
  id: string
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  startTime: string       // "09:00" (24h format)
  endTime: string         // "10:30"
  title: string
  category: string        // "Deep Work", "Meeting", "Admin", "Personal", "Class", "Break", etc.
  priority: TimetablePriority
  reasoning: string
  suggestion?: string
}

export interface TimetableAnalysis {
  id: string
  objectiveId: string
  analyzedAt: string
  blocks: TimetableBlock[]
  summary: {
    totalBlocks: number
    highPriorityCount: number
    mediumPriorityCount: number
    lowPriorityCount: number
    highPriorityHours: number
    mediumPriorityHours: number
    lowPriorityHours: number
    focusScore: number         // 0-100
  }
  insights: {
    topInsight: string
    biggestTimeWaster: string
    bestTimeSlot: string
    recommendations: string[]
  }
}

// App State
export interface AppState {
  objective: Objective | null
  hasCompletedOnboarding: boolean
  fourOneOne: FourOneOne | null
  gpsPlan: GPSPlan | null
  focusBlock: FocusBlock | null
  habitChallenge: HabitChallenge | null
  sessions: FocusSession[]
  reviews: WeeklyReview[]
  thievesAssessment: ThievesAssessment | null
  // AI Onboarding
  aiPlan: AIGeneratedPlan | null
  // AI Roadmap - detailed analysis
  aiRoadmap: AIRoadmap | null
  // Core Mechanic: Domino + Contract
  dominoChain: DominoChain | null
  contractMeter: ContractMeter | null
  plannedSessionsPerDay: number   // User setting: how many sessions per day (default: 1)
}
