"use client";

import * as React from "react";
import { Bot, Send, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL;

function makeWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "Hi! I'm the PredictiX AI assistant. Ask me anything about your assets, tickets, or maintenance schedules.",
    timestamp: new Date(),
  };
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type Props = {
  onClose: () => void;
};

export default function ChatbotPanel({ onClose }: Props) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    makeWelcomeMessage(),
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function clearChat() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setMessages([makeWelcomeMessage()]);
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    if (!CHATBOT_API_URL) {
      const cfgErrorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "The chatbot service is not configured. Please set NEXT_PUBLIC_CHATBOT_API_URL in your environment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, cfgErrorMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: messages
            .filter((m) => m.id !== "welcome")
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get AI response: HTTP ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json() as { reply: string };
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply ?? "Sorry, I couldn't understand that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      // Ignore AbortError — the request was intentionally cancelled by clearChat
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting to the server. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        "w-[360px] h-[520px]",
        "rounded-3xl overflow-hidden",
        "border border-slate-200/60 dark:border-slate-800/60",
        "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl",
        "shadow-[0_24px_60px_-16px_rgba(15,23,42,0.40)] dark:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.70)]",
        "ring-1 ring-white/30 dark:ring-white/10"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_6px_16px_-6px_rgba(99,102,241,0.7)]">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">PredictiX AI</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? "Thinking…" : "Online"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearChat}
            disabled={isLoading}
            title="Clear chat"
            aria-label="Clear chat"
            className="grid place-items-center h-7 w-7 rounded-xl text-muted-foreground hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close chat"
            aria-label="Close chat"
            className="grid place-items-center h-7 w-7 rounded-xl text-muted-foreground hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md shadow-[0_4px_12px_-4px_rgba(99,102,241,0.5)]"
                    : "bg-slate-100 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 rounded-bl-md"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-100 dark:bg-slate-800/70 rounded-2xl rounded-bl-md px-4 py-2.5">
                <div className="flex gap-1 items-center h-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 px-3 py-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything…"
          className="flex-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border-transparent focus-visible:border-violet-400 dark:focus-visible:border-violet-500 focus-visible:ring-0 text-sm"
          disabled={isLoading}
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="rounded-xl h-9 w-9 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-[0_4px_12px_-4px_rgba(99,102,241,0.6)] transition-all disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
