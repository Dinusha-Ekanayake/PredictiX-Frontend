import { Suspense } from "react";
import AdminNavbar from "@/components/navigation/AdminNavbar";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import AuthGuard from "@/components/auth/AuthGuard";
import AmbientBackground from "@/components/background/AmbientBackground";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="ADMIN">
      {/* Transparent shell so the ambient particle field shows through in both themes */}
      <div className="relative min-h-screen">
        <AmbientBackground />
        <AdminNavbar />
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">
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
