"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PredictiXLoader from "@/components/loading/PredictiXLoader";

type NavStartFn = () => void;

declare global {
  interface Window {
    __predictixNavStart?: NavStartFn;
  }
}

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [active, setActive] = React.useState(false);
  const fallbackTimerRef = React.useRef<number | null>(null);
  const prevUrlRef = React.useRef<string>("");

  const urlSig = React.useMemo(() => {
    const sp = searchParams?.toString() ?? "";
    return sp ? `${pathname}?${sp}` : pathname;
  }, [pathname, searchParams]);

  const stop = React.useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setActive(false);
  }, []);

  const start = React.useCallback(() => {
    setActive((prev) => {
      if (prev) return prev;
      return true;
    });

    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = window.setTimeout(() => {
      setActive(false);
      fallbackTimerRef.current = null;
    }, 7000);
  }, []);

  // expose to programmatic navigation
  React.useEffect(() => {
    window.__predictixNavStart = start;
    return () => {
      if (window.__predictixNavStart === start) {
        delete window.__predictixNavStart;
      }
    };
  }, [start]);

  // stop loader when URL changes
  React.useEffect(() => {
    if (!prevUrlRef.current) {
      prevUrlRef.current = urlSig;
      return;
    }
    if (prevUrlRef.current !== urlSig) {
      prevUrlRef.current = urlSig;

      // minimum display to avoid flicker
      const t = window.setTimeout(() => stop(), 200);
      return () => window.clearTimeout(t);
    }
  }, [urlSig, stop]);

  // start loader on internal link click (capture)
  React.useEffect(() => {
    function isModifiedClick(e: MouseEvent) {
      return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    }

    function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
      let node: HTMLElement | null = target as HTMLElement | null;
      while (node) {
        if (node.tagName === "A") return node as HTMLAnchorElement;
        node = node.parentElement;
      }
      return null;
    }

    function onClickCapture(e: MouseEvent) {
      if (isModifiedClick(e)) return;

      const a = findAnchor(e.target);
      if (!a) return;

      const href = a.getAttribute("href") || "";
      if (!href) return;

      // ignore downloads/new tab/same-page hash/mail/tel
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      // ignore external origins
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;

        const current = window.location.pathname + window.location.search;
        const next = url.pathname + url.search;
        if (current === next) return;

        start();
      } catch {
        // if parsing fails, do nothing
      }
    }

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [start]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-9999">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md dark:bg-slate-950/70" />

      {/* Subtle blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-56 -left-56 h-225 w-225 rounded-full bg-sky-200/50 blur-[160px] float-slow-1 dark:hidden" />
        <div className="absolute top-1/3 left-1/2 h-225 w-225 -translate-x-1/2 rounded-full bg-violet-200/40 blur-[180px] float-slow-2 dark:hidden" />
        <div className="hidden dark:block absolute -top-56 -left-56 h-225 w-225 rounded-full bg-sky-500/10 blur-[180px] float-slow-1" />
        <div className="hidden dark:block absolute top-1/3 left-1/2 h-225 w-225 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[200px] float-slow-2" />
      </div>

      {/* Loader */}
      <div className="relative flex h-full w-full items-center justify-center px-4">
        <PredictiXLoader label="PredictiX : AI-Powered Asset Management" />
      </div>
    </div>
  );
}
