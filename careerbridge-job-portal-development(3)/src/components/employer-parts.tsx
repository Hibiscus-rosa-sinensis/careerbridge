"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Check, Eye, FileText, Loader2, Lock, Save, Trash2, Unlock } from "lucide-react";
import { Badge, Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { ACCESSIBILITY_FACILITIES, EDUCATION_LEVELS, EXPERIENCE_LEVELS, labelFor } from "@/lib/constants";
import { formatDate, formatSalary, locationLine } from "@/lib/utils";
import type { CvContent } from "@/lib/cv";
import { CvPreview } from "@/components/cv-preview";

/* ------------------------------ job row actions ------------------------------ */

export function JobRowActions({ jobId, status }: { jobId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(method: "PATCH" | "DELETE", body?: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method,
        ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Action failed.");
        return;
      }
      if (data.message) {
        window.sessionStorage.setItem(`cb:job:${jobId}`, data.message);
      }
      router.refresh();
    } catch {
      setError("Network error — nothing was changed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "published" ? (
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => call("PATCH", { status: "closed" })}>
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Close
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => call("PATCH", { status: "published" })}>
          <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
          Republish
        </Button>
      )}
      <Link href={`/employer/jobs/${jobId}/edit`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-300 bg-white px-3 text-[0.8rem] font-semibold text-ink-700 hover:border-ink-300">
        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </Link>
      <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => call("DELETE")}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Delete
      </Button>
      {busy ? <Loader2 className="h-4 w-4 animate-spin text-ink-300" aria-hidden="true" /> : null}
      {error ? <span className="text-[0.75rem] font-semibold text-red-700">{error}</span> : null}
    </div>
  );
}

/* ------------------------------ employer job row ------------------------------ */

export type EmployerJob = {
  id: number;
  reference: string;
  title: string;
  status: string;
  employmentType: string;
  workMode: string;
  district: string | null;
  division: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
  deadline: string | null;
  applications: number;
  interviews: number;
};

