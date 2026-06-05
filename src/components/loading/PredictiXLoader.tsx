"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
};

export default function PredictiXLoader({
  label = "PredictiX : AI-Powered Asset Management",
  className,
}: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative flex h-[280px] w-full items-center justify-center">
        
        {/* Deep, rich pulsating glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-64 w-64 rounded-full bg-blue-500/20 blur-[70px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute h-56 w-56 rounded-full bg-purple-500/20 blur-[50px] animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
        </div>

        {/* The Glass Plate holding the logo */}
        <div className="relative z-10 flex items-center justify-center">
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
        className="relative mt-8 flex flex-col items-center text-center space-y-4"
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
