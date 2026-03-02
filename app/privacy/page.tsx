import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy — ONE Focus OS",
  description: "Privacy Policy for ONE — Focus Operating System. Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-black tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: March 2, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              ONE (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the ONE — Focus Operating System
              application accessible at <strong className="text-foreground">https://makeitreal.one</strong>. This
              Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Account information:</strong> Email address and first name when
                you create an account via email/password or Google Sign-In.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> Objectives, focus sessions, habit tracking
                data, and app preferences that you create within the application.
              </li>
              <li>
                <strong className="text-foreground">Payment information:</strong> Payment details are processed
                securely by Stripe. We do not store your credit card information on our servers.
              </li>
              <li>
                <strong className="text-foreground">Technical data:</strong> Browser type, device information, and
                anonymous usage analytics to improve the service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Google Sign-In</h2>
            <p className="mb-3">
              ONE offers sign-in via Google OAuth as a convenience. When you choose to sign in with Google, we request
              access only to the following data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Email address</strong> — used solely to create and identify your
                ONE account.
              </li>
              <li>
                <strong className="text-foreground">Basic profile information</strong> (name, profile picture) — used
                to personalise your in-app experience (e.g. display your first name).
              </li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-foreground">not</strong> request access to your Google contacts, Google
              Drive, Gmail, calendar, or any other Google services. We do not use your Google data for advertising or
              share it with third parties. You can revoke ONE&apos;s access to your Google account at any time from
              your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Account permissions
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your ONE account</li>
              <li>To provide and maintain the ONE service</li>
              <li>To process subscriptions and payments</li>
              <li>To personalise your experience (AI coaching, suggestions)</li>
              <li>To send important service updates</li>
              <li>To improve our application and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase infrastructure with encryption at rest and in transit. We
              implement industry-standard security measures to protect your personal information. Local app data is
              stored in your browser&apos;s localStorage for performance.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Google OAuth:</strong> Optional sign-in method. Scopes requested:
                email, profile (openid).
              </li>
              <li>
                <strong className="text-foreground">Supabase:</strong> Authentication and database hosting.
              </li>
              <li>
                <strong className="text-foreground">Stripe:</strong> Payment processing. Stripe&apos;s privacy policy
                applies to payment data.
              </li>
              <li>
                <strong className="text-foreground">OpenAI:</strong> AI-powered features (timetable analysis,
                suggestions). Data sent to OpenAI is not used to train their models.
              </li>
              <li>
                <strong className="text-foreground">Vercel:</strong> Application hosting.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Cookies</h2>
            <p>
              We use essential cookies only for authentication and session management. We do not use advertising or
              tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. When you delete your account, all associated
              data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Children&apos;s Privacy</h2>
            <p>
              ONE is not intended for use by children under 16 years of age. We do not knowingly collect personal
              information from children.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the
              &ldquo;Last updated&rdquo; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">12. Contact</h2>
            <p>
              For any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:contact@makeitreal.one" className="text-primary hover:underline">
                contact@makeitreal.one
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
