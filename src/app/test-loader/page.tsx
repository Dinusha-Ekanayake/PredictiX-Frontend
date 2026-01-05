import PredictiXLoader from "@/components/loading/PredictiXLoader";

export default function TestLoaderPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <PredictiXLoader label="Testing loader…" />
    </main>
  );
}