export function EmployerJobList({ jobs, filter }: { jobs: EmployerJob[]; filter: "active" | "closed" }) {
  if (!jobs.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line-300 bg-canvas px-5 py-10 text-center text-[0.86rem] text-ink-500">
        {filter === "active"
          ? "No published vacancies right now. Post one and it appears here and on the public listings immediately."
          : "No closed or draft vacancies yet."}
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {jobs.map((job) => (
        <li key={job.id} className="cb-panel p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={job.status === "published" ? "success" : job.status === "draft" ? "warn" : "muted"}>
                  {job.status}
                </Badge>
                <span className="font-mono text-[0.74rem] text-ink-400">{job.reference}</span>
              </div>
              <h3 className="mt-2 font-display text-[1.02rem] font-bold text-ink-900">
                <Link href={`/jobs/${job.id}`} className="hover:text-brand-600">
                  {job.title}
                </Link>
              </h3>
              <p className="mt-1 text-[0.82rem] text-ink-500">
                {locationLine([job.district, job.division]) || labelFor(EDUCATION_LEVELS, "") || "Remote"} ·{" "}
                {job.employmentType.replace("-", " ")} · {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod ?? "month")}
                {job.deadline ? ` · closes ${formatDate(job.deadline)}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[0.78rem]">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 font-semibold text-ink-600">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.applications} application{job.applications === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 font-semibold text-ink-600">
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.interviews} in interview
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
              <Link
                href={`/employer/dashboard?tab=applications&job=${job.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-900 px-3 text-[0.8rem] font-semibold text-white hover:bg-ink-800"
              >
                View applicants
              </Link>
              <JobRowActions jobId={job.id} status={job.status} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------ applicant management ------------------------------ */

export type EmployerApplication = {
  id: number;
  jobId: number | null;
  jobTitle: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  coverNote: string | null;
  status: string;
  appliedAt: string | null;
  interviewAt: string | null;
  interviewMode: string | null;
  employerNotes: string | null;
  applicantName?: string | null;
  skills?: string[];
  education?: string | null;
  experience?: string | null;
  location?: string | null;
  availability?: string | null;
  cv?: unknown;
};

const EMPLOYER_FLOW = [
  { value: "applied", label: "Applied" },
  { value: "under-review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Not selected" },
];

export function ApplicantList({ applications, jobTitle }: { applications: EmployerApplication[]; jobTitle?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [interviews, setInterviews] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function patch(id: number, body: Record<string, unknown>, message: string) {
    setBusy(id);
    setFlash(null);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFlash(data?.error ?? "Could not update this applicant.");
        return;
      }
      setFlash(message);
      router.refresh();
    } catch {
      setFlash("Network error — the change was not saved.");
    } finally {
      setBusy(null);
    }
  }

  if (!applications.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line-300 bg-canvas px-5 py-10 text-center text-[0.86rem] leading-relaxed text-ink-500">
        No applications for {jobTitle ? <span className="font-semibold text-ink-700">{jobTitle}</span> : "this vacancy"} yet.
        Applicants reach this list only for vacancies posted by your own company.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {flash ? <Notice tone="info">{flash}</Notice> : null}
      <ul className="space-y-3">
        {applications.map((a) => {
          const expanded = open === a.id;
          return (
            <li key={a.id} className="cb-panel p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={a.status === "offer" ? "success" : a.status === "rejected" ? "danger" : a.status === "interview" ? "accent" : "neutral"}>
                      {EMPLOYER_FLOW.find((s) => s.value === a.status)?.label ?? a.status.replace("-", " ")}
                    </Badge>
                    <span className="text-[0.74rem] text-ink-400">
                      {a.jobTitle} · applied {formatDate(a.appliedAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-[1rem] font-bold text-ink-900">{a.contactName}</h3>
                  <p className="mt-0.5 text-[0.82rem] text-ink-500">
                    <a href={`mailto:${a.contactEmail}`} className="font-semibold text-ink-700 hover:text-brand-600">
                      {a.contactEmail}
                    </a>
                    {a.contactPhone ? ` · ${a.contactPhone}` : ""}
                    {a.location ? ` · ${a.location}` : ""}
                  </p>
                  {a.skills?.length ? (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {a.skills.map((s) => (
                        <li key={s} className="rounded-md border border-line-200 bg-canvas px-2 py-0.5 text-[0.74rem] font-semibold text-ink-600">
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {a.coverNote ? (
                    <p className="mt-3 rounded-xl border border-line-200 bg-canvas px-3.5 py-2.5 text-[0.85rem] leading-relaxed text-ink-600">
                      {a.coverNote}
                    </p>
                  ) : null}
                  {a.employerNotes && !expanded ? (
                    <p className="mt-2 text-[0.78rem] italic text-ink-400">Internal note saved</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-end gap-2 lg:w-64 lg:flex-col lg:items-stretch">
                  <Field label="Move to" htmlFor={`app-status-${a.id}`}>
                    <Select
                      id={`app-status-${a.id}`}
                      value={a.status}
                      disabled={busy === a.id}
                      onChange={(e) => patch(a.id, { status: e.target.value }, "Applicant status updated.")}
                    >
                      {EMPLOYER_FLOW.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(expanded ? null : a.id)} aria-expanded={expanded}>
                    {expanded ? "Hide details" : "Applicant details"}
                  </Button>
                </div>
              </div>

              {expanded ? (
                <div className="mt-4 grid gap-4 border-t border-line-100 pt-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="rounded-xl bg-canvas p-4">
                      <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink-400">Profile they shared</p>
                      <dl className="mt-2 space-y-1.5 text-[0.83rem]">
                        {[
                          ["Education", a.education || "Not stated"],
                          ["Experience", a.experience || "Not stated"],
                          ["Availability", a.availability || "Not stated"],
                          ["Location", a.location || "Not stated"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-3">
                            <dt className="text-ink-400">{k}</dt>
                            <dd className="text-right font-semibold text-ink-800">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <Field label="Interview date & time" htmlFor={`itv-${a.id}`}>
                      <Input
                        id={`itv-${a.id}`}
                        type="datetime-local"
                        value={interviews[a.id] ?? (a.interviewAt ? new Date(a.interviewAt).toISOString().slice(0, 16) : "")}
                        onChange={(e) => setInterviews((prev) => ({ ...prev, [a.id]: e.target.value }))}
                      />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          patch(
                            a.id,
                            { status: "interview", interviewAt: interviews[a.id] ?? "", interviewMode: "To be confirmed" },
                            "Interview scheduled and the applicant can see it.",
                          )
                        }
                        disabled={busy === a.id}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Send interview invite
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => patch(a.id, { interviewAt: "" }, "Interview time cleared.")}>
                        Clear time
                      </Button>
                    </div>
                    <Field label="Internal note (only your team sees this)" htmlFor={`note-${a.id}`}>
                      <Textarea
                        id={`note-${a.id}`}
                        rows={3}
                        value={notes[a.id] ?? a.employerNotes ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [a.id]: e.target.value }))}
                      />
                    </Field>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy === a.id || notes[a.id] === undefined}
                      onClick={() => patch(a.id, { employerNotes: notes[a.id] ?? "" }, "Internal note saved.")}
                    >
                      <Save className="h-3.5 w-3.5" aria-hidden="true" />
                      Save note
                    </Button>
                  </div>

                  <div>
                    <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink-400">Their CV, as saved in their account</p>
                    {a.cv ? (
                      <div className="mt-2 max-h-[28rem] overflow-auto rounded-xl border border-line-200 bg-canvas-deep p-3">
                        <div className="rounded bg-white p-5">
                          <CvPreview content={a.cv as CvContent} />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 rounded-xl border border-dashed border-line-300 bg-canvas px-4 py-6 text-center text-[0.82rem] leading-relaxed text-ink-500">
                        This applicant has not saved a CV in CareerBridge. Their note and profile details above are all
                        you receive — that is normal and should not count against them.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------ company profile ------------------------------ */

export function CompanyProfileForm({
  company,
}: {
  company: {
    name: string;
    industry: string | null;
    size: string | null;
    about: string | null;
    website: string | null;
    contactEmail: string | null;
    phone: string | null;
    division: string | null;
    district: string | null;
    address: string | null;
    accessibilityInfo: string | null;
  } | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: company?.name ?? "",
    industry: company?.industry ?? "",
    size: company?.size ?? "",
    about: company?.about ?? "",
    website: company?.website ?? "",
    contactEmail: company?.contactEmail ?? "",
    phone: company?.phone ?? "",
    division: company?.division ?? "",
    district: company?.district ?? "",
    address: company?.address ?? "",
    accessibilityInfo: company?.accessibilityInfo ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    setErrors({});
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data?.fields ?? {});
        setMessage({ tone: "danger", text: data?.error ?? "Could not save the company profile." });
        return;
      }
      setMessage({ tone: "success", text: data.message ?? "Company profile updated." });
      router.refresh();
    } catch {
      setMessage({ tone: "danger", text: "Network error — nothing was saved." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cb-panel space-y-4 p-5">
      {message ? <Notice tone={message.tone === "success" ? "success" : "danger"}>{message.text}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company or business name" htmlFor="cp-name" required error={errors.name}>
          <Input id="cp-name" value={values.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Industry" htmlFor="cp-industry">
          <Input id="cp-industry" value={values.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Retail, Café, Software…" />
        </Field>
        <Field label="Team size" htmlFor="cp-size">
          <Select id="cp-size" value={values.size} onChange={(e) => set("size", e.target.value)}>
            <option value="">Not specified</option>
            <option>1–10 staff</option>
            <option>11–50 staff</option>
            <option>51–200 staff</option>
            <option>201–500 staff</option>
            <option>500+ staff</option>
          </Select>
        </Field>
        <Field label="Contact email for applicants" htmlFor="cp-email" error={errors.contactEmail}>
          <Input id="cp-email" type="email" value={values.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </Field>
        <Field label="Phone" htmlFor="cp-phone">
          <Input id="cp-phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Website (optional)" htmlFor="cp-web">
          <Input id="cp-web" value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </Field>
        <Field label="Division" htmlFor="cp-division">
          <Select id="cp-division" value={values.division} onChange={(e) => set("division", e.target.value)}>
            <option value="">Not specified</option>
            {["Barishal", "Chattogram", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="District" htmlFor="cp-district">
          <Input id="cp-district" value={values.district} onChange={(e) => set("district", e.target.value)} />
        </Field>
      </div>
      <Field label="About your business" htmlFor="cp-about" hint="Two or three sentences: what you do, where you are, and who you like to hire.">
        <Textarea id="cp-about" rows={4} value={values.about} onChange={(e) => set("about", e.target.value)} />
      </Field>
      <Field
        label="Address applicants see"
        htmlFor="cp-address"
        hint="A full street address is optional — an area line is often enough for part-time hiring."
      >
        <Input id="cp-address" value={values.address} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field
        label="Accessibility facilities you actually provide"
        htmlFor="cp-access"
        hint="Describe step-free access, lift, accessible toilet, quiet space, remote equipment or interview accommodations. Only what is true today — the public listing repeats this text verbatim."
      >
        <Textarea id="cp-access" rows={4} value={values.accessibilityInfo} onChange={(e) => set("accessibilityInfo", e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-1.5">
        {ACCESSIBILITY_FACILITIES.slice(0, 6).map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => set("accessibilityInfo", values.accessibilityInfo ? `${values.accessibilityInfo}\n${f.label}` : f.label)}
            className="rounded-lg border border-line-300 bg-white px-2.5 py-1 text-[0.75rem] font-semibold text-ink-600 hover:border-brand-300 hover:text-brand-600"
          >
            + {f.label}
          </button>
        ))}
      </div>
      <Button type="button" onClick={save} disabled={busy} size="lg">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
        Save company profile
      </Button>
    </div>
  );
}


