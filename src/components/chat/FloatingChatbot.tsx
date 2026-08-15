"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  SendHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActionButton = {
  label: string;
  path: string;
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
  actionButtons?: ActionButton[];
  toolTrace?: ToolTraceItem[];
  widgetType?: string;
  widgetData?: any;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const CHATBOT_API_BASE =
  process.env.NEXT_PUBLIC_CHATBOT_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

function CopyActionButton({ label, textToCopy }: { label: string; textToCopy: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/60 dark:border-violet-600/60 bg-violet-50 dark:bg-violet-900/40 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-800/60 transition-all duration-200 hover:shadow-sm"
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ─── Widgets ──────────────────────────────────────────────────────────────────

function AssetHealthWidget({ data }: { data: any }) {
  if (!data) return null;
  const isGood = data.healthScore >= 70;
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-sm text-foreground">{data.name}</h4>
        <Badge variant={isGood ? "default" : "destructive"} className="text-[10px] uppercase">
          {data.status}
        </Badge>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Health Score</span>
          <span className="font-medium text-foreground">{data.healthScore}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Failure Prob.</span>
          <span className="font-medium text-foreground">{(data.failureProbability * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between border-t border-border/50 pt-2">
          <span className="text-muted-foreground">Predicted Failure</span>
          <span className="font-medium text-red-500">{data.predictedFailureDate}</span>
        </div>
      </div>
    </div>
  );
}

function RecordSummaryWidget({ payload }: { payload: any }) {
  if (!payload || !payload.data) return null;
  const { type, data } = payload;
  
  // Title mapping
  let title = "Record Details";
  if (type === "ticket") title = data.title || data.id;
  if (type === "asset") title = data.asset_name || data.asset_code || data.id;
  if (type === "user") title = data.full_name || data.email || data.id;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <h4 className="font-semibold text-sm text-foreground mb-3 pb-2 border-b border-border/50">{title}</h4>
      <div className="space-y-2 text-xs">
        {Object.entries(data).map(([key, value]) => {
          // Skip internal or empty fields
          if (!value || key === "id" || key.endsWith("_id")) return null;
          
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const textValue = String(value);
          let displayValue: React.ReactNode = textValue;
          // Badge formatting for common statuses
          if (key === "status" || key === "priority" || key === "role") {
            const isGood = textValue === "active" || textValue === "resolved" || textValue === "admin";
            const isWarn = textValue === "medium" || textValue === "in_progress" || textValue === "open";
            const variant = isGood ? "default" : (isWarn ? "secondary" : "destructive");
            displayValue = (
              <Badge variant={variant as any} className="text-[10px] uppercase h-4 px-1.5 py-0 leading-none">
                {textValue.replace(/_/g, ' ')}
              </Badge>
            );
          }
          
          // Truncate very long text like descriptions
          if (typeof value === "string" && value.length > 100) {
            displayValue = value.substring(0, 100) + "...";
          }

          return (
            <div key={key} className="flex justify-between items-start gap-4">
              <span className="text-muted-foreground shrink-0">{formattedKey}</span>
              <span className="font-medium text-foreground text-right">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Markdown-to-React renderer ───────────────────────────────────────────────
// Renders **bold**, and newlines safely without dangerouslySetInnerHTML.

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    // Split on **bold** markers
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pi}>{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={pi}>{part}</React.Fragment>;
    });
    return (
      <React.Fragment key={li}>
        {rendered}
        {li < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingChatbot() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = React.useState(false);
  const [isLoaderPresent, setIsLoaderPresent] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [interimDraft, setInterimDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null);

  // Speech Recognition
  const [isListening, setIsListening] = React.useState(false);
  const isListeningRef = React.useRef(false);
  const [speechSupported, setSpeechSupported] = React.useState(true);
  const recognitionRef = React.useRef<any>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const messageEndRef = React.useRef<HTMLDivElement | null>(null);

  const isHiddenRoute = React.useMemo(
    () =>
      AUTH_ROUTE_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      ),
    [pathname]
  );

  // Mount guard
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect loading overlay
  React.useEffect(() => {
    if (!isMounted) return;
    const checkLoader = () =>
      setIsLoaderPresent(!!document.querySelector('[data-predictix-loader="true"]'));
    checkLoader();
    const observer = new MutationObserver(checkLoader);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isMounted]);

  // Clear chat history when returning to auth routes (e.g. logging out)
  React.useEffect(() => {
    if (isHiddenRoute) {
      setMessages([]);
    }
  }, [isHiddenRoute]);

  // Escape key to close
  React.useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen]);

  // Proactive Alert Listener
  React.useEffect(() => {
    const handleProactiveAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      const payload = customEvent.detail;
      
      setIsOpen(true);
      
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `🚨 **Critical Alert!**\n\n${payload.title}\n${payload.message}`,
          createdAt: Date.now(),
        }
      ]);
    };
    
    window.addEventListener("proactive_alert", handleProactiveAlert);
    return () => window.removeEventListener("proactive_alert", handleProactiveAlert);
  }, []);

  // Speech Recognition Setup
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setDraft((prev) => (prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim()));
          }
          setInterimDraft(interimTranscript);
        };

        recognition.onerror = (event: any) => {
          if (event.error !== "no-speech" && event.error !== "network") {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            isListeningRef.current = false;
          } else if (event.error === "network") {
            console.warn("Speech recognition network error, will retry...");
          }
        };

        recognition.onend = () => {
          if (isListeningRef.current) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try {
                  recognition.start();
                } catch (e) {
                  console.error("Failed to restart speech recognition", e);
                  setIsListening(false);
                  isListeningRef.current = false;
                }
              }
            }, 300);
          } else {
            setIsListening(false);
            setInterimDraft("");
          }
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Already started");
      }
      setIsListening(true);
    }
  };

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (!isOpen) return;
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSending, isOpen, messages]);

  // ─── Send Message ──────────────────────────────────────────────────────────

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

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    try {
      const token =
        window.localStorage.getItem("token") ||
        window.localStorage.getItem("predictix.access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      // Retrieve cached frontend data for chatbot fallback
      const cachedDashboard = window.localStorage.getItem("predictix.cached_dashboard_data");
      const cachedAssetStats = window.localStorage.getItem("predictix.cached_asset_stats");
      const cachedAssetAnalytics = window.localStorage.getItem("predictix.cached_asset_analytics");
      
      const frontendContext = {
        dashboard_data: cachedDashboard ? JSON.parse(cachedDashboard) : null,
        asset_stats: cachedAssetStats ? JSON.parse(cachedAssetStats) : null,
        asset_analytics: cachedAssetAnalytics ? JSON.parse(cachedAssetAnalytics) : null,
      };

      const response = await fetch(`${CHATBOT_API_BASE}/chatbot/agent`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          question: text, 
          history: historyForAgent,
          frontend_context: frontendContext
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 401 || status === 403) {
          throw new Error("auth");
        }
        throw new Error(`server_error_${status}`);
      }

      const payload = await response.json();
      const replyText: string = typeof payload?.answer === "string" ? payload.answer : "";
      const actionButtons: ActionButton[] = Array.isArray(payload?.action_buttons)
        ? (payload.action_buttons as ActionButton[])
        : [];
      const toolTrace: ToolTraceItem[] = Array.isArray(payload?.tool_trace)
        ? (payload.tool_trace as ToolTraceItem[])
        : [];
      const widgetType = payload?.widget_type;
      const widgetData = payload?.widget_data;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: replyText || "I'm sorry, I couldn't generate a response.",
          createdAt: Date.now(),
          actionButtons,
          toolTrace,
          widgetType,
          widgetData,
        },
      ]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);

      let friendlyMessage =
        "⚠️ I'm sorry, but I'm unable to reach the PredictiX service right now. Please verify the backend server is running and try again.";

      if (errMsg === "auth") {
        friendlyMessage =
          "🔒 It looks like your session has expired. Please log in again to continue using the assistant.";
      } else if (errMsg.includes("server_error_429")) {
        friendlyMessage =
          "🛑 I've hit my token limit for right now! Please try again in a few minutes.";
      } else if (errMsg.includes("server_error_5")) {
        friendlyMessage =
          "⚠️ The server encountered an error. Please try again in a moment or contact support at neuromindspredictix@gmail.com.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: friendlyMessage,
          createdAt: Date.now(),
          actionButtons: [],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isMounted || isHiddenRoute || isLoaderPresent) {
    return null;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      id="predictix-chatbot"
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden={false}
    >
      {isOpen ? (
        <div className="pointer-events-auto absolute bottom-24 right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[560px] max-h-[calc(100vh-120px)]">
          <Card className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-border/60 px-4 py-3 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-sky-500/10 dark:from-violet-500/15 dark:via-fuchsia-500/10 dark:to-sky-500/15">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gradient-to-br from-violet-500 to-sky-500 p-1.5 text-white shadow-sm">
                  <MessageCircle className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    Sidekick
                    <Sparkles className="size-3 text-violet-500" />
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online · AI Powered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chatbot"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 bg-gradient-to-b from-transparent to-violet-50/30 dark:to-violet-950/20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-violet-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-violet-500/40 [&::-webkit-scrollbar-thumb]:rounded-full">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center pb-12">
                  <div className="rounded-full bg-gradient-to-br from-violet-500/15 to-sky-500/15 p-3.5">
                    <img src="/logo/predictix-icon.svg" alt="PredictiX" className="size-8 object-contain drop-shadow-md" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">How can I help you?</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Ask about assets, tickets, predictions, or<br />type <strong>menu</strong> to see all capabilities.
                    </p>
                  </div>
                  {/* Quick action chips */}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {["Menu", "My tickets", "Open assets", "Failure predictions"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setDraft(chip);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="rounded-full border border-violet-300/50 dark:border-violet-700/50 bg-violet-50/80 dark:bg-violet-900/30 px-3 py-1 text-xs text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-800/50 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
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
                          "max-w-[88%] rounded-2xl px-3 py-2.5 text-sm shadow-sm",
                          message.role === "user"
                            ? "rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                            : "rounded-bl-md border border-border/70 bg-card text-foreground dark:bg-slate-800/80"
                        )}
                      >
                        {/* Message body */}
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.role === "assistant"
                            ? renderMarkdown(message.text)
                            : message.text}
                        </div>

                        {/* Timestamp + Copy */}
                        <div className="mt-1.5 flex items-center justify-between gap-4">
                          <span
                            className={cn(
                              "text-[10px]",
                              message.role === "user"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
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
                              title="Copy message"
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

                        {/* Custom Widgets */}
                        {message.role === "assistant" && message.widgetType === "ASSET_HEALTH" && (
                          <AssetHealthWidget data={message.widgetData} />
                        )}
                        {message.role === "assistant" && message.widgetType === "RECORD_SUMMARY" && (
                          <RecordSummaryWidget payload={message.widgetData} />
                        )}

                        {/* Action Buttons — rendered as clickable nav buttons */}
                        {message.role === "assistant" &&
                          message.actionButtons &&
                          message.actionButtons.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {message.actionButtons.map((btn, i) => {
                                if (btn.path.startsWith("copy:")) {
                                  return <CopyActionButton key={i} label={btn.label} textToCopy={btn.path.replace("copy:", "")} />;
                                }
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      router.push(btn.path);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/60 dark:border-violet-600/60 bg-violet-50 dark:bg-violet-900/40 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-800/60 transition-all duration-200 hover:shadow-sm"
                                  >
                                    <ArrowRight className="size-3" />
                                    {btn.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-xs text-foreground shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="size-3.5 animate-spin text-violet-500" />
                          <span className="text-muted-foreground tracking-wide">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              className="border-t border-border/60 p-3 bg-card/50"
              onSubmit={async (e) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={draft + (draft && interimDraft ? " " : "") + interimDraft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setInterimDraft("");
                  }}
                  placeholder="Ask a question..."
                  aria-label="Chatbot message input"
                  className="h-10 text-sm"
                  disabled={isSending}
                  maxLength={500}
                />
                
                {speechSupported && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label="Toggle voice input"
                    onClick={toggleListening}
                    disabled={isSending}
                    className={cn(
                      "shrink-0 transition-all duration-300 relative h-10 w-10",
                      isListening ? "border-violet-500 bg-violet-50 text-violet-600 w-[72px] hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400" : ""
                    )}
                  >
                    {isListening ? (
                      <div className="flex items-center gap-1.5 w-full justify-center">
                        <Mic className="size-5" />
                        <div className="flex items-center gap-0.5 h-4">
                          <span className="w-0.5 h-full bg-current animate-[pulse_0.75s_ease-in-out_infinite_alternate] rounded-full" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-2/3 bg-current animate-[pulse_0.6s_ease-in-out_infinite_alternate] rounded-full" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-full bg-current animate-[pulse_0.9s_ease-in-out_infinite_alternate] rounded-full" style={{ animationDelay: '300ms' }} />
                          <span className="w-0.5 h-1/2 bg-current animate-[pulse_0.5s_ease-in-out_infinite_alternate] rounded-full" style={{ animationDelay: '450ms' }} />
                        </div>
                      </div>
                    ) : (
                      <MicOff className="size-5 text-muted-foreground" />
                    )}
                  </Button>
                )}

                <Button
                  type="submit"
                  size="icon-sm"
                  aria-label="Send message"
                  disabled={!draft.trim() || isSending}
                  className="shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="size-4" />
                  )}
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] text-center text-muted-foreground/60">
                AI-powered · Role-scoped · Type <strong>menu</strong> for help
              </p>
            </form>
          </Card>
        </div>
      ) : null}

      {/* Floating Launch Button */}
      <button
        type="button"
        className={cn(
          "pointer-events-auto group absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white",
          "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500",
          "shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]",
          "cursor-pointer hover:scale-105 transition-all duration-300 ease-out"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        <span className="sr-only">Sidekick</span>
        <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-br from-violet-400/40 to-sky-400/40 blur-md opacity-60" />
        {isOpen ? (
          <X className="relative size-6 drop-shadow-sm" />
        ) : (
          <>
            <MessageCircle className="relative size-6 drop-shadow-sm" />
            <Sparkles className="absolute -top-1 -right-1 size-3 text-white/90 drop-shadow" />
          </>
        )}
      </button>
    </div>
  );
}
