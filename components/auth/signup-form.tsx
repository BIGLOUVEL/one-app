"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle2 } from "lucide-react"
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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t("Passwords do not match", "Les mots de passe ne correspondent pas"))
      return
    }

    if (password.length < 6) {
      setError(t("Password must be at least 6 characters", "Le mot de passe doit contenir au moins 6 caractères"))
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Add to newsletter list (non-blocking)
      fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => {})

      // If session returned (email confirmation disabled), go straight to app
      if (data.session) {
        router.push("/app")
        return
      }

      // Email confirmation required — show message
      setIsSuccess(true)
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
          redirectTo: `${window.location.origin}/auth/callback`,
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

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0 bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t("Check your email", "Vérifiez votre email")}</h1>
              <p className="text-muted-foreground text-sm max-w-sm">
                {t(`A confirmation link has been sent to`, `Un lien de confirmation a été envoyé à`)} <strong>{email}</strong>.
                {t("Click the link to complete your registration.", "Cliquez sur le lien pour terminer votre inscription.")}
              </p>
              <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
                <Button
                  onClick={() => router.push("/login")}
                >
                  {t("Sign in", "Se connecter")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
                <h1 className="text-2xl font-bold">{t("Create your account", "Créez votre compte")}</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  {t("Start your journey with ONE", "Commencez votre parcours avec ONE")}
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
                <FieldLabel htmlFor="password">{t("Password", "Mot de passe")}</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("At least 6 characters", "Au moins 6 caractères")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-secondary/50 border-border"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">{t("Confirm password", "Confirmer le mot de passe")}</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("Repeat your password", "Répétez votre mot de passe")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {t("Creating account...", "Création du compte...")}
                    </>
                  ) : (
                    t("Create account", "Créer un compte")
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
                {t("Already have an account?", "Déjà un compte ?")}{" "}
                <Link
                  href="/login"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  {t("Sign in", "Se connecter")}
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
        {t("By creating an account, you agree to our", "En créant un compte, vous acceptez nos")}{" "}
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
