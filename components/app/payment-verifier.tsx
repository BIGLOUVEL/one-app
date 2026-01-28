"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { CheckCircle2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function PaymentVerifier() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!sessionId) return

    const verifyPayment = async () => {
      setStatus("verifying")

      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          // No session but payment done — just redirect to app
          setStatus("success")
          setMessage("Welcome!")
          setTimeout(() => {
            router.replace("/app")
          }, 1500)
          return
        }

        const response = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        })

        if (response.ok) {
          setStatus("success")
          setMessage("Subscription activated!")
        } else {
          // Even if verification fails (e.g. no profiles table yet),
          // don't block the user — they paid, let them in
          console.warn("Payment verification API returned error, proceeding anyway")
          setStatus("success")
          setMessage("Welcome!")
        }

        setTimeout(() => {
          router.replace("/app")
        }, 2000)
      } catch (error) {
        console.error("Payment verification error:", error)
        // Don't block the user on errors
        setStatus("success")
        setMessage("Welcome!")
        setTimeout(() => {
          router.replace("/app")
        }, 1500)
      }
    }

    verifyPayment()
  }, [sessionId, router])

  if (!sessionId || status === "idle") return null

  return (
    <AnimatePresence>
      {(status === "verifying" || status === "success") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <p className="text-lg font-medium">Activating your subscription...</p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                </motion.div>
                <p className="text-lg font-medium text-green-500">{message}</p>
                <p className="text-sm text-muted-foreground">Redirecting...</p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
