import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  HandHeart,
  Banknote,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { JobGrid } from "@/components/job-list";
import { JobActions } from "@/components/job-list";
import { DemoNotice, PageContainer } from "@/components/page-shell";
import { Badge, Panel, SectionHeading } from "@/components/ui";
import {
  ACCESSIBILITY_FACILITIES,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  WORK_MODES,
  labelFor,
} from "@/lib/constants";
import { getJobDetail, getSavedJobIds, searchJobs, type JobFilterParams } from "@/lib/jobs";
import { toJobCardData } from "@/lib/serialize";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { daysUntil, formatDate, formatSalary, locationLine, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Prose({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="space-y-3">
      {text
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="text-[0.92rem] leading-relaxed text-ink-600">
            {p}
          </p>
        ))}
    </div>
  );
}

function BulletBlock({ text, tone = "ink" }: { text: string | null; tone?: "ink" | "brand" }) {
  if (!text) return null;
  const items = text.split("\n").map((l) => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
  if (!items.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[0.9rem] leading-relaxed text-ink-600">
          <span
            className={`mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full ${tone === "brand" ? "bg-brand-400" : "bg-ink-200"}`}
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) notFound();

  const session = await getSessionUser();
  const job = await getJobDetail(jobId, Boolean(session?.role === "employer"));
  if (!job) notFound();

  const [savedIds, appliedRow, related] = await Promise.all([
    getSavedJobIds(session?.id ?? null),
    session?.role === "jobseeker"
      ? db
          .select({ id: applications.id, status: applications.status })
          .from(applications)
          .where(and(eq(applications.userId, session.id), eq(applications.jobId, jobId)))
          .limit(1)
          .then((r) => r[0])
      : Promise.resolve(undefined),
    searchJobs({ category: job.categorySlug ?? undefined, perPage: 4, openOnly: true } as JobFilterParams),
  ]);

  const isClosed = job.status !== "published";
  const deadlineLeft = daysUntil(job.deadline);
  const location = locationLine([job.upazila, job.district, job.division]);
  const facilities = job.accessibilityFacilities.map(
    (f) => ACCESSIBILITY_FACILITIES.find((a) => a.value === f)?.label ?? f,
  );

  const similar = related.results.filter((r) => r.id !== jobId).slice(0, 3);

  return (
    <>
      <div className="border-b border-line-200 bg-canvas">
        <PageContainer className="py-6 sm:py-8">
          <nav aria-label="Breadcrumb" className="text-[0.78rem] font-medium text-ink-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-brand-600">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/jobs" className="hover:text-brand-600">
                  Find Jobs
                </Link>
              </li>
              {job.categorySlug ? (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/jobs?cat=${job.categorySlug}`} className="hover:text-brand-600">
                      {job.categoryName}
                    </Link>
                  </li>
                </>
              ) : null}
            </ol>
          </nav>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <CategoryIcon name={job.categoryIcon} className="h-12 w-12 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isClosed ? <Badge tone="danger">Closed</Badge> : null}
                {job.isDemo ? (
                  <Badge tone="muted">Demonstration listing</Badge>
                ) : (
                  <Badge tone="accent">Your company post</Badge>
                )}
                {job.accessibilityFacilities.length ? (
                  <Badge tone="success" icon={<ShieldCheck className="h-3 w-3" aria-hidden="true" />}>
                    Accessibility info
                  </Badge>
                ) : null}
              </div>
              <h1 className="mt-2 font-display text-[1.6rem] font-extrabold leading-tight text-ink-900 sm:text-[2.05rem]">
                {job.title}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.875rem] text-ink-500">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-800">
                  <Building2 className="h-4 w-4 text-ink-300" aria-hidden="true" />
                  {job.companyName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {job.workMode === "remote" ? (
                    <Wifi className="h-4 w-4 text-teal-600" aria-hidden="true" />
                  ) : (
                    <MapPin className="h-4 w-4 text-ink-300" aria-hidden="true" />
                  )}
                  {location || labelFor(WORK_MODES, job.workMode)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-ink-300" aria-hidden="true" />
                  Posted {timeAgo(job.postedAt ? new Date(job.postedAt) : null)}
                </span>
              </p>
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20.5rem]">
          {/* ----------------------------- main ----------------------------- */}
          <div className="min-w-0 space-y-5">
            <Panel className="space-y-4">
              <h2 className="font-display text-[1.05rem] font-bold text-ink-900">About this role</h2>
              <Prose text={job.summary ? `${job.summary}\n\n${job.description ?? ""}` : job.description} />
              {!job.summary && !job.description ? (
                <p className="text-[0.875rem] text-ink-400">
                  The employer did not add a longer description for this demonstration listing.
                </p>
              ) : null}
            </Panel>

            {job.responsibilities ? (
              <Panel className="space-y-3.5">
                <h2 className="flex items-center gap-2 font-display text-[1.05rem] font-bold text-ink-900">
                  <ClipboardList className="h-4.5 w-4.5 text-brand-500" aria-hidden="true" />
                  What you will do
                </h2>
                <BulletBlock text={job.responsibilities} tone="brand" />
              </Panel>
            ) : null}

            <Panel className="space-y-4">
              <h2 className="font-display text-[1.05rem] font-bold text-ink-900">What the employer is looking for</h2>
              {job.requirements ? <BulletBlock text={job.requirements} /> : null}
              <dl className="grid gap-3 rounded-xl bg-canvas p-4 text-[0.85rem] sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400">Experience</dt>
                  <dd className="font-semibold text-ink-800">
                    {labelFor(EXPERIENCE_LEVELS, job.experienceLevel) || "Open to all levels"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400">Education</dt>
                  <dd className="font-semibold text-ink-800">
                    {labelFor(EDUCATION_LEVELS, job.educationLevel) || "Not specified"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400">Employment type</dt>
                  <dd className="font-semibold text-ink-800">{job.employmentType.replace("-", " ")}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400">Work arrangement</dt>
                  <dd className="font-semibold text-ink-800">{labelFor(WORK_MODES, job.workMode)}</dd>
                </div>
              </dl>
            </Panel>

            {job.requiredSkills.length || job.preferredSkills.length ? (
              <Panel className="space-y-4">
                <h2 className="font-display text-[1.05rem] font-bold text-ink-900">Skills for this job</h2>
                {job.requiredSkills.length ? (
                  <div>
                    <p className="text-[0.78rem] font-bold uppercase tracking-wide text-ink-400">Required</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((s) => (
                        <li key={s} className="rounded-lg border border-line-300 bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-ink-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {job.preferredSkills.length ? (
                  <div>
                    <p className="text-[0.78rem] font-bold uppercase tracking-wide text-ink-400">
                      Good to have — not a reason to self-reject
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {job.preferredSkills.map((s) => (
                        <li key={s} className="rounded-lg border border-dashed border-brand-200 bg-brand-50/60 px-2.5 py-1 text-[0.8rem] font-semibold text-brand-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {session?.role === "jobseeker" ? (
                  <p className="flex items-start gap-2 rounded-xl bg-canvas px-3.5 py-3 text-[0.82rem] leading-relaxed text-ink-600">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                    Compare these with your own list —{" "}
                    <Link href="/career-tools/matching" className="font-semibold text-brand-600 underline-offset-2 hover:underline">
                      Smart job matching
                    </Link>{" "}
                    marks which skills you already have and which are worth learning next.
                  </p>
                ) : null}
              </Panel>
            ) : null}

            <Panel className="space-y-3">
              <h2 className="font-display text-[1.05rem] font-bold text-ink-900">Pay and hours</h2>
              <dl className="divide-y divide-line-100 text-[0.88rem]">
                {[
                  { icon: <Banknote className="h-4 w-4" />, k: "Salary or pay range", v: formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod ?? "month") + (job.payRate ? ` (${job.payRate})` : "") },
                  { icon: <Clock3 className="h-4 w-4" />, k: "Working hours", v: job.workingHours || "Not specified" },
                  { icon: <CalendarClock className="h-4 w-4" />, k: "Shift pattern", v: job.shift || "Not specified" },
                  { icon: <GraduationCap className="h-4 w-4" />, k: "Application deadline", v: job.deadline ? `${formatDate(job.deadline)}${deadlineLeft !== null && deadlineLeft >= 0 ? ` · ${deadlineLeft} days left` : ""}` : "No deadline published" },
                ].map((row) => (
                  <div key={row.k} className="flex items-center gap-3 py-2.5">
                    <span className="text-ink-300" aria-hidden="true">
                      {row.icon}
                    </span>
                    <dt className="w-44 shrink-0 font-medium text-ink-500">{row.k}</dt>
                    <dd className="flex-1 text-right font-semibold text-ink-800">{row.v}</dd>
                  </div>
                ))}
              </dl>
              {job.benefits ? (
                <div className="rounded-xl bg-canvas p-4">
                  <p className="text-[0.78rem] font-bold uppercase tracking-wide text-ink-400">Benefits stated by the employer</p>
                  <BulletBlock text={job.benefits} />
                </div>
              ) : null}
            </Panel>

            <Panel className="space-y-3.5 border-teal-600/25 bg-teal-600/4">
              <h2 className="flex items-center gap-2 font-display text-[1.05rem] font-bold text-ink-900">
                <HandHeart className="h-4.5 w-4.5 text-teal-600" aria-hidden="true" />
                Accessibility and accommodations
              </h2>
              {facilities.length ? (
                <>
                  <p className="text-[0.85rem] leading-relaxed text-ink-600">
                    The employer reported the following facilities for this position. CareerBridge only displays
                    information the employer provided — an absent item does not mean the facility is unavailable.
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {facilities.map((f) => (
                      <li key={f} className="flex items-center gap-2 rounded-lg border border-teal-600/20 bg-white px-3 py-2 text-[0.85rem] font-semibold text-ink-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-[0.85rem] leading-relaxed text-ink-500">
                  No accessibility facilities were recorded for this vacancy. That is missing information, not a
                  statement about the workplace — you are welcome to ask the employer about ramps, quiet space,
                  flexible start times or a written interview when you apply.
                </p>
              )}
              {job.interviewAccommodations ? (
                <div className="rounded-xl bg-white p-4 ring-1 ring-teal-600/20">
                  <p className="text-[0.78rem] font-bold uppercase tracking-wide text-teal-600">
                    Interview accommodations offered
                  </p>
                  <Prose text={job.interviewAccommodations} />
                </div>
              ) : null}
              <p className="text-[0.78rem] text-ink-400">
                You never need to provide medical information to apply.{" "}
                <Link href="/accessibility" className="font-semibold text-brand-600 hover:underline">
                  Read our accessibility statement
                </Link>
                .
              </p>
            </Panel>

            {job.companyAbout ? (
              <Panel className="space-y-3">
                <h2 className="font-display text-[1.05rem] font-bold text-ink-900">About {job.companyName}</h2>
                <Prose text={job.companyAbout} />
                <p className="text-[0.82rem] text-ink-400">
                  {job.companyIndustry ? `${job.companyIndustry} · ` : ""}
                  {job.companyAddress || location}
                </p>
                {job.companyIsDemo ? (
                  <p className="rounded-lg bg-canvas px-3 py-2 text-[0.78rem] text-ink-500">
                    This company profile is part of the demonstration dataset.
                  </p>
                ) : null}
              </Panel>
            ) : null}

            <Panel className="space-y-3">
              <h2 className="font-display text-[1.05rem] font-bold text-ink-900">How to apply</h2>
              <Prose text={job.applicationInstructions} />
              <p className="text-[0.82rem] text-ink-500">
                Applying through CareerBridge records the application in your tracker so you can follow up.{" "}
                <span className="font-semibold text-ink-700">
                  Never pay a fee, “training charge” or “uniform charge” to receive a job.
                </span>
              </p>
            </Panel>
          </div>

          {/* ---------------------------- sidebar ---------------------------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Panel className="space-y-4">
              <div className="rounded-xl border border-line-200 bg-canvas p-4">
                <p className="text-[0.72rem] font-bold uppercase tracking-widest text-ink-400">Pay</p>
                <p className="mt-1 font-display text-[1.15rem] font-extrabold text-ink-900">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod ?? "month")}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[0.75rem]">
                  <div className="rounded-lg bg-white p-2 ring-1 ring-line-200">
                    <p className="text-ink-400">Hours</p>
                    <p className="font-semibold text-ink-800">{job.workingHours || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 ring-1 ring-line-200">
                    <p className="text-ink-400">Deadline</p>
                    <p className="font-semibold text-ink-800">{job.deadline ? formatDate(job.deadline) : "—"}</p>
                  </div>
                </div>
              </div>

              {isClosed ? (
                <p id="closed" className="rounded-lg border border-red-700/25 bg-red-700/6 px-3 py-2 text-[0.8rem] font-medium text-red-700">
                  This vacancy is closed, so new applications are not accepted. Saved jobs and your tracker stay
                  available.
                </p>
              ) : null}

              <JobActions
                jobId={job.id}
                jobTitle={job.title}
                saved={savedIds.has(job.id)}
                signedIn={Boolean(session)}
                closed={isClosed}
                applied={Boolean(appliedRow)}
              />

              {appliedRow ? (
                <p className="rounded-lg border border-blue-700/20 bg-blue-700/6 px-3 py-2 text-[0.8rem] font-medium text-blue-700">
                  Application recorded — current status:{" "}
                  <span className="font-bold">{appliedRow.status.replace("-", " ")}</span>
                </p>
              ) : null}

              <div className="border-t border-line-100 pt-3.5">
                <p className="text-[0.72rem] font-bold uppercase tracking-widest text-ink-400">Reference</p>
                <p className="mt-1 font-mono text-[0.82rem] text-ink-600">{job.reference}</p>
              </div>

              <Link
                href={job.categorySlug ? `/jobs?cat=${job.categorySlug}` : "/jobs"}
                className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-brand-600 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                More {job.categoryName ?? "jobs"} like this
              </Link>
            </Panel>

            <DemoNotice className="mt-4">
              Sample vacancy from the project dataset. Employer, pay and deadline are examples only.
            </DemoNotice>
          </aside>
        </div>

        {similar.length ? (
          <div className="mt-14">
            <SectionHeading
              eyebrow="Similar roles"
              title={`Other ${job.categoryName ?? "related"} vacancies`}
              description="Drawn from the same category in the demonstration dataset."
            />
            <div className="mt-7">
              <JobGrid jobs={similar.map(toJobCardData)} columns={3} compact signedIn={Boolean(session)} />
            </div>
          </div>
        ) : null}
      </PageContainer>
    </>
  );
}
