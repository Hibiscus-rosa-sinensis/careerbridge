"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, BriefcaseBusiness, Check, KeyRound, Loader2, LogIn, UserRound } from "lucide-react";
import { Button, Checkbox, Field, Input, Select } from "@/components/ui";
import { DIVISIONS, DISTRICTS } from "@/lib/constants";

type Mode = "signin" | "register";

function FormShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="cb-panel p-6 sm:p-8">
      <h1 className="font-display text-[1.5rem] font-extrabold text-ink-900">{title}</h1>
      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-500">{subtitle}</p>
      {children}
      {footer ? <div className="mt-5 border-t border-line-100 pt-4">{footer}</div> : null}
    </div>
  );
}

function ErrorBar({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-xl border border-red-700/25 bg-red-700/6 px-3.5 py-2.5 text-[0.83rem] font-medium text-red-700"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function SuccessBar({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="mb-4 flex items-start gap-2 rounded-xl border border-green-700/25 bg-green-700/8 px-3.5 py-2.5 text-[0.83rem] font-medium text-green-700"
    >
      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not sign you in.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next ?? (data.user?.role === "employer" ? "/employer/dashboard" : "/dashboard"));
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  function fill(kind: Mode | "employer") {
    if (kind === "employer") {
      setEmail("hr@nexa.dev");
      setPassword("Employer123");
    } else {
      setEmail("seeker@careerbridge.dev");
      setPassword("Seeker1234");
    }
    setError(null);
  }

  return (
    <FormShell
      title="Sign in to CareerBridge"
      subtitle="Your saved jobs, CV, matches and application statuses are waiting."
      footer={
        <p className="text-[0.85rem] text-ink-500">
          New here?{" "}
          <Link href="/auth/register" className="font-semibold text-brand-600 hover:underline">
            Create a free account
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <ErrorBar message={error} />
        <Field label="Email" htmlFor="li-email" required>
          <Input
            id="li-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="li-pass" required>
          <Input
            id="li-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </Field>
        <div className="flex items-center justify-between">
          <Link href="/auth/forgot" className="text-[0.82rem] font-semibold text-ink-500 hover:text-brand-600">
            Forgot your password?
          </Link>
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="mt-5 rounded-xl border border-dashed border-line-300 bg-canvas p-4">
        <p className="text-[0.78rem] font-bold uppercase tracking-wide text-ink-400">Project demo accounts</p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-500">
          Use these seeded logins to inspect both dashboards. They exist only in this demonstration database.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fill("signin")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-300 bg-white px-3 py-2 text-[0.8rem] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600"
          >
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            Job seeker · seeker@careerbridge.dev
          </button>
          <button
            type="button"
            onClick={() => fill("employer")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-300 bg-white px-3 py-2 text-[0.8rem] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600"
          >
            <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
            Employer · hr@nexa.dev
          </button>
        </div>
      </div>
    </FormShell>
  );
}

export function RegisterForm({ initialRole = "jobseeker" }: { initialRole?: "jobseeker" | "employer" }) {
  const router = useRouter();
  const [role, setRole] = useState<"jobseeker" | "employer">(initialRole);
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    industry: "",
    division: "",
    district: "",
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof values>(k: K, v: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not create the account.");
        setErrors(data?.fields ?? {});
        return;
      }
      router.push(role === "employer" ? "/employer/dashboard?welcome=1" : "/dashboard/profile?welcome=1");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const districts = values.division ? (DISTRICTS[values.division] ?? []) : [];

  return (
    <FormShell
      title="Create your CareerBridge account"
      subtitle="Free for job seekers, always. Employers can post vacancies without a subscription in this project."
      footer={
        <p className="text-[0.85rem] text-ink-500">
          Already registered?{" "}
          <Link href="/auth/signin" className="font-semibold text-brand-600 hover:underline">
            Sign in instead
          </Link>
        </p>
      }
    >
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-line-200 bg-canvas p-1.5">
        {(
          [
            { key: "jobseeker", label: "I am looking for work", icon: <UserRound className="h-4 w-4" /> },
            { key: "employer", label: "I want to hire", icon: <BriefcaseBusiness className="h-4 w-4" /> },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setRole(opt.key)}
            aria-pressed={role === opt.key}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[0.84rem] font-bold transition-colors ${
              role === opt.key ? "bg-white text-brand-600 shadow-[var(--shadow-soft)] ring-1 ring-brand-200" : "text-ink-500 hover:text-ink-800"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        <ErrorBar message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={role === "employer" ? "Contact person name" : "Full name"} htmlFor="rg-name" required error={errors.name}>
            <Input id="rg-name" value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
          </Field>
          <Field label="Email" htmlFor="rg-email" required error={errors.email}>
            <Input id="rg-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} />
          </Field>
        </div>
        <Field
          label="Password"
          htmlFor="rg-pass"
          required
          error={errors.password}
          hint="At least 8 characters, combining letters and numbers."
        >
          <Input id="rg-pass" type="password" value={values.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
        </Field>

        {role === "employer" ? (
          <div className="space-y-4 rounded-xl border border-line-200 bg-canvas p-4">
            <p className="text-[0.78rem] font-bold uppercase tracking-wide text-ink-400">Company details</p>
            <Field label="Company or business name" htmlFor="rg-company" required error={errors.companyName}>
              <Input id="rg-company" value={values.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Mirpur Fresh Mart" aria-invalid={Boolean(errors.companyName)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Industry" htmlFor="rg-industry">
                <Input id="rg-industry" value={values.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Retail, Café, Software…" />
              </Field>
              <Field label="Division" htmlFor="rg-division">
                <Select
                  id="rg-division"
                  value={values.division}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, division: e.target.value, district: "" }));
                  }}
                >
                  <option value="">Select</option>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="District" htmlFor="rg-district">
                <Select id="rg-district" value={values.district} onChange={(e) => set("district", e.target.value)} disabled={!districts.length}>
                  <option value="">{districts.length ? "Select" : "Pick a division"}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-line-200 p-3.5">
          <Checkbox
            id="rg-confirm"
            checked={values.confirm}
            onChange={(e) => set("confirm", e.target.checked)}
            label={
              <>
                I understand this is a university project running on demonstration data, and that the accounts,
                companies and vacancies here are not real.
              </>
            }
          />
          {errors.confirm ? <p className="mt-1.5 text-[0.76rem] font-medium text-red-700">{errors.confirm}</p> : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy || !values.confirm}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
          {busy ? "Creating account…" : role === "employer" ? "Create employer account" : "Get Started"}
        </Button>
      </form>
    </FormShell>
  );
}

export function ForgotForm({ token, email }: { token: string | null; email: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(email ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(action: "request" | "reset") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "request" ? { action, email: value } : { action, token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }
      if (action === "request") {
        setMessage("If an account exists for that address, a reset link was generated.");
        if (data.resetLink) setResetLink(data.resetLink);
      } else {
        setDone(true);
        setMessage("Password changed. You can sign in now.");
        setTimeout(() => router.push("/auth/signin"), 1600);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell
      title={token ? "Choose a new password" : "Reset your password"}
      subtitle={
        token
          ? "Your link is valid for 30 minutes from when it was created."
          : "Enter your account email and we will generate a single-use reset link."
      }
      footer={
        <p className="text-[0.85rem] text-ink-500">
          Remembered it?{" "}
          <Link href="/auth/signin" className="font-semibold text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <div className="mt-6 space-y-4">
        <ErrorBar message={error} />
        <SuccessBar message={message} />
        {token ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit("reset");
            }}
            className="space-y-4"
          >
            <Field label="New password" htmlFor="fp-pass" required hint="At least 8 characters, with letters and numbers.">
              <Input id="fp-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={busy || done}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {done ? "Password updated" : "Set new password"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit("request");
            }}
            className="space-y-4"
          >
            <Field label="Account email" htmlFor="fp-email" required>
              <Input id="fp-email" type="email" value={value} onChange={(e) => setValue(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
              Create a reset link
            </Button>
          </form>
        )}

        {resetLink ? (
          <div className="rounded-xl border border-amber-600/30 bg-amber-600/8 p-4">
            <p className="text-[0.82rem] font-bold text-amber-600">No email service is connected</p>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-600">
              This project does not have an SMTP provider configured, so the link is shown here instead of being sent
              by email. In a production deployment you would add a mail service and send this link to the address.
            </p>
            <Link
              href={resetLink}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[0.82rem] font-bold text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50"
            >
              Open reset link
            </Link>
          </div>
        ) : null}
      </div>
    </FormShell>
  );
}
