"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
        <p className="text-sm text-muted-foreground mb-12">Last updated: February 13, 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              ONE (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the ONE - Focus Operating System application. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Account information:</strong> Email address and first name when you create an account.</li>
              <li><strong className="text-foreground">Usage data:</strong> Objectives, focus sessions, habit tracking data, and app preferences that you create within the application.</li>
              <li><strong className="text-foreground">Payment information:</strong> Payment details are processed securely by Stripe. We do not store your credit card information on our servers.</li>
              <li><strong className="text-foreground">Technical data:</strong> Browser type, device information, and anonymous usage analytics to improve the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and maintain the ONE service</li>
              <li>To process subscriptions and payments</li>
              <li>To personalize your experience (AI coaching, suggestions)</li>
              <li>To send important service updates</li>
              <li>To improve our application and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase infrastructure with encryption at rest and in transit. We implement industry-standard security measures to protect your personal information. Local app data is stored in your browser&apos;s localStorage for performance.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Supabase:</strong> Authentication and database hosting</li>
              <li><strong className="text-foreground">Stripe:</strong> Payment processing</li>
              <li><strong className="text-foreground">OpenAI:</strong> AI-powered features (timetable analysis, suggestions). Data sent to OpenAI is not used to train their models.</li>
              <li><strong className="text-foreground">Vercel:</strong> Application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Your Rights</h2>
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
            <h2 className="text-base font-semibold text-foreground mb-3">7. Cookies</h2>
            <p>
              We use essential cookies only for authentication and session management. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. When you delete your account, all associated data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Children&apos;s Privacy</h2>
            <p>
              ONE is not intended for use by children under 16 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Contact</h2>
            <p>
              For any questions about this Privacy Policy, please contact us at <a href="mailto:contact@onefocus.app" className="text-primary hover:underline">contact@onefocus.app</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
