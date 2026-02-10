"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase"
import { useAppStore } from "@/store/useAppStore"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

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
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      setIsSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
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
              <h1 className="text-2xl font-bold">{t("Password updated", "Mot de passe mis à jour")}</h1>
              <p className="text-muted-foreground text-sm max-w-sm">
                {t("Your password has been reset. Redirecting to sign in...", "Votre mot de passe a été réinitialisé. Redirection vers la connexion...")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-card border-border">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2">
                  <Logo size="lg" className="drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
                </div>
                <h1 className="text-2xl font-bold">{t("New password", "Nouveau mot de passe")}</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  {t("Choose a new password for your account", "Choisissez un nouveau mot de passe pour votre compte")}
                </p>
              </div>

              {error && (
                <FieldError className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  {error}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="password">{t("New password", "Nouveau mot de passe")}</FieldLabel>
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
                      {t("Updating...", "Mise à jour...")}
                    </>
                  ) : (
                    t("Reset password", "Réinitialiser le mot de passe")
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
