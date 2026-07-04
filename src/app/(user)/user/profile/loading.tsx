import PredictiXLoader from "@/components/loading/PredictiXLoader";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <PredictiXLoader label="Loading profile…" />
    </div>
  );
}
