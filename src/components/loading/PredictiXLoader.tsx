"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  /**
   * Real completion percentage (0-100), when the caller actually knows it.
   * If provided, the bar becomes determinate instead of the default
   * indeterminate sweep. Purely additive — existing callers that don't pass
   * it keep the original animated-bar behaviour.
   */
  progress?: number;
  /**
   * Ordered list of stage labels (e.g. ["Authenticating…", "Loading data…"]).
   * When provided alongside `progress`, the current stage is derived from
   * progress and shown instead of the static `label`.
   */
  stages?: string[];
};

export default function PredictiXLoader({
  label = "PredictiX : AI-Powered Asset Management",
  className,
  progress,
  stages,
}: Props) {
  const isDeterminate = typeof progress === "number" && Number.isFinite(progress);
  const clampedProgress = isDeterminate ? Math.min(100, Math.max(0, progress!)) : null;

  const currentStageLabel =
    isDeterminate && stages && stages.length > 0
      ? stages[Math.min(stages.length - 1, Math.floor((clampedProgress! / 100) * stages.length))]
      : label;

  return (
    <div
      data-predictix-loader="true"
      className={cn("flex flex-col items-center justify-center", className)}
      style={{ animation: "predictix-enter 400ms ease-out both" }}
    >
      <div className="relative flex h-40 w-40 items-center justify-center">
        {/* Soft ambient glow */}
        <div
          className="absolute inset-0 rounded-full bg-sky-500/15 blur-3xl dark:bg-sky-400/15"
          style={{ animation: "predictix-glow 2.4s ease-in-out infinite" }}
        />

        {/* Logo plate */}
        <div
          className="relative flex h-32 w-32 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900"
          style={{ animation: "predictix-pulse 1.8s ease-in-out infinite" }}
        >
          <Image
            src="/logo/predictix-icon.svg"
            alt="PredictiX"
            width={72}
            height={72}
            priority
          />
        </div>
      </div>

      <p className="mt-8 min-h-[1.5rem] text-base font-medium tracking-wide text-slate-500 dark:text-slate-400">
        {currentStageLabel}
      </p>

      <div className="relative mt-6 h-2 w-72 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        {isDeterminate ? (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-[width] duration-300 ease-out dark:bg-slate-200"
            style={{ width: `${clampedProgress}%` }}
          />
        ) : (
          <div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-slate-900 dark:bg-slate-200"
            style={{ animation: "predictix-progress 1.4s ease-in-out infinite" }}
          />
        )}
      </div>
    </div>
  );
}
