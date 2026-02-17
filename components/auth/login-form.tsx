"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase"
import { useAppStore } from "@/store/useAppStore"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/app"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Show auth callback error (e.g. Google OAuth redirect_url not allowed)
  useEffect(() => {
    const err = searchParams.get("error")
    const message = searchParams.get("message")
    if (err === "auth_error" && message) {
      setError(message === "missing_code" ? "Connexion annulée ou lien invalide." : message)
    }
  }, [searchParams])

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      router.push(redirect)
      router.refresh()
    } catch {
      setError(t("An error occurred. Please try again.", "Une erreur est survenue. Réessayez."))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch {
      setError(t("An error occurred. Please try again.", "Une erreur est survenue. Réessayez."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-card border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2">
                  <Logo size="lg" className="drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
                </div>
                <h1 className="text-2xl font-bold">{t("Welcome back", "Content de vous revoir")}</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  {t("Sign in to continue", "Connectez-vous pour continuer")}
                </p>
              </div>

              {error && (
                <FieldError className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  {error}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("you@example.com", "vous@exemple.com")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-secondary/50 border-border"
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("Password", "Mot de passe")}</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm text-muted-foreground underline-offset-2 hover:underline hover:text-foreground"
                  >
                    {t("Forgot password?", "Mot de passe oublié ?")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-secondary/50 border-border"
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Signing in...", "Connexion...")}
                    </>
                  ) : (
                    t("Sign in", "Se connecter")
                  )}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t("Or continue with", "Ou continuer avec")}
              </FieldSeparator>

              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Google
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {t("Don't have an account?", "Pas encore de compte ?")}{" "}
                <Link
                  href="/signup"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  {t("Sign up", "S'inscrire")}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-secondary/30 relative hidden md:flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  <Logo size="xl" className="relative drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]" />
                </div>
              </div>
              <h2 className="text-xl font-semibold">Focus Operating System</h2>
              <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                {t("One objective. One priority. One action. Nothing else matters.", "Un objectif. Une priorité. Une action. Rien d'autre ne compte.")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs">
        {t("By continuing, you agree to our", "En continuant, vous acceptez nos")}{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
          {t("Terms of Service", "Conditions d'utilisation")}
        </Link>{" "}
        {t("and our", "et notre")}{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          {t("Privacy Policy", "Politique de confidentialité")}
        </Link>
        .
      </FieldDescription>
    </div>
  )
}
