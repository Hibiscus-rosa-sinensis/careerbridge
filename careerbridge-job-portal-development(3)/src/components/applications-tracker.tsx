"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, ChevronDown, StickyNote, Trash2, X } from "lucide-react";
import { Badge, Button, EmptyState, Field, Select, Textarea, type Tone } from "@/components/ui";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { formatDate, timeAgo } from "@/lib/utils";

export type TrackerApplication = {
  id: number;
  jobId: number | null;
  jobTitle: string;
  companyName: string | null;
  jobReference: string | null;
  status: string;
  appliedAt: string | null;
  updatedAt: string | null;
  interviewAt: string | null;
  interviewMode: string | null;
  privateNotes: string | null;
  coverNote: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  jobStatus: string;
};

const TONE: Record<string, Tone> = {
  applied: "neutral",
  "under-review": "info",
  shortlisted: "accent",
  interview: "accent",
  offer: "success",
  rejected: "danger",
  withdrawn: "muted",
  "no-response": "warn",
};

export function ApplicationsTracker({ applications }: { applications: TrackerApplication[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [openNote, setOpenNote] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [interviews, setInterviews] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of applications) map.set(a.status, (map.get(a.status) ?? 0) + 1);
    return map;
  }, [applications]);

  const rows = applications.filter((a) => (filter === "all" ? true : a.status === filter));
  const upcoming = applications.filter(
    (a) => a.interviewAt && new Date(a.interviewAt).getTime() > Date.now() - 6 * 3600_000,
  );

  async function patch(id: number, body: Record<string, unknown>, message: string) {
    setSaving(id);
    setFlash(null);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFlash(data?.error ?? "Could not update this application.");
        return;
      }
      setFlash(message);
      router.refresh();
    } catch {
      setFlash("Network error — the update was not saved.");
    } finally {
      setSaving(null);
    }
  }

  async function remove(id: number) {
    setSaving(id);
    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setSaving(null);
    setConfirmDelete(null);
    if (res.ok) {
      setFlash("Application record removed.");
      router.refresh();
    } else {
      setFlash("Could not remove that record.");
    }
  }

  return (
    <div className="space-y-5">
      {upcoming.length ? (
        <div className="cb-panel border-brand-200 bg-brand-50/60 p-5">
          <h2 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
            <CalendarClock className="h-4.5 w-4.5 text-brand-600" aria-hidden="true" />
            Upcoming interviews
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[0.86rem] font-bold text-ink-900">{a.jobTitle}</p>
                  <p className="text-[0.76rem] text-ink-500">{a.companyName || "Employer"}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="block text-[0.8rem] font-bold text-brand-700">{formatDate(a.interviewAt, true)}</span>
                  <span className="block text-[0.72rem] text-ink-400">{a.interviewMode || "Mode not set"}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg border px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
            filter === "all" ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line-300 bg-white text-ink-600 hover:border-ink-300"
          }`}
        >
          All <span className="text-ink-400">({applications.length})</span>
        </button>
        {APPLICATION_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFilter(s.value)}
            className={`rounded-lg border px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
              filter === s.value ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line-300 bg-white text-ink-600 hover:border-ink-300"
            }`}
          >
            {s.label} <span className="text-ink-400">({counts.get(s.value) ?? 0})</span>
          </button>
        ))}
      </div>

      {flash ? (
        <p role="status" aria-live="polite" className="rounded-xl border border-line-200 bg-canvas px-3.5 py-2.5 text-[0.82rem] font-medium text-ink-600">
          {flash}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-5 w-5" aria-hidden="true" />}
          title={applications.length ? "No applications with that status" : "You have not applied through CareerBridge yet"}
          description={
            applications.length
              ? "Switch the filter above to see the rest of your applications."
              : "When you apply to a vacancy it is recorded here automatically with the status “Applied”. You can then update the status, add interview dates and keep private notes."
          }
          action={
            applications.length ? null : (
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/jobs" className="rounded-lg bg-brand-500 px-3.5 py-2 text-[0.82rem] font-semibold text-white hover:bg-brand-600">
                  Find jobs to apply for
                </Link>
                <Link href="/dashboard/saved" className="rounded-lg border border-line-300 bg-white px-3.5 py-2 text-[0.82rem] font-semibold text-ink-700">
                  Open saved jobs
                </Link>
              </div>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => {
            const label = APPLICATION_STATUSES.find((s) => s.value === a.status)?.label ?? a.status;
            const notesOpen = openNote === a.id;
            return (
              <li key={a.id} className="cb-panel p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={TONE[a.status] ?? "neutral"}>{label}</Badge>
                      {a.jobStatus && a.jobStatus !== "published" ? <Badge tone="muted">Listing closed</Badge> : null}
                      <span className="text-[0.74rem] text-ink-400">
                        Applied {timeAgo(a.appliedAt)}
                        {a.updatedAt && a.updatedAt !== a.appliedAt ? ` · updated ${timeAgo(a.updatedAt)}` : ""}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-[1.02rem] font-bold text-ink-900">
                      {a.jobId ? (
                        <Link href={`/jobs/${a.jobId}`} className="hover:text-brand-600">
                          {a.jobTitle}
                        </Link>
                      ) : (
                        a.jobTitle
                      )}
                    </h3>
                    <p className="mt-0.5 text-[0.84rem] text-ink-500">
                      {a.companyName || "Employer not recorded"}
                      {a.jobReference ? <span className="font-mono text-[0.76rem] text-ink-400"> · {a.jobReference}</span> : null}
                    </p>

                    <dl className="mt-3 grid gap-2 text-[0.8rem] sm:grid-cols-3">
                      <div className="rounded-lg bg-canvas px-2.5 py-2">
                        <dt className="text-ink-400">Interview</dt>
                        <dd className="font-semibold text-ink-800">{a.interviewAt ? formatDate(a.interviewAt, true) : "Not scheduled"}</dd>
                      </div>
                      <div className="rounded-lg bg-canvas px-2.5 py-2">
                        <dt className="text-ink-400">Contact used</dt>
                        <dd className="truncate font-semibold text-ink-800">{a.contactEmail}</dd>
                      </div>
                      <div className="rounded-lg bg-canvas px-2.5 py-2">
                        <dt className="text-ink-400">Phone</dt>
                        <dd className="font-semibold text-ink-800">{a.contactPhone || "—"}</dd>
                      </div>
                    </dl>

                    {a.coverNote ? (
                      <p className="mt-3 rounded-xl border border-line-200 px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-ink-600">
                        <span className="font-bold text-ink-800">Your note: </span>
                        {a.coverNote}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 lg:w-52">
                    <Field label="Update status" htmlFor={`st-${a.id}`}>
                      <div className="flex gap-1.5">
                        <Select
                          id={`st-${a.id}`}
                          value={a.status}
                          disabled={saving === a.id}
                          onChange={(e) => patch(a.id, { status: e.target.value }, `Status set to ${e.target.value.replace("-", " ")}.`)}
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </Select>
                        {saving === a.id ? (
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-canvas text-ink-400">
                            <Check className="h-4 w-4 animate-pulse" aria-hidden="true" />
                          </span>
                        ) : null}
                      </div>
                    </Field>
                    <Field label="Interview date & time" htmlFor={`it-${a.id}`}>
                      <input
                        id={`it-${a.id}`}
                        type="datetime-local"
                        className="cb-input"
                        value={interviews[a.id] ?? (a.interviewAt ? new Date(a.interviewAt).toISOString().slice(0, 16) : "")}
                        onChange={(e) => setInterviews((prev) => ({ ...prev, [a.id]: e.target.value }))}
                        onBlur={() => {
                          const v = interviews[a.id];
                          if (v !== undefined) patch(a.id, { interviewAt: v }, "Interview time saved.");
                        }}
                      />
                    </Field>
                    <div className="flex flex-wrap gap-1.5">
                      <Button type="button" variant="outline" size="sm" onClick={() => setOpenNote(notesOpen ? null : a.id)} aria-expanded={notesOpen}>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${notesOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                        {notesOpen ? "Hide notes" : "Private notes"}
                      </Button>
                      {confirmDelete === a.id ? (
                        <>
                          <Button type="button" variant="danger" size="sm" onClick={() => remove(a.id)} disabled={saving === a.id}>
                            Confirm remove
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </>
                      ) : (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(a.id)}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {notesOpen ? (
                  <div className="mt-4 border-t border-line-100 pt-4">
                    <Field
                      label="Private notes"
                      htmlFor={`note-${a.id}`}
                      hint="Only you can read these. Employers never see this field."
                    >
                      <Textarea
                        id={`note-${a.id}`}
                        rows={3}
                        value={notes[a.id] ?? a.privateNotes ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [a.id]: e.target.value }))}
                        placeholder="Who did you speak to? What did you ask about pay, hours or accessibility?"
                      />
                    </Field>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => patch(a.id, { privateNotes: notes[a.id] ?? "" }, "Notes saved.")}
                        disabled={saving === a.id || notes[a.id] === undefined}
                      >
                        Save note
                      </Button>
                      {notes[a.id] === undefined ? (
                        <span className="text-[0.74rem] text-ink-400">Edit the text to enable saving.</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[0.78rem] leading-relaxed text-ink-400">
        “No Response Yet” is a waiting state, not a rejection. Keep following up for one to two weeks, then move on —
        the status stays in your list so you can pick it back up if the employer replies late.
      </p>
    </div>
  );
}
