"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageCircle,
  SendHorizontal,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { type ChatbotSource } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Position = {
  x: number;
  y: number;
};

type ToolTraceItem = {
  name: string;
  args: Record<string, unknown>;
  result_preview: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
  sources?: ChatbotSource[];
  toolTrace?: ToolTraceItem[];
};

type LocalMessage = ChatMessage;

const STORAGE_KEY = "predictix.chatbot.launcher.position";
const LAUNCHER_SIZE = 56;
const LAUNCHER_MARGIN = 20;
const PANEL_GAP = 12;
const CHATBOT_API_BASE =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";
const CHATBOT_AGENT_ENDPOINT = "/chatbot/agent";
const CHATBOT_FALLBACK_ENDPOINTS = ["/chatbot/ask", "/chatbot", "/chatbot/message"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getCorners(viewportWidth: number, viewportHeight: number): Position[] {
  const maxX = Math.max(LAUNCHER_MARGIN, viewportWidth - LAUNCHER_SIZE - LAUNCHER_MARGIN);
  const maxY = Math.max(LAUNCHER_MARGIN, viewportHeight - LAUNCHER_SIZE - LAUNCHER_MARGIN);
  return [
    { x: LAUNCHER_MARGIN, y: LAUNCHER_MARGIN },
    { x: maxX, y: LAUNCHER_MARGIN },
    { x: LAUNCHER_MARGIN, y: maxY },
    { x: maxX, y: maxY },
  ];
}

function nearestCorner(raw: Position, viewportWidth: number, viewportHeight: number): Position {
  const corners = getCorners(viewportWidth, viewportHeight);
  let best = corners[0];
  let bestDist = Infinity;
  for (const c of corners) {
    const dx = c.x - raw.x;
    const dy = c.y - raw.y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

function getDefaultPosition(viewportWidth: number, viewportHeight: number): Position {
  return {
    x: Math.max(LAUNCHER_MARGIN, viewportWidth - LAUNCHER_SIZE - LAUNCHER_MARGIN),
    y: Math.max(LAUNCHER_MARGIN, viewportHeight - LAUNCHER_SIZE - LAUNCHER_MARGIN),
  };
}

function sanitizePosition(raw: Position, viewportWidth: number, viewportHeight: number): Position {
  return {
    x: clamp(raw.x, LAUNCHER_MARGIN, viewportWidth - LAUNCHER_SIZE - LAUNCHER_MARGIN),
    y: clamp(raw.y, LAUNCHER_MARGIN, viewportHeight - LAUNCHER_SIZE - LAUNCHER_MARGIN),
  };
}

function extractAssistantReply(payload: unknown): string {
  if (!payload) return "";
  if (typeof payload === "string") return payload;

  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const directKeys = ["reply", "response", "answer", "message", "text"];

    for (const key of directKeys) {
      const value = obj[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    if (obj.data && typeof obj.data === "object") {
      const nested = extractAssistantReply(obj.data);
      if (nested) return nested;
    }
  }

  return "";
}

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

const HELPDESK_ROUTE_PREFIXES = ["/help-desk", "/admin/help-desk", "/user/help-desk"];

export default function FloatingChatbot() {
  const pathname = usePathname();
  const isHelpDeskRoute = HELPDESK_ROUTE_PREFIXES.some((p) => pathname?.startsWith(p) ?? false);

  const [isMounted, setIsMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });
  const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 });

  const [expandedTraces, setExpandedTraces] = React.useState<Record<string, boolean>>({});

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const messageEndRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef({
    active: false,
    moved: false,
    pointerId: -1,
    offsetX: 0,
    offsetY: 0,
  });

  const isHiddenRoute = React.useMemo(() => {
    return AUTH_ROUTE_PREFIXES.some((prefix) => {
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    });
  }, [pathname]);



  React.useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setViewport({ width, height });

    const fallbackPosition = getDefaultPosition(width, height);
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      setPosition(fallbackPosition);
      setIsMounted(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Position;
      setPosition(sanitizePosition(parsed, width, height));
    } catch {
      setPosition(fallbackPosition);
    }

    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) {
      return;
    }

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({ width, height });
      setPosition((current) => sanitizePosition(current, width, height));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMounted]);

  React.useEffect(() => {
    if (!isMounted) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [isMounted, position]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSending, isOpen, messages]);

  const panelDimensions = React.useMemo(() => {
    const width = Math.min(380, Math.max(320, viewport.width - 24));
    const height = Math.min(520, Math.max(360, viewport.height - 100));
    return { width, height };
  }, [viewport.height, viewport.width]);

  const panelPosition = React.useMemo(() => {
    if (!isMounted) {
      return { left: 0, top: 0 };
    }

    const openToRight = position.x < viewport.width / 2;

    let left = openToRight
      ? position.x + LAUNCHER_SIZE + PANEL_GAP
      : position.x - panelDimensions.width - PANEL_GAP;

    let top = position.y - panelDimensions.height + LAUNCHER_SIZE;

    left = clamp(left, 12, viewport.width - panelDimensions.width - 12);
    top = clamp(top, 12, viewport.height - panelDimensions.height - 12);

    return { left, top };
  }, [
    isMounted,
    panelDimensions.height,
    panelDimensions.width,
    position.x,
    position.y,
    viewport.height,
    viewport.width,
  ]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || isSending) {
      return;
    }

    setIsSending(true);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      createdAt: Date.now(),
    };

    // Snapshot history BEFORE appending the new user message so we don't
    // duplicate it into the request body.
    const historyForAgent = messages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    setMessages((current) => [...current, userMessage]);
    setDraft("");

    try {
      const token =
        window.localStorage.getItem("token") ||
        window.localStorage.getItem("predictix.access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      let replyText = "";
      let toolTrace: ToolTraceItem[] | undefined;
      let sources: ChatbotSource[] | undefined;
      let lastError = "";

      // 1) Try the agentic endpoint first
      try {
        const response = await fetch(`${CHATBOT_API_BASE}${CHATBOT_AGENT_ENDPOINT}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ question: text, history: historyForAgent }),
        });
        if (response.ok) {
          const payload = await response.json();
          replyText = typeof payload?.answer === "string" ? payload.answer : "";
          if (Array.isArray(payload?.tool_trace)) {
            toolTrace = payload.tool_trace as ToolTraceItem[];
          }
        } else {
          lastError = `${response.status} ${response.statusText}`;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Network error";
      }

      // 2) Fall back to the legacy RAG endpoints if agent didn't reply
      if (!replyText) {
        for (const path of CHATBOT_FALLBACK_ENDPOINTS) {
          try {
            const response = await fetch(`${CHATBOT_API_BASE}${path}`, {
              method: "POST",
              headers,
              body: JSON.stringify({ question: text }),
            });
            if (!response.ok) {
              lastError = `${response.status} ${response.statusText}`;
              continue;
            }
            const payload = await response.json();
            replyText = extractAssistantReply(payload);
            if (Array.isArray((payload as { sources?: unknown })?.sources)) {
              sources = (payload as { sources: ChatbotSource[] }).sources;
            }
            if (replyText) break;
            lastError = "Chat endpoint returned no reply text";
          } catch (error) {
            lastError = error instanceof Error ? error.message : "Network error";
          }
        }
      }

      if (!replyText) {
        throw new Error(lastError || "Unable to get chatbot response");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: replyText,
          createdAt: Date.now(),
          toolTrace,
          sources,
        },
      ]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to connect to chatbot backend";
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Connection error: ${msg}`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSourceClick = (source: ChatbotSource) => {
    setDraft((current) => (current ? `${current} ${source.title}` : source.title));
    inputRef.current?.focus();
  };

  const onLauncherPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    dragRef.current.active = true;
    dragRef.current.moved = false;
    dragRef.current.pointerId = event.pointerId;
    dragRef.current.offsetX = event.clientX - position.x;
    dragRef.current.offsetY = event.clientY - position.y;

    setIsDragging(true);
  };

  const onLauncherPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const nextX = event.clientX - dragRef.current.offsetX;
    const nextY = event.clientY - dragRef.current.offsetY;

    if (!dragRef.current.moved) {
      const distanceX = Math.abs(nextX - position.x);
      const distanceY = Math.abs(nextY - position.y);
      if (distanceX > 2 || distanceY > 2) {
        dragRef.current.moved = true;
      }
    }

    setPosition(sanitizePosition({ x: nextX, y: nextY }, viewport.width, viewport.height));
  };

  const onLauncherPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const target = event.currentTarget;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    const wasDragged = dragRef.current.moved;

    dragRef.current.active = false;
    dragRef.current.pointerId = -1;
    dragRef.current.moved = false;
    setIsDragging(false);

    if (wasDragged) {
      // Snap to nearest corner once the mouse is released.
      setPosition((current) => nearestCorner(current, viewport.width, viewport.height));
    } else {
      setIsOpen((current) => !current);
    }
  };

  const onLauncherPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const target = event.currentTarget;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    dragRef.current.active = false;
    dragRef.current.pointerId = -1;
    dragRef.current.moved = false;
    setIsDragging(false);
  };

  if (!isMounted || isHiddenRoute) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-45" aria-hidden={false}>
      {isOpen ? (
        <div
          className="pointer-events-auto absolute"
          style={{
            left: `${panelPosition.left}px`,
            top: `${panelPosition.top}px`,
            width: `${panelDimensions.width}px`,
            height: `${panelDimensions.height}px`,
          }}
        >
          <Card className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-md motion-reduce:transition-none">
            <div className="relative flex items-center justify-between border-b border-border/60 px-4 py-3 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-sky-500/10 dark:from-violet-500/15 dark:via-fuchsia-500/10 dark:to-sky-500/15">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gradient-to-br from-violet-500 to-sky-500 p-1.5 text-white shadow-sm">
                  <MessageCircle className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    PredictiX Assistant
                    <Sparkles className="size-3 text-violet-500" />
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMessages([])}
                  aria-label="Clear local messages"
                >
                  <Trash2 className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Collapse chatbot"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 px-3 py-4 bg-gradient-to-b from-transparent to-violet-50/30 dark:to-violet-950/20">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                  <div className="rounded-full bg-gradient-to-br from-violet-500/15 to-sky-500/15 p-3">
                    <Sparkles className="size-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">How can I help?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask about assets, tickets, or maintenance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pb-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                          message.role === "user"
                            ? "rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                            : "rounded-bl-md border border-border/70 bg-card text-foreground dark:bg-slate-800/80"
                        )}
                      >
                        <p>{message.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {message.role === "assistant" && message.sources && message.sources.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {message.sources.map((source, index) => (
                              <button
                                key={`${message.id}-${source.title}-${index}`}
                                type="button"
                                className="rounded-md"
                                onClick={() => handleSourceClick(source)}
                                aria-label={`Use source ${source.title}`}
                              >
                                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                  {source.title} - {source.category}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {message.role === "assistant" && message.toolTrace && message.toolTrace.length > 0 ? (
                          <div className="mt-2 border-t border-border/40 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedTraces((prev) => ({
                                  ...prev,
                                  [message.id]: !prev[message.id],
                                }))
                              }
                              className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                            >
                              {expandedTraces[message.id] ? (
                                <ChevronDown className="size-3" />
                              ) : (
                                <ChevronRight className="size-3" />
                              )}
                              <Wrench className="size-3" />
                              {message.toolTrace.length} tool{message.toolTrace.length === 1 ? "" : "s"} used
                            </button>
                            {expandedTraces[message.id] ? (
                              <ul className="mt-1.5 space-y-1.5 pl-3">
                                {message.toolTrace.map((step, i) => (
                                  <li
                                    key={`${message.id}-tool-${i}`}
                                    className="rounded-md bg-muted/50 dark:bg-slate-900/50 px-2 py-1 text-[10px] font-mono"
                                  >
                                    <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold">
                                      <span>→</span>
                                      <span>{step.name}</span>
                                      <span className="text-muted-foreground font-normal">
                                        ({Object.keys(step.args || {}).length
                                          ? Object.entries(step.args)
                                              .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                                              .join(", ")
                                          : ""}
                                        )
                                      </span>
                                    </div>
                                    <div className="mt-0.5 text-muted-foreground break-all">
                                      {step.result_preview}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {isSending ? (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-foreground shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div ref={messageEndRef} />
                </div>
              )}
            </ScrollArea>

            <form
              className="border-t border-border/60 p-3"
              onSubmit={async (event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask a question..."
                  aria-label="Chatbot draft message"
                  className="h-10"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  aria-label="Send chatbot message"
                  disabled={!draft.trim() || isSending}
                >
                  {isSending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      <button
        type="button"
        className={cn(
          "pointer-events-auto group absolute flex items-center justify-center rounded-full border border-white/20 text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]",
          "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500",
          "motion-reduce:transition-none",
          isDragging
            ? "scale-105 cursor-grabbing transition-transform duration-100"
            : isHelpDeskRoute
            ? "cursor-pointer hover:scale-105 transition-all duration-300 ease-out"
            : "cursor-grab hover:scale-105 transition-all duration-300 ease-out"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${LAUNCHER_SIZE}px`,
          height: `${LAUNCHER_SIZE}px`,
        }}
        onPointerDown={onLauncherPointerDown}
        onPointerMove={onLauncherPointerMove}
        onPointerUp={onLauncherPointerUp}
        onPointerCancel={onLauncherPointerCancel}
        aria-label={isOpen ? "Collapse chatbot" : "Open chatbot"}
      >
        <span className="sr-only">Chatbot launcher</span>
        <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-br from-violet-400/40 to-sky-400/40 blur-md opacity-60" />
        <MessageCircle className="relative size-6 drop-shadow-sm" />
        <Sparkles className="absolute -top-1 -right-1 size-3 text-white/90 drop-shadow" />
      </button>
    </div>
  );
}
