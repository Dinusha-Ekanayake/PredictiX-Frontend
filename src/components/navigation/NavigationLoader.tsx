"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Activity, Cpu, Package, Ticket, Wrench, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
};

const ICONS = [
  { Icon: Cpu, color: "sky" },
  { Icon: Ticket, color: "violet" },
  { Icon: Wrench, color: "emerald" },
  { Icon: Package, color: "amber" },
  { Icon: Activity, color: "rose" },
  { Icon: Sparkles, color: "indigo" },
] as const;

type OrbiterColor = (typeof ICONS)[number]["color"];

export default function PredictiXLoader({
  label = "PredictiX : AI-Powered Asset Management",
  className,
}: Props) {
  const radius = 148;
  const step = 360 / ICONS.length;

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative h-85 w-85">
        {/* ORBIT RING */}
        <div className="absolute inset-0" style={{ animation: "orbit-ring 12s linear infinite" }}>
          {ICONS.map(({ Icon, color }, i) => (
            <Orbiter
              key={i}
              angleDeg={i * step}
              radiusPx={radius}
              delayMs={i * 90}
              color={color}
            >
              <Icon className="h-6 w-6" />
            </Orbiter>
          ))}
        </div>

        {/* CENTER LOGO */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative" style={{ animation: "logo-float 2.6s ease-in-out infinite" }}>
            <div
              className="absolute inset-0 rounded-[28px]"
              style={{
                filter: "blur(18px)",
                opacity: 0.28,
                transform: "translateY(30px) scale(0.9)",
                background:
                  "radial-gradient(closest-side, rgba(0,0,0,0.45), rgba(0,0,0,0))",
              }}
            />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-[28px] border bg-white shadow-md ring-1 ring-slate-200 dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
              <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-linear-to-br from-white/60 via-transparent to-transparent dark:from-white/10" />
              <Image
                src="/logo/predictix-icon.svg"
                alt="PredictiX"
                width={84}
                height={84}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* LABEL */}
      <div className="relative mt-2 text-center" style={{ animation: "title-rise 650ms ease-out both" }}>
        <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {label}
        </p>

        <div className="pointer-events-none absolute left-1/2 top-full mt-2 h-0.5 w-52 -translate-x-1/2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
          <div
            className="h-full w-1/3 rounded-full bg-slate-400/40 dark:bg-slate-500/30"
            style={{ animation: "title-shimmer 1.6s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}

function Orbiter({
  angleDeg,
  radiusPx,
  delayMs,
  color,
  children,
}: {
  angleDeg: number;
  radiusPx: number;
  delayMs: number;
  color: OrbiterColor;
  children: React.ReactNode;
}) {
  const colorMap: Record<OrbiterColor, string> = {
    sky: "text-sky-600 ring-sky-200 dark:text-sky-400 dark:ring-sky-900/40",
    violet:
      "text-violet-600 ring-violet-200 dark:text-violet-400 dark:ring-violet-900/40",
    emerald:
      "text-emerald-600 ring-emerald-200 dark:text-emerald-400 dark:ring-emerald-900/40",
    amber:
      "text-amber-600 ring-amber-200 dark:text-amber-400 dark:ring-amber-900/40",
    rose: "text-rose-600 ring-rose-200 dark:text-rose-400 dark:ring-rose-900/40",
    indigo:
      "text-indigo-600 ring-indigo-200 dark:text-indigo-400 dark:ring-indigo-900/40",
  };

  const orbitVars = {
    ["--angle" as string]: `${angleDeg}deg`,
    ["--radius" as string]: `${radiusPx}px`,
  } as CSSProperties;

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div
        style={{
          ...orbitVars,
          animation: "explode-to-orbit 1.45s cubic-bezier(.22,.9,.28,1) both",
          animationDelay: `${delayMs}ms`,
        }}
      >
        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full ring-1 shadow-md",
            "bg-white dark:bg-white/5",
            " [--bubble-hi:rgba(255,255,255,0.98)]",
            " [--bubble-mid:rgba(255,255,255,0.72)]",
            " [--bubble-lo:rgba(248,250,252,0.95)]",
            " dark:[--bubble-hi:rgba(255,255,255,0.14)]",
            " dark:[--bubble-mid:rgba(255,255,255,0.06)]",
            " dark:[--bubble-lo:rgba(0,0,0,0.35)]",
            colorMap[color]
          )}
          style={{
            background:
              "radial-gradient(circle at 30% 25%, var(--bubble-hi), var(--bubble-mid) 45%, var(--bubble-lo))",
          }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-white/70 via-transparent to-transparent opacity-60 dark:from-white/10" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
