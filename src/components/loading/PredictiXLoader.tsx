"use client";

import * as React from "react";
import Image from "next/image";
import { Activity, Cpu, Package, Ticket, Wrench, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

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
  const radius = 175; // Increased radius to accommodate the larger glass plate
  const step = 360 / ICONS.length;

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative flex h-[380px] w-[380px] items-center justify-center">
        
        {/* Deep, rich pulsating glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-72 w-72 rounded-full bg-blue-500/20 blur-[70px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute h-64 w-64 rounded-full bg-purple-500/20 blur-[50px] animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
        </div>

        {/* ORBIT RING */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: "orbit-ring 14s linear infinite", zIndex: 0 }}
        >
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

        {/* The Glass Plate holding the logo */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div
            className="relative"
            style={{ animation: "logo-float 3s ease-in-out infinite" }}
          >
            {/* Shadow beneath the plate */}
            <div
              className="absolute inset-0 rounded-[32px]"
              style={{
                filter: "blur(24px)",
                opacity: 0.4,
                transform: "translateY(30px) scale(0.9)",
                background: "radial-gradient(closest-side, rgba(0,0,0,0.5), transparent)",
              }}
            />

            {/* Premium Glass Plate */}
            <div className="relative flex h-36 w-36 items-center justify-center rounded-[32px] border border-white/50 bg-white/50 shadow-2xl backdrop-blur-2xl ring-1 ring-slate-200/50 dark:border-slate-700/50 dark:bg-slate-900/50 dark:ring-slate-800/50 transition-all duration-500">
              {/* Inner subtle glow */}
              <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/90 via-white/10 to-transparent opacity-80 dark:from-white/10 dark:via-transparent dark:opacity-100" />
              
              <Image
                src="/logo/predictix-icon.svg"
                alt="PredictiX"
                width={88}
                height={88}
                priority
                className="drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Label and Shimmering Progress Bar */}
      <div
        className="relative mt-2 flex flex-col items-center text-center space-y-4"
        style={{ animation: "title-rise 800ms ease-out both" }}
      >
        <p className="text-[13px] font-bold tracking-[0.2em] text-slate-600 dark:text-slate-300 uppercase">
          {label}
        </p>

        {/* Elegant loading bar */}
        <div className="relative h-1 w-56 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            style={{ animation: "title-shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
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
    sky: "text-sky-600 ring-sky-300/50 dark:text-sky-400 dark:ring-sky-900/60 shadow-sky-500/20",
    violet: "text-violet-600 ring-violet-300/50 dark:text-violet-400 dark:ring-violet-900/60 shadow-violet-500/20",
    emerald: "text-emerald-600 ring-emerald-300/50 dark:text-emerald-400 dark:ring-emerald-900/60 shadow-emerald-500/20",
    amber: "text-amber-600 ring-amber-300/50 dark:text-amber-400 dark:ring-amber-900/60 shadow-amber-500/20",
    rose: "text-rose-600 ring-rose-300/50 dark:text-rose-400 dark:ring-rose-900/60 shadow-rose-500/20",
    indigo: "text-indigo-600 ring-indigo-300/50 dark:text-indigo-400 dark:ring-indigo-900/60 shadow-indigo-500/20",
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
          animation: "explode-to-orbit 1.6s cubic-bezier(.22,.9,.28,1) both",
          animationDelay: `${delayMs}ms`,
        }}
      >
        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full ring-1 shadow-xl backdrop-blur-xl transition-all duration-500 hover:scale-110",
            "bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-slate-700/50",
            " [--bubble-hi:rgba(255,255,255,0.95)]",
            " [--bubble-mid:rgba(255,255,255,0.4)]",
            " [--bubble-lo:rgba(255,255,255,0.1)]",
            " dark:[--bubble-hi:rgba(255,255,255,0.2)]",
            " dark:[--bubble-mid:rgba(255,255,255,0.05)]",
            " dark:[--bubble-lo:rgba(0,0,0,0.4)]",
            colorMap[color]
          )}
          style={{
            background:
              "radial-gradient(circle at 30% 25%, var(--bubble-hi), var(--bubble-mid) 45%, var(--bubble-lo))",
          }}
        >
          {/* Enhanced glass gradient */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-70 dark:from-white/20" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

