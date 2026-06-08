import { Suspense } from "react";
import UserNavbar from "@/components/navigation/UserNavbar";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import AuthGuard from "@/components/auth/AuthGuard";
import AmbientBackground from "@/components/background/AmbientBackground";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="USER">
      {/* Transparent shell so the ambient particle field shows through in both themes */}
      <div className="relative min-h-screen">
        <AmbientBackground />
        <UserNavbar />
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
