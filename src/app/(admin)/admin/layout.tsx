import { Suspense } from "react";
import AdminNavbar from "@/components/navigation/AdminNavbar";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AdminNavbar />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Suspense fallback={
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
              <PredictiXLoader label="Loading…" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </AuthGuard>
  );
}
