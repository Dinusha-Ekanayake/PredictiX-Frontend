"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import Footer from "@/components/navigation/Footer";
import AmbientBackground from "@/components/background/AmbientBackground";

export default function PrivacyPolicyPage() {
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
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Privacy Policy
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
              1. Introduction
            </h2>
            <p>
              Welcome to PredictiX, an AI-powered fleet and asset management
              platform developed by NeuroMinds. We are committed to protecting
              your personal information and your right to privacy. This Privacy
              Policy explains what information we collect, how we use it, and
              what rights you have in relation to it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We collect information that you provide directly to us when using
              PredictiX:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong className="text-foreground/80">Account Information:</strong>{" "}
                Name, email address, role, department, and profile details.
              </li>
              <li>
                <strong className="text-foreground/80">Usage Data:</strong>{" "}
                Interactions with the platform including chatbot queries,
                dashboard views, and ticket submissions.
              </li>
              <li>
                <strong className="text-foreground/80">Asset Data:</strong>{" "}
                Vehicle and fleet information entered or managed through the
                system, including GPS data, maintenance logs, and fuel records.
              </li>
              <li>
                <strong className="text-foreground/80">Device Information:</strong>{" "}
                Browser type, IP address, and device identifiers for security
                and analytics purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>To provide, maintain, and improve the PredictiX platform.</li>
              <li>
                To generate AI-powered predictions, reports, and analytics for
                fleet management.
              </li>
              <li>
                To send notifications related to tickets, system updates, and
                account activity.
              </li>
              <li>
                To respond to your help desk queries, support requests, and FAQ
                submissions.
              </li>
              <li>To ensure the security and integrity of the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Data Sharing &amp; Disclosure
            </h2>
            <p>
              We do not sell or rent your personal information to third parties.
              We may share your data only with:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 mt-3">
              <li>
                <strong className="text-foreground/80">Service Providers:</strong>{" "}
                Third-party services such as Supabase (database), EmailJS (email
                notifications), and Hugging Face (AI models) that help operate
                the platform.
              </li>
              <li>
                <strong className="text-foreground/80">Legal Requirements:</strong>{" "}
                If required by law, regulation, or legal process.
              </li>
              <li>
                <strong className="text-foreground/80">Organization Admins:</strong>{" "}
                Administrators within your organization may access user and
                asset data for management purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data, including encrypted connections (TLS/SSL), secure
              authentication with JWT tokens, and role-based access control.
              However, no method of transmission over the internet is 100%
              secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Data Retention
            </h2>
            <p>
              We retain your personal data for as long as your account is
              active or as needed to provide services. If you request account
              deletion, we will remove your personal information within 30 days,
              except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Access and receive a copy of your personal data.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Object to or restrict processing of your data.</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:neuromindspredictix@gmail.com"
                className="text-primary hover:underline"
              >
                neuromindspredictix@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact
              us at{" "}
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
