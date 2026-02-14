import AdminHeader from "@/components/navigation/AdminHeader";
import AdminNavigation from "@/components/navigation/AdminNavigation";

/**
 * Shared layout for every admin route (/admin/*).
 * Purple-gradient header + nav, then page content on bg-background.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Unified purple gradient banner for header + nav */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-[#1a0e3e] via-[#2d1566] to-[#1e1050]">
        <AdminHeader />
        <AdminNavigation />
      </div>

      {/* Page content */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
