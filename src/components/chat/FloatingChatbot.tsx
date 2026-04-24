"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  GripHorizontal,
  Loader2,
  MessageCircle,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { askChatbot, type ChatbotSource } from "@/lib/apiClient";
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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
  sources?: ChatbotSource[];
};

const STORAGE_KEY = "predictix.chatbot.launcher.position";
const LAUNCHER_SIZE = 56;
const LAUNCHER_MARGIN = 20;
const PANEL_GAP = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

export default function FloatingChatbot() {
  const pathname = usePathname();

  const [isMounted, setIsMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });
  const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 });

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
  }, [isLoading, isOpen, messages]);

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

  const handleSourceClick = (source: ChatbotSource) => {
    setDraft(source.title);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      createdAt: Date.now(),
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await askChatbot(text);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: response.answer,
        createdAt: Date.now(),
        sources: response.sources ?? [],
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setErrorMessage("Unable to reach the chatbot service. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

    if (!wasDragged) {
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
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-hidden={false}>
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
          <Card className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-sm motion-reduce:transition-none">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/15 p-1.5 text-primary">
                  <MessageCircle className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">PredictiX Assistant</p>
                  <p className="text-xs text-muted-foreground">Ask about assets, tickets, and maintenance</p>
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

            <ScrollArea className="flex-1 px-3 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  Ask a question to start chatting with PredictiX Assistant.
                </div>
              ) : (
                <div className="space-y-3 pb-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                          message.role === "user"
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-muted text-foreground"
                        )}
                      >
                        <p>{message.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            message.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
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
                      </div>
                    </div>
                  ))}

                  {isLoading ? (
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
                await sendMessage();
              }}
            >
              {errorMessage ? (
                <p className="mb-2 text-xs text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask a question..."
                  aria-label="Chatbot draft message"
                  className="h-10"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  aria-label="Send message"
                  disabled={!draft.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      <button
        type="button"
        className={cn(
          "pointer-events-auto absolute flex items-center justify-center rounded-full border border-primary/20 bg-primary text-primary-foreground shadow-xl",
          "transition-transform duration-200 motion-reduce:transition-none",
          isDragging ? "scale-105 cursor-grabbing" : "cursor-grab hover:scale-105"
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
        <MessageCircle className="size-6" />
        <span className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
          <GripHorizontal className="size-3" />
          Drag
        </span>
      </button>
    </div>
  );
}
