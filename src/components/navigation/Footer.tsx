"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, X, Copy, Check, Headphones } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);

  const adminEmail = "neuromindspredictix@gmail.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = adminEmail;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <footer className="relative z-10 w-full mt-auto py-6">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand / Copy */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-foreground/80">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                <Zap className="h-3 w-3 fill-current" />
              </div>
              PredictiX
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              &copy; {currentYear} NeuroMinds | Batch 23 | Industry Based AI Software Project
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-[12px] font-medium text-muted-foreground/70">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <button
              onClick={() => setShowSupport(true)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Support
            </button>
          </div>
        </div>
      </footer>

      {/* Support Modal Overlay */}
      {showSupport && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setShowSupport(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-card p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Contact Support
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    We&apos;re here to help
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupport(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need help or have a question? Reach out to our admin and we&apos;ll
                get back to you as soon as possible.
              </p>

              {/* Email Card */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Admin Email
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {adminEmail}
                  </p>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted/60 transition-all cursor-pointer"
                  title="Copy email"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Action Button */}
              <a
                href={`mailto:${adminEmail}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Mail className="h-4 w-4" />
                Send an Email
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
