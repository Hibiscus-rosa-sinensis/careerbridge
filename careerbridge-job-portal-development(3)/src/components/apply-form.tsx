"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Send } from "lucide-react";
import { Button, Checkbox, Field, Input, Textarea } from "@/components/ui";

export function ApplyForm({
  jobId,
  jobTitle,
  companyName,
  defaultName,
  defaultEmail,
  defaultPhone,
  instructions,
  requiredSkills,
  hasSavedCv,
  cvTemplate,
}: {
  jobId: number;
  jobTitle: string;
  companyName: string;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  instructions: string | null;
  requiredSkills: string[];
  hasSavedCv: boolean;
  cvTemplate: string | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    contactName: defaultName,
    contactEmail: defaultEmail,
    contactPhone: defaultPhone,
    coverNote: `I would like to apply for the ${jobTitle} position at ${companyName}. `,
    privateNotes: "",
    confirm: false,
  });
  const [claimedSkills, setClaimedSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (values.contactName.trim().length < 2) next.contactName = "Enter your full name as it appears on your CV.";
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(values.contactEmail.trim()))
      next.contactEmail = "Enter a valid email address.";
    if (values.contactPhone.trim() && values.contactPhone.replace(/\D/g, "").length < 10)
      next.contactPhone = "Use at least 10 digits, e.g. +880 1711 234567.";
    if (values.coverNote.trim().length < 40)
      next.coverNote = "Write at least a couple of sentences (40 characters) about why you fit.";
    if (values.coverNote.trim().length > 1200) next.coverNote = "Keep the note under 1,200 characters.";
    if (!values.confirm) next.confirm = "Please confirm the details are accurate.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setBusy(true);
    const coverNote =
      values.coverNote.trim() +
      (claimedSkills.length ? `\n\nSkills I already have for this role: ${claimedSkills.join(", ")}.` : "");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          coverNote,
          privateNotes: values.privateNotes,
          cvTemplate: cvTemplate ?? "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error ?? "Something went wrong. Please try again.");
        setErrors(data?.fields ?? {});
        return;
      }
      setDone(true);
      router.push("/dashboard/applications?applied=1");
      router.refresh();
    } catch {
      setFormError("Network error — your application was not recorded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="cb-panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-line-100 pb-4">
        <div>
          <h2 className="font-display text-[1.1rem] font-bold text-ink-900">Application details</h2>
          <p className="mt-1 text-[0.83rem] text-ink-500">
            This is recorded against <span className="font-semibold text-ink-700">{jobTitle}</span> so both you and
            the employer keep a status history.
          </p>
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-700/25 bg-green-700/8 px-2.5 py-1.5 text-[0.78rem] font-bold text-green-700">
            <Check className="h-4 w-4" aria-hidden="true" /> Recorded
          </span>
        ) : null}
      </div>

      {formError ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-700/25 bg-red-700/6 px-3.5 py-2.5 text-[0.83rem] font-medium text-red-700"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="af-name" required error={errors.contactName}>
          <Input
            id="af-name"
            value={values.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            aria-invalid={Boolean(errors.contactName)}
            autoComplete="name"
          />
        </Field>
        <Field label="Email" htmlFor="af-email" required error={errors.contactEmail}>
          <Input
            id="af-email"
            type="email"
            value={values.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            aria-invalid={Boolean(errors.contactEmail)}
            autoComplete="email"
          />
        </Field>
        <Field
          label="Phone (optional)"
          htmlFor="af-phone"
          error={errors.contactPhone}
          hint="Only the employer sees this after you apply."
        >
          <Input
            id="af-phone"
            value={values.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
            placeholder="+880 1711 234567"
            aria-invalid={Boolean(errors.contactPhone)}
            autoComplete="tel"
          />
        </Field>
        <Field label="Your CV in CareerBridge" htmlFor="af-cv" hint={hasSavedCv ? "Loaded from your saved CV." : "No CV saved yet — the employer sees your note and profile."}>
          <div className="flex items-center gap-2 rounded-xl border border-line-300 bg-canvas px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-ink-500 ring-1 ring-line-200">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M7 3h7l4 4v14H7z" />
                <path d="M14 3v4h4M10 12h6M10 16h6" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.82rem] font-semibold text-ink-800">
                {hasSavedCv ? `${cvTemplate} template · saved to your account` : "No saved CV yet"}
              </p>
              <Link href="/career-tools/cv" className="text-[0.76rem] font-semibold text-brand-600 hover:underline">
                {hasSavedCv ? "Edit my CV" : "Write one now"}
              </Link>
            </div>
            <input id="af-cv" type="hidden" readOnly value={cvTemplate ?? ""} />
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Note to the employer"
          htmlFor="af-note"
          required
          error={errors.coverNote}
          hint="Say why you fit, when you can start and which hours suit you. Written by you — CareerBridge never auto-generates text."
        >
          <Textarea
            id="af-note"
            rows={6}
            value={values.coverNote}
            onChange={(e) => set("coverNote", e.target.value)}
            aria-invalid={Boolean(errors.coverNote)}
            aria-describedby="af-note-count"
          />
        </Field>
        <p id="af-note-count" className="mt-1 text-right text-[0.72rem] font-medium text-ink-400">
          {values.coverNote.trim().length} characters
        </p>
      </div>

      {requiredSkills.length ? (
        <fieldset className="mt-4 rounded-xl border border-line-200 bg-canvas p-4">
          <legend className="px-1 text-[0.8rem] font-bold text-ink-700">
            Which of these required skills do you already have?
          </legend>
          <p className="mb-3 text-[0.78rem] text-ink-500">
            Ticked skills are added to your note. Leave a box unchecked if you are still learning it — that is not a
            reason to skip applying.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {requiredSkills.map((skill) => {
              const on = claimedSkills.includes(skill);
              return (
                <label
                  key={skill}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-[0.84rem] font-medium transition-colors ${
                    on ? "border-brand-300 bg-white text-ink-900" : "border-line-200 bg-white/60 text-ink-600 hover:border-ink-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand-500"
                    checked={on}
                    onChange={(e) =>
                      setClaimedSkills((prev) => (e.target.checked ? [...prev, skill] : prev.filter((s) => s !== skill)))
                    }
                  />
                  {skill}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-4">
        <Field
          label="Private note for your tracker (optional)"
          htmlFor="af-private"
          hint="Only you can read this. Use it to remember follow-ups, calls or what you asked about."
        >
          <Textarea
            id="af-private"
            rows={2}
            value={values.privateNotes}
            onChange={(e) => set("privateNotes", e.target.value)}
            placeholder="e.g. Called the shop, they will reply by Thursday."
          />
        </Field>
      </div>

      {instructions ? (
        <p className="mt-4 rounded-xl border border-line-200 bg-canvas px-3.5 py-3 text-[0.82rem] leading-relaxed text-ink-600">
          <span className="font-bold text-ink-800">Employer instructions: </span>
          {instructions}
        </p>
      ) : null}

      <div className="mt-4 rounded-xl border border-line-200 p-3.5">
        <Checkbox
          id="af-confirm"
          label="I confirm the information above is accurate and belongs to me. I know that applying on CareerBridge is always free."
          checked={values.confirm}
          onChange={(e) => set("confirm", e.target.checked)}
          aria-invalid={Boolean(errors.confirm)}
        />
        {errors.confirm ? (
          <p className="mt-1.5 text-[0.76rem] font-medium text-red-700">{errors.confirm}</p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {busy ? "Sending application…" : "Submit application"}
        </Button>
        <Link href={`/jobs/${jobId}`} className="text-[0.84rem] font-semibold text-ink-500 hover:text-ink-900">
          Back to the job
        </Link>
      </div>
    </form>
  );
}
