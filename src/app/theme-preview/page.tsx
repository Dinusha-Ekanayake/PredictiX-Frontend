import * as React from "react";
import {
  Boxes, Ticket, Activity, Flame, ShieldCheck, AlertTriangle,
  CheckCircle, RefreshCw, Plus,
} from "lucide-react";

/**
 * Standalone theme preview (/theme-preview).
 * Renders the same dashboard snippet under several candidate DARK palettes so
 * you can compare and pick one. Each palette is scoped via CSS variables on its
 * own panel — this page is a preview only and does NOT change the app theme.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * Generate a coherent dark palette from a base hue.
 *  - `mono` drops all chroma (neutral grey/black).
 *  - `bgC` controls how much the surfaces are tinted by the hue.
 *  - `primary` / `primaryFg` override the accent button colors.
 */
function darkTheme(
  hue: number,
  opts: { mono?: boolean; bgC?: number; primary: string; primaryFg: string } = { primary: "", primaryFg: "" },
): Vars {
  const c = opts.mono ? 0 : (opts.bgC ?? 0.02);
  const fgC = opts.mono ? 0 : 0.01;
  return {
    "--background": `oklch(0.145 ${c} ${hue})`,
    "--foreground": `oklch(0.985 ${fgC} ${hue})`,
    "--card": `oklch(0.185 ${c} ${hue})`,
    "--card-foreground": `oklch(0.985 ${fgC} ${hue})`,
    "--primary": opts.primary,
    "--primary-foreground": opts.primaryFg,
    "--secondary": `oklch(0.26 ${c} ${hue})`,
    "--secondary-foreground": `oklch(0.985 ${fgC} ${hue})`,
    "--muted": `oklch(0.24 ${c} ${hue})`,
    "--muted-foreground": `oklch(0.72 ${opts.mono ? 0 : 0.03} ${hue})`,
    "--accent": `oklch(0.30 ${opts.mono ? 0 : Math.min(c * 2.2, 0.06)} ${hue})`,
    "--border": `oklch(0.29 ${c} ${hue})`,
  };
}

const PALETTES: { name: string; hint: string; vars: Vars }[] = [
  {
    name: "Slate / Blue",
    hint: "current",
    vars: {
      "--background": "oklch(0.129 0.042 264.695)",
      "--foreground": "oklch(0.984 0.003 247.858)",
      "--card": "oklch(0.18 0.04 265)",
      "--card-foreground": "oklch(0.984 0.003 247.858)",
      "--primary": "oklch(0.62 0.19 260)",
      "--primary-foreground": "oklch(0.984 0.003 247.858)",
      "--secondary": "oklch(0.28 0.04 260)",
      "--secondary-foreground": "oklch(0.984 0.003 247.858)",
      "--muted": "oklch(0.25 0.03 260)",
      "--muted-foreground": "oklch(0.704 0.04 256)",
      "--accent": "oklch(0.279 0.041 260)",
      "--border": "oklch(0.30 0.03 260)",
    },
  },
  { name: "Emerald Black", hint: "tech green", vars: darkTheme(165, { primary: "oklch(0.72 0.15 162)", primaryFg: "oklch(0.14 0.02 165)" }) },
  { name: "Zinc / Neutral Black", hint: "monochrome", vars: darkTheme(0, { mono: true, primary: "oklch(0.92 0 0)", primaryFg: "oklch(0.18 0 0)" }) },
  {
    name: "True Black (OLED)",
    hint: "pure black",
    vars: {
      ...darkTheme(0, { mono: true, primary: "oklch(0.985 0 0)", primaryFg: "oklch(0.1 0 0)" }),
      "--background": "oklch(0.03 0 0)",
      "--card": "oklch(0.13 0 0)",
      "--border": "oklch(0.24 0 0)",
    },
  },
  { name: "Rose Noir", hint: "soft pink", vars: darkTheme(12, { bgC: 0.02, primary: "oklch(0.7 0.18 15)", primaryFg: "oklch(0.14 0.02 12)" }) },
  {
    name: "Midnight",
    hint: "deep indigo",
    vars: {
      ...darkTheme(275, { bgC: 0.045, primary: "oklch(0.6 0.18 272)", primaryFg: "oklch(0.985 0.01 275)" }),
      "--background": "oklch(0.115 0.05 275)",
      "--card": "oklch(0.165 0.05 275)",
    },
  },
  { name: "Violet Dusk", hint: "purple", vars: darkTheme(300, { bgC: 0.03, primary: "oklch(0.66 0.2 300)", primaryFg: "oklch(0.99 0.01 300)" }) },
  { name: "Amber Ember", hint: "warm gold", vars: darkTheme(70, { bgC: 0.015, primary: "oklch(0.78 0.15 75)", primaryFg: "oklch(0.16 0.02 70)" }) },
  { name: "Crimson", hint: "bold red", vars: darkTheme(25, { bgC: 0.02, primary: "oklch(0.6 0.22 25)", primaryFg: "oklch(0.99 0.01 25)" }) },
  { name: "Cyan / Teal", hint: "cool aqua", vars: darkTheme(200, { primary: "oklch(0.72 0.13 195)", primaryFg: "oklch(0.14 0.02 200)" }) },
];

