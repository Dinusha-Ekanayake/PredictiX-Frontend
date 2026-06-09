"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Footer from "@/components/navigation/Footer";
import AmbientBackground from "@/components/background/AmbientBackground";

export default function TermsOfServicePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />

      <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/help-desk"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help Desk
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last updated: June 1, 2026
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the PredictiX platform, you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, you may not access or use the platform. PredictiX is
              developed and maintained by NeuroMinds as an industry-based AI
              software project.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Description of Service
            </h2>
            <p>
              PredictiX is an AI-powered fleet and asset management platform
              that provides predictive analytics, real-time monitoring, ticket
              management, a knowledge-based chatbot, and comprehensive
              reporting tools for vehicle fleet operations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. User Accounts
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You must provide accurate and complete information when creating
                your account.
              </li>
              <li>
                You are responsible for all activities that occur under your
                account.
              </li>
              <li>
                Notify the administrator immediately if you suspect unauthorized
                access to your account.
              </li>
              <li>
                Accounts are assigned roles (User, Admin, Super Admin) by
                organization administrators. Each role has specific access
                permissions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Acceptable Use
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                Use the platform for any unlawful purpose or in violation of
                applicable laws.
              </li>
              <li>
                Attempt to gain unauthorized access to other users&apos;
                accounts or data.
              </li>
              <li>
                Interfere with or disrupt the platform&apos;s infrastructure or
                services.
              </li>
              <li>
                Upload malicious content, viruses, or harmful code through any
                platform feature.
              </li>
              <li>
                Misuse AI-generated predictions or analytics for purposes they
                are not intended for.
              </li>
              <li>
                Share your login credentials with unauthorized individuals.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Data &amp; Content
            </h2>
            <p>
              You retain ownership of the data you enter into PredictiX,
              including asset records, vehicle information, and ticket
              submissions. By using the platform, you grant NeuroMinds the
              right to process this data to provide AI-powered analytics,
              predictions, and platform features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. AI-Generated Content
            </h2>
            <p>
              PredictiX uses artificial intelligence and machine learning
              models to generate predictions, summaries, and recommendations.
              These outputs are provided for informational purposes only and
              should not be considered as professional advice. NeuroMinds does
              not guarantee the accuracy, completeness, or reliability of
              AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Service Availability
            </h2>
            <p>
              We strive to maintain platform availability but do not guarantee
              uninterrupted access. PredictiX may be temporarily unavailable
              due to maintenance, updates, or circumstances beyond our control.
              We will make reasonable efforts to notify users of planned
              downtime.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, NeuroMinds shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use
              the platform, including but not limited to damages for loss of
              data, profits, or business opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account if you
              violate these Terms of Service. Upon termination, your right to
              use the platform will cease immediately. You may request account
              deletion at any time by contacting the administrator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              10. Changes to Terms
            </h2>
            <p>
              We may modify these Terms of Service at any time. Continued use
              of the platform after changes are posted constitutes your
              acceptance of the revised terms. We encourage you to review these
              terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              11. Contact
            </h2>
            <p>
              For questions or concerns regarding these Terms of Service,
              please contact us at{" "}
              <a
                href="mailto:neuromindspredictix@gmail.com"
                className="text-primary hover:underline"
              >
                neuromindspredictix@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
