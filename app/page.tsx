// Switcher — default is pre-launch page
// To launch (show landing): add LAUNCHED=true in Vercel → redeploy
// To revert to pre-launch:  remove LAUNCHED or set LAUNCHED=false → redeploy
import { PreLaunchPage } from "@/components/prelaunch-page"
import LandingPage from "@/components/landing-original"

export default function Page() {
  const isLaunched = process.env.LAUNCHED === "true"
  if (isLaunched) return <LandingPage />
  return <PreLaunchPage />
}
