"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase"
import { useAppStore } from "@/store/useAppStore"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setIsSuccess(true)
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
              <h1 className="text-2xl font-bold">{t("Email sent", "Email envoyé")}</h1>
              <p className="text-muted-foreground text-sm max-w-sm">
                {t("A reset link has been sent to", "Un lien de réinitialisation a été envoyé à")} <strong>{email}</strong>.
                {t("Check your inbox.", "Vérifiez votre boîte de réception.")}
              </p>
              <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
                <Link href="/login">
                  <Button className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("Back to sign in", "Retour à la connexion")}
                  </Button>
                </Link>
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
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2">
                  <Logo size="lg" className="drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
                </div>
                <h1 className="text-2xl font-bold">{t("Forgot password", "Mot de passe oublié")}</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  {t("Enter your email to receive a reset link", "Entrez votre email pour recevoir un lien de réinitialisation")}
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
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Sending...", "Envoi en cours...")}
                    </>
                  ) : (
                    t("Send reset link", "Envoyer le lien")
                  )}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                <Link
                  href="/login"
                  className="text-foreground underline underline-offset-4 hover:text-primary inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  {t("Back to sign in", "Retour à la connexion")}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
