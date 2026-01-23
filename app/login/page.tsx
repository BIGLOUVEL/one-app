import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-10 relative">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/50 transition-all duration-200"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div className="w-full max-w-sm md:max-w-4xl">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
