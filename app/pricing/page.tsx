"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Shield } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!user || !session) {
      router.push("/login?redirect=/pricing")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">

      {/* ── Atmosphere ── */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/[0.06] blur-[200px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 h-16">
        <Link href="/" className="opacity-50 hover:opacity-100 transition-opacity">
          <Logo className="h-7 w-auto" />
        </Link>
        {user ? (
          <Link href="/app" className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors tracking-[0.15em] uppercase">
            Go to app
          </Link>
        ) : (
          <Link href="/login" className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors tracking-[0.15em] uppercase">
            Sign in
          </Link>
        )}
      </header>

      {/* ── Content ── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 -mt-8">
        <div className="w-full max-w-md text-center">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2.5rem] md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-5"
          >
            One goal.
            <br />
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Zero distractions.
            </span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[15px] text-muted-foreground leading-relaxed mb-14 max-w-sm mx-auto"
          >
            The focus system that forces you to finish what you start.
            AI&#8209;powered. Ruthlessly simple.
          </motion.p>

          {/* ── Price ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-10"
          >
            <p className="text-[11px] text-muted-foreground/50 tracking-[0.15em] uppercase mb-3">
              First month
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl md:text-4xl font-bold tabular-nums tracking-tight">$1.99</span>
              <span className="text-sm text-muted-foreground/40 line-through">$6.99</span>
            </div>
            <p className="text-[12px] text-muted-foreground/40 mt-2">
              then $6.99/mo &middot; cancel anytime
            </p>
          </motion.div>

          {/* ── CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.button
              onClick={handleSubscribe}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full max-w-xs mx-auto group cursor-pointer"
            >
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative h-12 bg-primary rounded-xl flex items-center justify-center gap-2.5 font-semibold text-primary-foreground text-sm transition-all">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>Get started</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs text-center mt-3"
              >
                {error}
              </motion.p>
            )}
          </motion.div>

          {/* ── Trust ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-4 text-[10px] text-muted-foreground/30 tracking-wide"
          >
            <span className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Secure checkout
            </span>
            <span className="w-px h-2.5 bg-white/5" />
            <span className="flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Cancel anytime
            </span>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
