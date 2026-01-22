import { create } from "zustand"
import { Deadline, DeadlineStatus } from "@/lib/types"
import { mockDeadlines } from "@/lib/mockData"
import { getDaysUntil } from "@/lib/utils"

interface DeadlineStore {
  deadlines: Deadline[]
  loading: boolean
  searchQuery: string
  filterStatus: DeadlineStatus | "all"

  // Actions
  setDeadlines: (deadlines: Deadline[]) => void
  addDeadline: (deadline: Omit<Deadline, "id" | "createdAt">) => Promise<void>
  updateDeadline: (id: string, updates: Partial<Deadline>) => Promise<void>
  deleteDeadline: (id: string) => Promise<void>
  markAsCompleted: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterStatus: (status: DeadlineStatus | "all") => void
  loadDeadlines: () => Promise<void>

  // Computed
  getFilteredDeadlines: () => Deadline[]
  getUpcomingDeadlines: () => Deadline[]
  getOverdueDeadlines: () => Deadline[]
  getTodayDeadlines: () => Deadline[]
}

export const useDeadlineStore = create<DeadlineStore>((set, get) => ({
  deadlines: [],
  loading: false,
  searchQuery: "",
  filterStatus: "all",

  setDeadlines: (deadlines) => set({ deadlines }),

  addDeadline: async (deadline) => {
    set({ loading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newDeadline: Deadline = {
      ...deadline,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: getDaysUntil(deadline.dueAt) < 0 ? "overdue" : "upcoming",
    }

    set((state) => ({
      deadlines: [...state.deadlines, newDeadline],
      loading: false,
    }))
  },

  updateDeadline: async (id, updates) => {
    set({ loading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    set((state) => ({
      deadlines: state.deadlines.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      loading: false,
    }))
  },

  deleteDeadline: async (id) => {
    set({ loading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    set((state) => ({
      deadlines: state.deadlines.filter((d) => d.id !== id),
      loading: false,
    }))
  },

  markAsCompleted: async (id) => {
    set({ loading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    set((state) => ({
      deadlines: state.deadlines.map((d) =>
        d.id === id
          ? { ...d, status: "completed" as const, completedAt: new Date().toISOString() }
          : d
      ),
      loading: false,
    }))
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  loadDeadlines: async () => {
    set({ loading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Update status based on current date
    const updatedDeadlines = mockDeadlines.map((d) => {
      if (d.status === "completed") return d
      const daysUntil = getDaysUntil(d.dueAt)
      return {
        ...d,
        status: daysUntil < 0 ? "overdue" as const : "upcoming" as const,
      }
    })

    set({ deadlines: updatedDeadlines, loading: false })
  },

  getFilteredDeadlines: () => {
    const { deadlines, searchQuery, filterStatus } = get()

    return deadlines.filter((d) => {
      const matchesSearch =
        searchQuery === "" ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filterStatus === "all" || d.status === filterStatus

      return matchesSearch && matchesStatus
    })
  },

  getUpcomingDeadlines: () => {
    return get()
      .deadlines.filter((d) => d.status === "upcoming")
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
  },

  getOverdueDeadlines: () => {
    return get().deadlines.filter((d) => d.status === "overdue")
  },

  getTodayDeadlines: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return get().deadlines.filter((d) => {
      const dueDate = new Date(d.dueAt)
      return (
        d.status === "upcoming" &&
        dueDate >= today &&
        dueDate < tomorrow
      )
    })
  },
}))
