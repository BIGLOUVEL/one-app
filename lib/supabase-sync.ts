import { createClient } from "@/lib/supabase"
import { extractSyncableState } from "@/lib/sync-config"

let saveTimeout: ReturnType<typeof setTimeout> | null = null
let currentVersion = 0
let isSaving = false

/**
 * Load user data from Supabase. Returns null if no data exists (new user).
 */
export async function loadUserData(): Promise<{
  state: Record<string, unknown>
  version: number
} | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_data")
    .select("state, version")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found — new user
      return null
    }
    console.error("[sync] Failed to load user data:", error)
    return null
  }

  currentVersion = data.version
  return {
    state: data.state as Record<string, unknown>,
    version: data.version,
  }
}

/**
 * Save user data to Supabase.
 */
export async function saveUserData(
  userId: string,
  state: Record<string, unknown>
): Promise<boolean> {
  if (isSaving) return false
  isSaving = true

  const supabase = createClient()
  const syncableState = extractSyncableState(state)
  const newVersion = currentVersion + 1

  try {
    const { error } = await supabase.from("user_data").upsert(
      {
        user_id: userId,
        state: syncableState,
        version: newVersion,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (error) {
      console.error("[sync] Failed to save:", error)
      return false
    }

    currentVersion = newVersion
    return true
  } finally {
    isSaving = false
  }
}

/**
 * Debounced save — waits 2 seconds after last change before saving.
 */
export function debouncedSave(
  userId: string,
  state: Record<string, unknown>
) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveUserData(userId, state)
  }, 2000)
}

/**
 * Force an immediate save (e.g., before sign-out or page unload).
 */
export function flushSave(
  userId: string,
  state: Record<string, unknown>
) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveUserData(userId, state)
}

/**
 * Reset sync state (on sign-out).
 */
export function resetSyncState() {
  if (saveTimeout) clearTimeout(saveTimeout)
  currentVersion = 0
  isSaving = false
}
