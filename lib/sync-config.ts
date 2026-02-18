// Keys that are transient/device-specific and should NOT be synced to Supabase
export const LOCAL_ONLY_KEYS: Set<string> = new Set([
  "currentSession",
  "isGeneratingRoadmap",
  "isAnalyzingTimetable",
  "sessionPostIts",
  "userId",
])

export function extractSyncableState(
  fullState: Record<string, unknown>
): Record<string, unknown> {
  const syncable: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fullState)) {
    if (!LOCAL_ONLY_KEYS.has(key) && typeof value !== "function") {
      syncable[key] = value
    }
  }
  return syncable
}