function PreviewCard({ name, hint, vars }: { name: string; hint: string; vars: Vars }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span
          className="h-3 w-3 rounded-full border"
          style={{ background: "var(--primary)", borderColor: "var(--border)", ...vars }}
        />
        <span className="text-sm font-semibold text-slate-100">{name}</span>
        <span className="text-[11px] text-slate-500">· {hint}</span>
      </div>

      {/* Scoped palette panel */}
      <div style={vars} className="rounded-2xl border p-4">
        <div
          className="space-y-4 rounded-xl"
          style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Operations Dashboard</h3>
              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                Real-time asset health
              </p>
            </div>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Assets", value: "1,000", icon: Boxes },
              { label: "Tickets", value: "200", icon: Ticket },
              { label: "Health", value: "68%", icon: Activity },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-xl border p-2.5"
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
              >
                <div
                  className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{ background: "color-mix(in oklch, var(--primary) 20%, transparent)", color: "var(--primary)" }}
                >
                  <k.icon className="h-3.5 w-3.5" />
                </div>
                <div className="text-base font-bold">{k.value}</div>
                <div className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button className="rounded-lg px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Primary</button>
            <button className="rounded-lg border px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Outline</button>
            <button className="rounded-lg px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>Secondary</button>
          </div>

          {/* Ticket row with status badges (semantic colors stay fixed) */}
          <div
            className="rounded-xl border p-2.5"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md px-1.5 py-0.5 text-[9px] font-mono" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>T-0142</span>
              <Badge color="#ef4444" label="High" icon={AlertTriangle} />
              <Badge color="#f59e0b" label="In progress" icon={RefreshCw} />
              <Badge color="#10b981" label="Healthy" icon={CheckCircle} />
            </div>
            <p className="mt-1.5 text-[13px] font-semibold">Hydraulic seal — Forklift FL-22</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--muted)" }}>
                <div className="h-full rounded-full" style={{ width: "72%", background: "var(--primary)" }} />
              </div>
              <span className="text-[9px] font-semibold" style={{ color: "var(--muted-foreground)" }}>72%</span>
            </div>
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
            <Pill icon={Flame} label="12 critical" tone="#ef4444" />
            <Pill icon={Ticket} label="37 open" tone="#f59e0b" />
            <Pill icon={ShieldCheck} label="604 healthy" tone="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ color, label, icon: Icon }: { color: string; label: string; icon: React.ElementType }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
      style={{ background: `color-mix(in oklch, ${color} 18%, transparent)`, color }}
    >
      <Icon className="h-2.5 w-2.5" /> {label}
    </span>
  );
}

function Pill({ icon: Icon, label, tone }: { icon: React.ElementType; label: string; tone: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-semibold"
      style={{ borderColor: `color-mix(in oklch, ${tone} 35%, transparent)`, color: tone, background: `color-mix(in oklch, ${tone} 12%, transparent)` }}
    >
      <Icon className="h-2.5 w-2.5" /> {label}
    </span>
  );
}

export default function ThemePreviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-2">
        <h1 className="text-2xl font-bold">Dark theme options</h1>
        <p className="text-sm text-slate-400">
          The same dashboard snippet rendered under {PALETTES.length} dark palettes. Each panel scopes its own
          colors — this page is a preview only and doesn&apos;t change the app theme.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {PALETTES.map((p) => (
          <PreviewCard key={p.name} name={p.name} hint={p.hint} vars={p.vars} />
        ))}
      </div>
    </main>
  );
}
