import { createBrowserClient } from "@supabase/ssr"

// Browser client for client components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Legacy export for backwards compatibility
export const supabase = createClient()

// Helper to get a unique device ID (for anonymous users before auth)
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server"

  let deviceId = localStorage.getItem("one_device_id")
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    localStorage.setItem("one_device_id", deviceId)
  }
  return deviceId
}

// Types for database
export interface AppStateRow {
  id: string
  device_id: string
  user_id?: string
  state: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}
