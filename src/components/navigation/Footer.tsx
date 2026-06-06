import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
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
          <Link href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
