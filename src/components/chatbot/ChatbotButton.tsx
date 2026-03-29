"use client";

import * as React from "react";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatbotPanel from "./ChatbotPanel";

export default function ChatbotButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel — animated in/out */}
      <div
        className={cn(
          "origin-bottom-right transition-all duration-300",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <ChatbotPanel onClose={() => setOpen(false)} />
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={cn(
          "grid place-items-center h-14 w-14 rounded-full",
          "bg-gradient-to-br from-violet-600 to-indigo-600",
          "shadow-[0_12px_30px_-10px_rgba(99,102,241,0.75)]",
          "ring-2 ring-white/30 dark:ring-white/10",
          "transition-all duration-300 hover:scale-105 active:scale-95",
          open && "rotate-[360deg]"
        )}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Bot className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
