"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import {
  loadUserData,
  debouncedSave,
  flushSave,
} from "@/lib/supabase-sync"
import { LOCAL_ONLY_KEYS } from "@/lib/sync-config"

export function useSupabaseSync() {
  const { user, session } = useAuth()
  const hasHydrated = useHasHydrated()
  const hasSyncedRef = useRef(false)
  const userIdRef = useRef<string | null>(null)

  // Phase 1: Load from Supabase on login
  useEffect(() => {
    if (!hasHydrated || !user || !session) return
    if (hasSyncedRef.current && userIdRef.current === user.id) return

    const loadRemoteData = async () => {
      try {
        const remoteData = await loadUserData()

        if (remoteData?.state && Object.keys(remoteData.state).length > 0) {
          // Smart merge: remote wins UNLESS local has data that remote lacks
          const localState = useAppStore.getState()
          const mergedState: Record<string, unknown> = {}

          for (const [key, value] of Object.entries(remoteData.state)) {
            if (LOCAL_ONLY_KEYS.has(key)) continue

            const localValue = (localState as unknown as Record<string, unknown>)[key]

            // Never overwrite a valid local objective with null/empty remote
            if (key === "objective") {
              if (localValue && !value) {
                // Local has objective, remote doesn't — keep local
                continue
              }
              if (localValue && value) {
                // Both have objectives — keep whichever was updated more recently
                const localObj = localValue as { updatedAt?: string; createdAt?: string }
                const remoteObj = value as { updatedAt?: string; createdAt?: string }
                const localTime = new Date(localObj.updatedAt || localObj.createdAt || 0).getTime()
                const remoteTime = new Date(remoteObj.updatedAt || remoteObj.createdAt || 0).getTime()
                if (localTime >= remoteTime) continue
              }
            }

            // For hasCompletedOnboarding: never overwrite true with false
            if (key === "hasCompletedOnboarding" && localValue === true && value === false) {
              continue
            }

            mergedState[key] = value
          }

          if (Object.keys(mergedState).length > 0) {
            useAppStore.setState(mergedState)
          }
        }
        // If remoteData is null, this is a new user — keep current (empty) state
        // The first debouncedSave will create the row

        hasSyncedRef.current = true
        userIdRef.current = user.id
      } catch (err) {
        console.error("[sync] Failed to load remote data:", err)
        // Fall back to localStorage data (already hydrated)
        hasSyncedRef.current = true
        userIdRef.current = user.id
      }
    }

    loadRemoteData()
  }, [hasHydrated, user, session])

  // Phase 2: Subscribe to store changes and debounce-save
  useEffect(() => {
    if (!user || !hasHydrated) return

    const unsubscribe = useAppStore.subscribe((state) => {
      if (!hasSyncedRef.current) return

      const plainState: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(state)) {
        if (typeof value !== "function") {
          plainState[key] = value
        }
      }

      debouncedSave(user.id, plainState)
    })

    return () => unsubscribe()
  }, [user, hasHydrated])

  // Phase 3: Flush on page unload
  useEffect(() => {
    if (!user) return

    const handleBeforeUnload = () => {
      const state = useAppStore.getState()
      const plainState: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(state)) {
        if (typeof value !== "function") {
          plainState[key] = value
        }
      }
      flushSave(user.id, plainState)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [user])
}
