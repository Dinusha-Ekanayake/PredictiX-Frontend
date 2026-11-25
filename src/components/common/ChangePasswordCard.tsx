"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeMyPassword } from "@/lib/api/userProfileApi";
import { toast } from "@/lib/customToast";

const MIN_LENGTH = 8;

/** Reason the new password cannot be used, or null when it can. */
function passwordProblem(current: string, next: string, confirm: string): string | null {
  if (!current) return "Enter your current password.";
  if (next.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters.`;
  if (next !== next.trim()) return "Passwords cannot start or end with spaces.";
  if (/^\d+$/.test(next)) return "Use letters as well as numbers.";
  if (next === current) return "Choose a password different from the current one.";
  if (next !== confirm) return "The new passwords do not match.";
  return null;
}

export default function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = passwordProblem(current, next, confirm);
    setError(problem);
    if (problem) return;

    setSaving(true);
    try {
      await changeMyPassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password changed", { description: "Use your new password next time you sign in." });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Password could not be changed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change the password you use to sign in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid max-w-md gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={MIN_LENGTH}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">At least {MIN_LENGTH} characters, not only numbers.</p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
