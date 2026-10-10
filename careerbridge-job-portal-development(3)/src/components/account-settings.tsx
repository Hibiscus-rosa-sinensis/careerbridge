"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, LogOut, Save } from "lucide-react";
import { Button, Field, Input, Notice, Panel } from "@/components/ui";

export function AccountSettings({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "jobseeker" | "employer";
}) {
  const router = useRouter();
  const [values, setValues] = useState({ name, email });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>, okMessage: string) {
    setBusy(true);
    setMessage(null);
    setErrors({});
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data?.fields ?? {});
        setMessage(null);
        setErrors((prev) => ({ ...prev, ...(data?.fields ?? {}) }));
        return data?.error ?? "Could not save.";
      }
      setMessage(data.message ?? okMessage);
      router.refresh();
      return null;
    } catch {
      return "Network error — nothing was saved.";
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {message ? <Notice tone="success">{message}</Notice> : null}

      <Panel className="space-y-4">
        <h2 className="font-display text-[1rem] font-bold text-ink-900">Identity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="as-name" error={errors.name}>
            <Input id="as-name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </Field>
          <Field label="Email (also your login)" htmlFor="as-email" error={errors.email}>
            <Input id="as-email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
          </Field>
        </div>
        <p className="text-[0.78rem] text-ink-400">
          Account type: <span className="font-semibold text-ink-600">{role === "employer" ? "Employer" : "Job seeker"}</span>. The
          account type cannot be switched after registration — create a second account if you need the other portal.
        </p>
        <div>
          <Button
            type="button"
            disabled={busy}
            onClick={async () => {
              const err = await patch(values, "Details updated.");
              if (err) setMessage(err);
            }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Save changes
          </Button>
        </div>
      </Panel>

      <Panel className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
          <KeyRound className="h-4 w-4 text-brand-500" aria-hidden="true" />
          Password
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password" htmlFor="as-cur" error={errors.currentPassword}>
            <Input
              id="as-cur"
              type="password"
              autoComplete="current-password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            />
          </Field>
          <Field label="New password" htmlFor="as-new" error={errors.newPassword} hint="At least 8 characters, letters and numbers.">
            <Input
              id="as-new"
              type="password"
              autoComplete="new-password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </Field>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={busy || !pw.currentPassword || !pw.newPassword}
          onClick={async () => {
            const err = await patch(pw, "Password updated.");
            if (err) setMessage(err);
            else setPw({ currentPassword: "", newPassword: "" });
          }}
        >
          Update password
        </Button>
      </Panel>

      <Panel className="space-y-3">
        <h2 className="font-display text-[1rem] font-bold text-ink-900">Session</h2>
        <p className="text-[0.85rem] leading-relaxed text-ink-500">
          Signing out clears the saved jobs, CV draft and tracker from this browser view. Your data stays on your
          account and returns when you sign in again.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out of CareerBridge
        </Button>
      </Panel>

      <Notice tone="warn" title="Deleting an account">
        Account deletion is intentionally left to a manual request in this project build — there is no self-service
        delete route yet. Removing your saved jobs, applications or CV entries is available from each tool.
      </Notice>
    </div>
  );
}
