"use client";

import * as React from "react";
import { CircleHelp, Mail, MessageSquareText, PlusCircle, Search } from "lucide-react";

import AdminNavbar from "@/components/navigation/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseBrowserClient";

const ADMIN_SUPPORT_EMAIL = "support@predictix.com";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export default function HelpDeskPage() {
  const adminFormRef = React.useRef<HTMLDivElement | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [newQuestion, setNewQuestion] = React.useState("");
  const [adminQuestion, setAdminQuestion] = React.useState("");
  const [adminAnswer, setAdminAnswer] = React.useState("");
  const [faqItems, setFaqItems] = React.useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    const role = window.localStorage.getItem("predictix.user.role");
    setIsAdmin(role === "ADMIN");
  }, []);

  const fetchFaqs = React.useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      setLoadError(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend env."
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("faqs")
      .select("id,question,answer,category,tags,is_active,created_at,updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setIsLoading(false);
      return;
    }

    setFaqItems(data ?? []);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const filteredFaqs = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems;

    return faqItems.filter((item) => {
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });
  }, [faqItems, query]);

  const sendQuestionToAdmin = () => {
    const trimmed = newQuestion.trim();
    if (!trimmed) return;

    const subject = encodeURIComponent("New Help Desk Question");
    const body = encodeURIComponent(
      `Hello Admin Team,%0D%0A%0D%0APlease review this new user question:%0D%0A${trimmed}%0D%0A%0D%0AThanks.`
    );

    window.location.href = `mailto:${ADMIN_SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const addFaqItem = async () => {
    const question = adminQuestion.trim();
    const answer = adminAnswer.trim();
    if (!question || !answer) return;
    if (!hasSupabaseConfig || !supabase) {
      setLoadError(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend env."
      );
      return;
    }

    setIsAdding(true);

    const { data, error } = await supabase
      .from("faqs")
      .insert({
        question,
        answer,
        is_active: true,
      })
      .select("id,question,answer,category,tags,is_active,created_at,updated_at")
      .single();

    if (error) {
      setIsAdding(false);
      setLoadError(error.message);
      return;
    }

    setFaqItems((current) => [data, ...current]);

    setAdminQuestion("");
    setAdminAnswer("");
    setIsAdding(false);
  };

  const scrollToAdminForm = () => {
    adminFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
                  <CircleHelp className="size-7 text-primary" />
                  Help Desk
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Find answers to common questions. If your question is not listed, send it to
                  admin support and we will add it to FAQ.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {isAdmin ? (
                  <Button type="button" onClick={scrollToAdminForm} className="h-9">
                    <PlusCircle className="size-4" />
                    Add New Q&A
                  </Button>
                ) : null}
                <a
                  href={`mailto:${ADMIN_SUPPORT_EMAIL}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Mail className="size-4" />
                  {ADMIN_SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
                placeholder="Search question or answer"
                aria-label="Search FAQ"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Loading FAQs...
              </p>
            ) : loadError ? (
              <div className="space-y-3 rounded-xl border border-dashed border-destructive/40 p-4 text-sm">
                <p className="text-destructive">Failed to load FAQs: {loadError}</p>
                <Button type="button" variant="outline" onClick={fetchFaqs}>
                  Retry
                </Button>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No matching FAQ found. Ask a new question below and send it to admins.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-xl border border-border bg-card px-4 py-3 open:border-primary/40"
                  >
                    <summary className="cursor-pointer list-none text-sm font-semibold md:text-base">
                      <span className="inline-flex items-center gap-2">
                        <MessageSquareText className="size-4 text-primary" />
                        {item.question}
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-[15px]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Ask A New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              placeholder="Type your question here"
              className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label="New help desk question"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground md:text-sm">
                This sends your question to admin email: {ADMIN_SUPPORT_EMAIL}
              </p>
              <Button type="button" onClick={sendQuestionToAdmin} disabled={!newQuestion.trim()}>
                Send To Admin
              </Button>
            </div>
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card className="border-border/70" ref={adminFormRef}>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Admin: Add FAQ Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={adminQuestion}
                onChange={(event) => setAdminQuestion(event.target.value)}
                placeholder="FAQ question"
                aria-label="FAQ question"
              />
              <textarea
                value={adminAnswer}
                onChange={(event) => setAdminAnswer(event.target.value)}
                placeholder="FAQ answer"
                className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label="FAQ answer"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={addFaqItem}
                  disabled={!adminQuestion.trim() || !adminAnswer.trim() || isAdding}
                >
                  {isAdding ? "Saving..." : "Add Question & Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        </div>
      </main>
    </div>
  );
}
