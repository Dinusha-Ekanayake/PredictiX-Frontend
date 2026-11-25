import { notFound } from "next/navigation";
import PredictiXLoader from "@/components/loading/PredictiXLoader";

// Rendered per request so notFound() returns a real 404 status in production
// rather than a prerendered not-found page served as 200.
export const dynamic = "force-dynamic";

// Dev-only visual check for the loading spinner, not a real product page.
// 404s in production so it's never a live, unauthenticated, unlinked route.
export default function TestLoaderPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <PredictiXLoader label="Testing loader…" />
    </main>
  );
}
