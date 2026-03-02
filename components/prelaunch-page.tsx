"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"

// ColorBends uses Three.js — client only
const ColorBends = dynamic(() => import("@/components/ColorBends"), { ssr: false }) as any

const ADMIN_PASSWORD = "EARLYADOPTER"

export function PreLaunchPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showAdminInput, setShowAdminInput] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [adminError, setAdminError] = useState(false)
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adminInputRef = useRef<HTMLInputElement>(null)

  const handleLogoClick = useCallback(() => {
    logoClickCount.current += 1
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current)
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0 }, 600)
    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0
      setShowAdminInput(true)
      setAdminError(false)
      setAdminPassword("")
    }
  }, [])

  useEffect(() => {
    if (showAdminInput) setTimeout(() => adminInputRef.current?.focus(), 50)
  }, [showAdminInput])

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassword === ADMIN_PASSWORD) {
      router.push("/login")
    } else {
      setAdminError(true)
      setAdminPassword("")
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError("Something went wrong. Try again."); return }
      setIsSuccess(true)
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 z-0">
        <ColorBends
          rotation={45}
          speed={0.2}
          colors={["#2fd016", "#ffffff"]}
          transparent
          autoRotate={0.35}
          scale={1.3}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <button
          onClick={handleLogoClick}
          className="mb-10 cursor-default select-none outline-none"
          tabIndex={-1}
          aria-hidden
        >
          <Logo size="xl" className="drop-shadow-[0_0_24px_rgba(47,208,22,0.5)]" />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            Coming soon
          </span>
        </div>

        <h1 className="mb-4 max-w-lg text-center text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
          Not a task manager.<br />
          <span className="text-primary">A focus OS.</span>
        </h1>

        <p className="mb-10 max-w-sm text-center text-sm leading-relaxed text-white/50">
          Pick ONE objective. Lock it in. Execute daily.
          Built on The ONE Thing methodology.
          <br />
          <span className="text-white/30">Be first to get access.</span>
        </p>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-white">You&apos;re on the list.</p>
            <p className="text-xs text-white/40">We&apos;ll reach out the day we launch.</p>
          </div>
        ) : (
          <form onSubmit={handleWaitlistSubmit} className="flex w-full max-w-sm flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/25 backdrop-blur-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Join</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
            {error && <p className="text-center text-xs text-red-400">{error}</p>}
            <p className="text-center text-[11px] text-white/20">No spam. Just a launch notification.</p>
          </form>
        )}

        {showAdminInput && (
          <form onSubmit={handleAdminSubmit} className="mt-12 flex flex-col items-center gap-2">
            <input
              ref={adminInputRef}
              type="password"
              value={adminPassword}
              onChange={(e) => { setAdminPassword(e.target.value); setAdminError(false) }}
              placeholder="Access code"
              className={`h-9 w-48 rounded-lg border bg-black/40 px-3 text-center text-xs text-white/60 outline-none backdrop-blur-sm transition-all ${adminError ? "border-red-500/50" : "border-white/10 focus:border-white/30"}`}
              onKeyDown={(e) => e.key === "Escape" && setShowAdminInput(false)}
            />
            {adminError && <p className="text-[10px] text-red-400/70">Wrong code</p>}
          </form>
        )}
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <button onClick={() => router.push("/login")} className="text-[11px] tracking-widest text-white/15 uppercase cursor-default hover:text-white/30 transition-colors">ONE — Focus Operating System</button>
      </div>
    </div>
  )
}
