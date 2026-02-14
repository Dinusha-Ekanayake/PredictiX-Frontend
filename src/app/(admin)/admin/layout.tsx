import AdminHeader from "@/components/navigation/AdminHeader";

/**
 * Shared layout for every admin route (/admin/*).
 * Header manages its own gradient + scroll state.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminHeader />

      {/* Page content */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
