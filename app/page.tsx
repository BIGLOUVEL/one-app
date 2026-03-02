// Switcher — controlled by PRELAUNCH env var in Vercel
// To activate pre-launch:  add PRELAUNCH=true in Vercel → redeploy
// To launch (revert):      remove PRELAUNCH or set PRELAUNCH=false → redeploy
import { PreLaunchPage } from "@/components/prelaunch-page"
import LandingPage from "@/components/landing-original"

export default function Page() {
  const isPreLaunch = process.env.PRELAUNCH === "true"
  if (isPreLaunch) return <PreLaunchPage />
  return <LandingPage />
}
