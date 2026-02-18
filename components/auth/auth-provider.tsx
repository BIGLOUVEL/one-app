"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    // Flush pending sync saves before signing out
    try {
      const { useAppStore } = await import("@/store/useAppStore")
      const { flushSave, resetSyncState } = await import("@/lib/supabase-sync")
      const state = useAppStore.getState()
      if (state.userId) {
        const plainState: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(state)) {
          if (typeof value !== "function") plainState[key] = value
        }
        await flushSave(state.userId, plainState)
      }
      resetSyncState()
      useAppStore.getState().clearAllData()
    } catch {
      // Best effort
    }

    // Clear localStorage
    localStorage.removeItem("one-app")

    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    // Force hard reload to clear all cookies and state
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
