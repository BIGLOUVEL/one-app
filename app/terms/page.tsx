"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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

        <h1 className="text-3xl font-black tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: February 13, 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ONE - Focus Operating System (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              ONE is a focus and productivity application based on &ldquo;The ONE Thing&rdquo; methodology. The Service provides tools for goal setting, focus sessions, habit tracking, and AI-powered scheduling analysis. Features may be updated, modified, or removed at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 16 years old to use the Service.</li>
              <li>One person per account. Sharing accounts is not permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Subscriptions and Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>ONE offers free and paid subscription plans.</li>
              <li>Paid subscriptions are billed monthly through Stripe.</li>
              <li>You may cancel your subscription at any time. Access continues until the end of the current billing period.</li>
              <li>Refunds are handled on a case-by-case basis. Contact us within 14 days of purchase for refund requests.</li>
              <li>Prices may change with 30 days&apos; notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse engineer, decompile, or disassemble the Service</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Create multiple accounts to abuse free tiers or promotions</li>
              <li>Use automated tools to access the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>
              The ONE application, including its design, code, graphics, and content, is owned by us and protected by intellectual property laws. Your data remains yours — we claim no ownership over the content you create within the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. AI Features</h2>
            <p>
              ONE uses AI-powered features (suggestions, timetable analysis, coaching). AI outputs are provided as guidance only and should not be considered professional advice. We are not responsible for decisions made based on AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time through the Settings page. Upon deletion, your data will be permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of France. Any disputes shall be resolved in the courts of Paris, France.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">12. Contact</h2>
            <p>
              For any questions about these Terms, please contact us at <a href="mailto:contact@onefocus.app" className="text-primary hover:underline">contact@onefocus.app</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
