"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock3,
  MapPin,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Badge, buttonClass } from "@/components/ui";
import { ACCESSIBILITY_FACILITIES, EXPERIENCE_LEVELS, labelFor } from "@/lib/constants";
import type { JobCardData } from "@/lib/serialize";
import { cn, daysUntil, formatSalary, locationLine, timeAgo } from "@/lib/utils";

const WORK_MODE_LABEL: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export function JobCard({
  job,
  saved = false,
  signedIn = false,
  compact = false,
}: {
  job: JobCardData;
  saved?: boolean;
  signedIn?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleSave() {
    setBusy(true);
    setError(null);
    setIsSaved((v) => !v);
    try {
      const res = await fetch(`/api/jobs/${job.id}/save`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Could not update saved jobs.");
        setIsSaved((v) => !v);
      }
    } catch {
      setError("Network error — please try again.");
      setIsSaved((v) => !v);
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  const location = locationLine([job.upazila, job.district, job.division]);
  const deadlineLeft = daysUntil(job.deadline);
  const facilities = job.accessibilityFacilities
    .map((f) => ACCESSIBILITY_FACILITIES.find((a) => a.value === f)?.label ?? f)
    .slice(0, 2);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border border-line-200 bg-white p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-line-400 hover:shadow-[0_18px_40px_-26px_rgba(15,27,38,0.45)]",
      )}
    >
      <div className="flex items-start gap-3.5">
        <CategoryIcon name={job.categoryIcon} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[1.02rem] font-bold leading-snug text-ink-900">
            <Link href={`/jobs/${job.id}`} className="after:absolute after:inset-0 after:content-[''] hover:text-brand-600">
              {job.title}
            </Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem] text-ink-500">
            <span className="font-semibold text-ink-700">{job.companyName}</span>
            {job.companyIsDemo || job.isDemo ? (
              <span className="rounded border border-line-200 bg-canvas px-1 py-px text-[0.62rem] font-bold uppercase tracking-wide text-ink-300">
                Demo
              </span>
            ) : null}
            <span className="text-ink-200" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              {job.workMode === "remote" ? (
                <Wifi className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
              ) : (
                <MapPin className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
              )}
              {location || WORK_MODE_LABEL[job.workMode] || "Bangladesh"}
            </span>
          </p>
        </div>

        {signedIn ? (
          <button
            type="button"
            onClick={toggleSave}
            disabled={busy}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            className={cn(
              "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors",
              isSaved
                ? "border-brand-200 bg-brand-50 text-brand-600"
                : "border-line-200 bg-white text-ink-300 hover:border-brand-200 hover:text-brand-600",
            )}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Bookmark className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : (
          <Link
            href={`/auth/signin?next=/jobs/${job.id}`}
            aria-label="Sign in to save this job"
            className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line-200 text-ink-300 transition-colors hover:border-brand-200 hover:text-brand-600"
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <Badge tone="neutral">{job.employmentType.replace("-", " ")}</Badge>
        <Badge tone={job.workMode === "remote" ? "info" : "neutral"}>
          {WORK_MODE_LABEL[job.workMode] ?? job.workMode}
        </Badge>
        {job.experienceLevel && job.experienceLevel !== "any" ? (
          <Badge tone="neutral">{labelFor(EXPERIENCE_LEVELS, job.experienceLevel)}</Badge>
        ) : (
          <Badge tone="success">Open to freshers</Badge>
        )}
        {job.accessibilityFacilities.length ? (
          <Badge tone="success" icon={<ShieldCheck className="h-3 w-3" aria-hidden="true" />}>
            Accessible
          </Badge>
        ) : null}
      </div>

      <dl className="mt-3.5 grid gap-1.5 text-[0.83rem] sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-2.5 py-1.5">
          <dt className="text-ink-400">Pay</dt>
          <dd className="text-right font-semibold text-ink-800">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod ?? "month")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-2.5 py-1.5">
          <dt className="text-ink-400">Hours</dt>
          <dd className="text-right font-semibold text-ink-800">
            {job.workingHours || job.shift || "Not specified"}
          </dd>
        </div>
      </dl>

      {!compact && job.summary ? (
        <p className="mt-3 line-clamp-2 text-[0.85rem] leading-relaxed text-ink-500">{job.summary}</p>
      ) : null}

      {job.requiredSkills.length ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, compact ? 3 : 5).map((skill) => (
            <li
              key={skill}
              className="rounded-md border border-line-200 bg-white px-2 py-0.5 text-[0.72rem] font-medium text-ink-600"
            >
              {skill}
            </li>
          ))}
          {job.requiredSkills.length > (compact ? 3 : 5) ? (
            <li className="px-1 py-0.5 text-[0.72rem] font-semibold text-ink-400">
              +{job.requiredSkills.length - (compact ? 3 : 5)} more
            </li>
          ) : null}
        </ul>
      ) : null}

      {facilities.length ? (
        <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-teal-600">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {facilities.join(" · ")}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line-100 pt-3.5 text-[0.76rem] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {timeAgo(job.postedAt)}
          {deadlineLeft !== null ? (
            deadlineLeft >= 0 ? (
              <span className={cn("ml-1 font-semibold", deadlineLeft <= 5 ? "text-brand-600" : "text-ink-500")}>
                · closes in {deadlineLeft}d
              </span>
            ) : (
              <span className="ml-1 font-semibold text-red-700">· deadline passed</span>
            )
          ) : null}
        </span>
        <span className={cn("relative z-10", buttonClass({ variant: "subtle", size: "sm" }))}>
          View details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>

      {error ? (
        <p role="status" className="mt-2 text-[0.75rem] font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </article>
  );
}

export function JobActions({
  jobId,
  jobTitle,
  saved = false,
  signedIn = true,
  closed = false,
  applied = false,
}: {
  jobId: number;
  jobTitle: string;
  saved?: boolean;
  signedIn?: boolean;
  closed?: boolean;
  applied?: boolean;
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleSave() {
    setBusy(true);
    setMessage(null);
    setIsSaved((v) => !v);
    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.error ?? "Could not update your saved jobs.");
        setIsSaved((v) => !v);
      }
    } catch {
      setMessage("Network error — please try again.");
      setIsSaved((v) => !v);
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      {applied ? (
        <Link href="/dashboard/applications" className={buttonClass({ variant: "subtle", size: "lg", className: "w-full" })}>
          You already applied — open tracker
        </Link>
      ) : signedIn ? (
        <Link
          href={closed ? "#closed" : `/jobs/${jobId}/apply`}
          aria-disabled={closed}
          className={buttonClass({
            variant: closed ? "outline" : "primary",
            size: "lg",
            className: cn("w-full", closed && "pointer-events-none opacity-60"),
          })}
        >
          {closed ? "Applications closed" : "Apply for this job"}
        </Link>
      ) : (
        <Link
          href={`/auth/signin?next=/jobs/${jobId}/apply`}
          className={buttonClass({ variant: "primary", size: "lg", className: "w-full" })}
        >
          Sign in to apply
        </Link>
      )}

      {signedIn ? (
        <button
          type="button"
          onClick={toggleSave}
          disabled={busy}
          aria-pressed={isSaved}
          className={buttonClass({
            variant: isSaved ? "subtle" : "outline",
            size: "md",
            className: "w-full",
          })}
        >
          {isSaved ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )}
          {isSaved ? "Saved to your list" : "Save this job"}
        </button>
      ) : (
        <Link href={`/auth/signin?next=/jobs/${jobId}`} className={buttonClass({ variant: "outline", size: "md", className: "w-full" })}>
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          Sign in to save this job
        </Link>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {message ?? `Saving state for ${jobTitle}`}
      </p>
      {message ? <p className="text-[0.76rem] font-medium text-red-700">{message}</p> : null}
    </div>
  );
}

export function JobGrid({
  jobs,
  savedIds,
  signedIn,
  compact,
  columns = 3,
}: {
  jobs: JobCardData[];
  savedIds?: number[];
  signedIn?: boolean;
  compact?: boolean;
  columns?: 2 | 3;
}) {
  const saved = new Set(savedIds ?? []);
  return (
    <ul
      className={cn(
        "grid gap-4 sm:gap-5",
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {jobs.map((job) => (
        <li key={job.id}>
          <JobCard job={job} saved={saved.has(job.id)} signedIn={signedIn} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
