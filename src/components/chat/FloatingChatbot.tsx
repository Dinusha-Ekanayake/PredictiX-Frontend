"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
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

const CHATBOT_API_BASE =
  "/api/proxy";
const CHATBOT_AGENT_ENDPOINT = "/chatbot/agent";
const CHATBOT_FALLBACK_ENDPOINTS = ["/chatbot/ask", "/chatbot", "/chatbot/message"];

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
  const [isLoaderPresent, setIsLoaderPresent] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null);

  const [expandedTraces, setExpandedTraces] = React.useState<Record<string, boolean>>({});

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const messageEndRef = React.useRef<HTMLDivElement | null>(null);

  const isHiddenRoute = React.useMemo(() => {
    return AUTH_ROUTE_PREFIXES.some((prefix) => {
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    });
  }, [pathname]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;
    
    const checkLoader = () => {
      setIsLoaderPresent(!!document.querySelector('[data-predictix-loader="true"]'));
    };
    
    checkLoader();
    const observer = new MutationObserver(checkLoader);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, [isMounted]);

  React.useEffect(() => {
    if (!isOpen) return;
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
    if (!isOpen) return;
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSending, isOpen, messages]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      createdAt: Date.now(),
    };

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
      const isNetworkError =
        error instanceof Error &&
        (error.message.toLowerCase().includes("fetch") ||
         error.message.toLowerCase().includes("network") ||
         error.message.toLowerCase().includes("failed to connect") ||
         error.message.toLowerCase().includes("cors"));

      const friendlyMessage = isNetworkError
        ? "I am sorry, but I am unable to reach the PredictiX service right now. Please verify that the backend server is running and try again."
        : `An unexpected issue occurred: ${error instanceof Error ? error.message : String(error)}`;

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: friendlyMessage,
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

  if (!isMounted || isHiddenRoute || isLoaderPresent) {
    return null;
  }

  return (
    <div id="predictix-chatbot" className="pointer-events-none fixed inset-0 z-50" aria-hidden={false}>
      {isOpen ? (
        <div className="pointer-events-auto absolute bottom-24 right-6 w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)]">
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

            <ScrollArea type="always" className="flex-1 px-3 py-4 bg-gradient-to-b from-transparent to-violet-50/30 dark:to-violet-950/20">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center pb-12">
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
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <div className="mt-1.5 flex items-center justify-between gap-4">
                          <span
                            className={cn(
                              "text-[10px]",
                              message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.role === "assistant" && (
                            <button
                              type="button"
                              onClick={() => {
                                void navigator.clipboard.writeText(message.text);
                                setCopiedMessageId(message.id);
                                setTimeout(() => setCopiedMessageId(null), 2000);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors outline-none focus:ring-0"
                              title="Copy message to clipboard"
                            >
                              {copiedMessageId === message.id ? (
                                <>
                                  <Check className="size-3 text-emerald-500" />
                                  <span className="text-emerald-500 font-medium">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

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
          "pointer-events-auto group absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]",
          "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500",
          "cursor-pointer hover:scale-105 transition-all duration-300 ease-out",
          isHelpDeskRoute && "animate-pulse" // Just a small bonus
        )}
        onClick={() => setIsOpen((current) => !current)}
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
