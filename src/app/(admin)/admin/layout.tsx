import AdminNavbar from "@/components/navigation/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />
      <main className="mx-auto max-w-7xl px-4 pb-10">{children}</main>
    </div>
  );
}
