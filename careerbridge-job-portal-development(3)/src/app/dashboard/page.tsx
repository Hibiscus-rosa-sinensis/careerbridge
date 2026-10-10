import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { FileText, ListChecks, Target, ArrowRight, BookmarkCheck } from "lucide-react";
import { JobGrid } from "@/components/job-list";
import { Badge, ButtonLink, EmptyState, Panel, Stat } from "@/components/ui";
import { db } from "@/db";
import { applications, cvDocuments, seekerProfiles, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { getSavedJobIds, loadJobRows } from "@/lib/jobs";
import { toJobCardData } from "@/lib/serialize";
import { rankJobs } from "@/lib/matching";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Job seeker dashboard" };

export default async function DashboardOverview() {
  const session = await requireRole("jobseeker", "/dashboard");
  const [userRow, profileRow, appRows, savedIds, pool, cvRow] = await Promise.all([
    db.select().from(users).where(eq(users.id, session.id)).limit(1).then((r) => r[0]),
    db.select().from(seekerProfiles).where(eq(seekerProfiles.userId, session.id)).limit(1).then((r) => r[0]),
    db.select().from(applications).where(eq(applications.userId, session.id)).orderBy(desc(applications.appliedAt)),
    getSavedJobIds(session.id),
    loadJobRows({ status: "published" }),
    db.select({ title: cvDocuments.title, template: cvDocuments.template, updatedAt: cvDocuments.updatedAt }).from(cvDocuments).where(eq(cvDocuments.userId, session.id)).limit(1).then((r) => r[0]),
  ]);

  const ranked = rankJobs(
    {
      skills: profileRow?.skills ?? [],
      educationLevel: profileRow?.educationLevel ?? "",
      experienceLevel: profileRow?.experienceLevel ?? "fresher",
      preferredCategories: profileRow?.preferredCategories ?? [],
      preferredLocations: profileRow?.preferredLocations ?? [],
      preferredEmploymentTypes: profileRow?.preferredEmploymentTypes ?? [],
      workMode: profileRow?.workMode ?? "any",
      salaryExpectation: profileRow?.salaryExpectation ?? 0,
    },
    pool,
    3,
  );

  const byStatus = new Map<string, number>();
  for (const a of appRows) byStatus.set(a.status, (byStatus.get(a.status) ?? 0) + 1);
  const upcoming = appRows.filter((a) => a.interviewAt && new Date(a.interviewAt).getTime() > Date.now());
  const savedPool = pool.filter((j) => savedIds.has(j.id)).slice(0, 3);
  const firstName = (userRow?.name ?? "").split(" ")[0] || "there";
  const profileReady = Boolean(profileRow?.skills?.length);

  return (
    <div className="space-y-5">
      <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge tone="accent">Job seeker account</Badge>
          <h1 className="mt-2 font-display text-[1.5rem] font-extrabold text-ink-900">Welcome back, {firstName}</h1>
          <p className="mt-1 max-w-xl text-[0.88rem] leading-relaxed text-ink-500">
            {profileReady
              ? "Your profile is ready, so matches below are scored against your real skills and preferences."
              : "Add your skills and preferred areas once, and every listing page can score matches for you."}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {profileReady ? null : (
            <ButtonLink href="/dashboard/profile" size="md">
              Complete my profile
            </ButtonLink>
          )}
          <ButtonLink href="/jobs" variant="outline" size="md">
            Find jobs
          </ButtonLink>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={appRows.length} label="Applications" hint={`${byStatus.get("interview") ?? 0} in interview`} />
        <Stat value={savedIds.size} label="Saved jobs" />
        <Stat value={upcoming.length} label="Upcoming interviews" hint={upcoming[0] ? formatDate(upcoming[0].interviewAt) : "None booked"} />
        <Stat value={cvRow ? "Ready" : "Not started"} label="CV in your account" hint={cvRow ? `${cvRow.template} template` : "Open the CV hub"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel padded={false} className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
              <Target className="h-4 w-4 text-brand-500" aria-hidden="true" />
              Best matches for you
            </h2>
            <Link href="/career-tools/matching" className="text-[0.8rem] font-bold text-brand-600 hover:underline">
              See all
            </Link>
          </div>
          {ranked.length === 0 ? (
            <p className="mt-4 text-[0.85rem] text-ink-400">No published vacancies to compare yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {ranked.map((m) => (
                <li key={m.job.id} className="flex items-center gap-3 rounded-xl border border-line-200 p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-canvas font-display text-[0.85rem] font-extrabold text-ink-800">
                    {m.score}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/jobs/${m.job.id}`} className="block truncate text-[0.88rem] font-bold text-ink-900 hover:text-brand-600">
                      {m.job.title}
                    </Link>
                    <p className="truncate text-[0.78rem] text-ink-500">{m.job.companyName}</p>
                  </div>
                  {m.missingRequired.length ? (
                    <Badge tone="warn">{m.missingRequired.length} to learn</Badge>
                  ) : (
                    <Badge tone="success">Skills covered</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel padded={false} className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
              <ListChecks className="h-4 w-4 text-brand-500" aria-hidden="true" />
              Recent applications
            </h2>
            <Link href="/dashboard/applications" className="text-[0.8rem] font-bold text-brand-600 hover:underline">
              Open tracker
            </Link>
          </div>
          {appRows.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
                title="Nothing tracked yet"
                description="Apply to any vacancy on CareerBridge and the record appears here automatically."
                action={<ButtonLink href="/jobs" size="sm" variant="outline">Browse vacancies</ButtonLink>}
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line-100">
              {appRows.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/jobs/${a.jobId ?? 0}`} className="block truncate text-[0.86rem] font-bold text-ink-900 hover:text-brand-600">
                      {a.jobTitle}
                    </Link>
                    <p className="truncate text-[0.76rem] text-ink-400">
                      {a.companyName} · applied {formatDate(a.appliedAt)}
                    </p>
                  </div>
                  <Badge tone={a.status === "offer" ? "success" : a.status === "rejected" ? "danger" : a.status === "interview" ? "accent" : "neutral"}>
                    {a.status.replace("-", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel padded={false} className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
            <BookmarkCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
            Saved jobs
          </h2>
          <Link href="/dashboard/saved" className="text-[0.8rem] font-bold text-brand-600 hover:underline">
            All saved
          </Link>
        </div>
        {savedPool.length ? (
          <div className="mt-4">
            <JobGrid jobs={savedPool.map(toJobCardData)} savedIds={[...savedIds]} signedIn columns={3} compact />
          </div>
        ) : (
          <p className="mt-3 text-[0.85rem] text-ink-500">
            Nothing saved yet. Use the bookmark button on any job card to keep it for later.
          </p>
        )}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/career-tools/cv", icon: <FileText className="h-4 w-4" />, title: "CV hub", body: cvRow ? `Last saved ${formatDate(cvRow.updatedAt)}` : "Write your first CV" },
          { href: "/career-tools/matching", icon: <Target className="h-4 w-4" />, title: "Matching", body: "See the weights behind each score" },
          { href: "/guidance", icon: <ArrowRight className="h-4 w-4" />, title: "Guidance", body: "Roadmaps and interview practice" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="group rounded-2xl border border-line-200 bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
            <span className="inline-flex items-center gap-2 text-[0.76rem] font-bold uppercase tracking-wide text-brand-600">
              {c.icon}
              {c.title}
            </span>
            <p className="mt-2 text-[0.85rem] text-ink-600">{c.body}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-[0.78rem] font-semibold text-ink-400 group-hover:text-brand-600">
              Open <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
