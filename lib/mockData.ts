import { Deadline, AnalyticsData } from "./types"

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

// Helper to create dates relative to today
const addDays = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const addHours = (hours: number) => {
  const date = new Date()
  date.setHours(date.getHours() + hours)
  return date.toISOString()
}

export const mockDeadlines: Deadline[] = [
  {
    id: "1",
    title: "Launch marketing campaign",
    description: "Finalize and deploy Q1 marketing materials across all channels",
    dueAt: addHours(6),
    status: "upcoming",
    pressureMode: "tyrant",
    createdAt: addDays(-5),
    reminderChannels: ["email"],
    reminderFrequency: "smart",
  },
  {
    id: "2",
    title: "Submit quarterly report",
    description: "Complete financial analysis and submit to stakeholders",
    dueAt: addDays(1),
    status: "upcoming",
    pressureMode: "normal",
    createdAt: addDays(-7),
    reminderChannels: ["email"],
    reminderFrequency: "daily",
  },
  {
    id: "3",
    title: "Code review deadline",
    description: "Review PRs for the authentication system refactor",
    dueAt: addDays(3),
    status: "upcoming",
    pressureMode: "gentle",
    createdAt: addDays(-2),
    reminderChannels: ["email"],
    reminderFrequency: "smart",
  },
  {
    id: "4",
    title: "Client presentation prep",
    description: "Prepare slides and demo for new client onboarding",
    dueAt: addDays(5),
    status: "upcoming",
    pressureMode: "normal",
    createdAt: addDays(-3),
    reminderChannels: ["email"],
    reminderFrequency: "smart",
  },
  {
    id: "5",
    title: "Team offsite planning",
    description: "Book venue and finalize agenda for Q2 team retreat",
    dueAt: addDays(7),
    status: "upcoming",
    pressureMode: "gentle",
    createdAt: addDays(-10),
    reminderChannels: ["email"],
    reminderFrequency: "smart",
  },
  {
    id: "6",
    title: "Update documentation",
    description: "Revise API documentation with new endpoints",
    dueAt: addDays(-2),
    status: "overdue",
    pressureMode: "normal",
    createdAt: addDays(-15),
    reminderChannels: ["email"],
    reminderFrequency: "daily",
  },
  {
    id: "7",
    title: "Design system audit",
    description: "Review and consolidate design tokens across projects",
    dueAt: addDays(14),
    status: "upcoming",
    pressureMode: "gentle",
    createdAt: addDays(-1),
    reminderChannels: ["email"],
    reminderFrequency: "smart",
  },
  {
    id: "8",
    title: "Performance optimization",
    description: "Reduce page load time by 30% for dashboard",
    dueAt: addDays(-4),
    status: "completed",
    pressureMode: "tyrant",
    createdAt: addDays(-20),
    reminderChannels: ["email"],
    reminderFrequency: "smart",
    completedAt: addDays(-5),
  },
  {
    id: "9",
    title: "User feedback analysis",
    description: "Compile and analyze Q4 user survey responses",
    dueAt: addDays(-10),
    status: "completed",
    pressureMode: "normal",
    createdAt: addDays(-25),
    reminderChannels: ["email"],
    reminderFrequency: "smart",
    completedAt: addDays(-12),
  },
]

export const mockAnalytics: AnalyticsData = {
  completedThisWeek: 3,
  overdueCount: 1,
  longestStreak: 12,
  ghostScore: 847,
  totalDeadlines: 9,
  completionRate: 89,
}
