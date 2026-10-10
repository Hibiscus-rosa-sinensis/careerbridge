import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { Building2, CheckCircle2, ListChecks, Plus, Briefcase } from "lucide-react";
import { ApplicantList, CompanyProfileForm, EmployerJobList, type EmployerApplication, type EmployerJob } from "@/components/employer-parts";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge, ButtonLink, Notice, Panel, Stat } from "@/components/ui";
import { db } from "@/db";
import { applications, companies, cvDocuments, jobs, seekerProfiles, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { EDUCATION_LEVELS, EXPERIENCE_LEVELS, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Employer dashboard" };

const TABS = [
  { key: "jobs", label: "Active vacancies", icon: Briefcase },
  { key: "closed", label: "Closed & drafts", icon: ListChecks },
  { key: "applications", label: "Applications", icon: CheckCircle2 },
  { key: "company", label: "Company profile", icon: Building2 },
];

export default async function EmployerDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole("employer", "/employer/dashboard");
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "jobs";
  const jobFilter = typeof sp.job === "string" ? Number(sp.job) : null;

  const [company, jobRows, userRow] = await Promise.all([
    db.select().from(companies).where(eq(companies.ownerId, session.id)).limit(1).then((r) => r[0]),
    db
      .select()
      .from(jobs)
      .where(eq(jobs.employerId, session.id))
      .orderBy(desc(jobs.postedAt)),
    db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, session.id)).limit(1).then((r) => r[0]),
  ]);

  const [appRows] = await Promise.all([
    company
      ? db
          .select({ application: applications, profile: seekerProfiles, cv: cvDocuments.content })
          .from(applications)
          .innerJoin(jobs, eq(applications.jobId, jobs.id))
          .leftJoin(seekerProfiles, eq(seekerProfiles.userId, applications.userId))
          .leftJoin(cvDocuments, eq(cvDocuments.userId, applications.userId))
          .where(eq(jobs.employerId, session.id))
          .orderBy(desc(applications.appliedAt))
      : Promise.resolve([]),
  ]);

  const rows = appRows as Array<{
    application: typeof applications.$inferSelect;
    profile: typeof seekerProfiles.$inferSelect | null;
    cv: unknown;
  }>;

  const applicantIds = Array.from(new Set(rows.map((r) => r.application.userId)));
  const applicantProfiles = applicantIds.length
    ? await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(inArray(users.id, applicantIds))
    : [];
  const nameById = new Map(applicantProfiles.map((u) => [u.id, u.name]));

  const items: EmployerApplication[] = rows
    .filter((r) => (jobFilter ? r.application.jobId === jobFilter : true))
    .map((r) => ({
      id: r.application.id,
      jobId: r.application.jobId,
      jobTitle: r.application.jobTitle,
      contactName: r.application.contactName,
      contactEmail: r.application.contactEmail,
      contactPhone: r.application.contactPhone,
      coverNote: r.application.coverNote,
      status: r.application.status,
      appliedAt: r.application.appliedAt ? new Date(r.application.appliedAt).toISOString() : null,
      interviewAt: r.application.interviewAt ? new Date(r.application.interviewAt).toISOString() : null,
      interviewMode: r.application.interviewMode,
      employerNotes: r.application.employerNotes,
      applicantName: nameById.get(r.application.userId) ?? null,
      skills: r.profile?.skills ?? [],
      education: labelFor(EDUCATION_LEVELS, r.profile?.educationLevel),
      experience: labelFor(EXPERIENCE_LEVELS, r.profile?.experienceLevel),
      location: [r.profile?.district, r.profile?.division].filter(Boolean).join(", ") || null,
      availability: r.profile?.availability ?? null,
      cv: r.cv ?? null,
    }));

  const withCounts: EmployerJob[] = jobRows.map((j) => ({
    id: j.id,
    reference: j.reference,
    title: j.title,
    status: j.status,
    employmentType: j.employmentType,
    workMode: j.workMode,
    district: j.district,
    division: j.division,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    salaryPeriod: j.salaryPeriod,
    deadline: j.deadline,
    applications: rows.filter((r) => r.application.jobId === j.id).length,
    interviews: rows.filter((r) => r.application.jobId === j.id && r.application.status === "interview").length,
  }));

  const active = withCounts.filter((j) => j.status === "published");
  const closed = withCounts.filter((j) => j.status !== "published");
  const selectedJob = jobFilter ? jobRows.find((j) => j.id === jobFilter) : undefined;

  return (
    <>
      <PageHeader
        tone="ink"
        eyebrow="Employer portal"
        title={company ? company.name : "Your company profile"}
        description={
          company
            ? `${company.industry || "Employer"} · ${[company.district, company.division].filter(Boolean).join(", ") || "Location not set"} · signed in as ${userRow?.email ?? ""}`
            : "Add your company details first — applicants see this information on every vacancy you publish."
        }
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent" className="border-white/15 bg-white/10 text-brand-200">
              {active.length} live vacancy{active.length === 1 ? "" : "s"}
            </Badge>
            <ButtonLink href="/employer/jobs/new" size="md">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Post a vacancy
            </ButtonLink>
          </div>
        }
      />

      <PageContainer className="py-8 sm:py-10">
        {sp.saved === "1" ? (
          <Notice tone="success" className="mb-5" title="Saved">
            Your vacancy is stored. Public listings are refreshed — the demonstration badge stays visible on every
            sample record.
          </Notice>
        ) : null}
        {sp.welcome === "1" ? (
          <Notice tone="info" className="mb-5" title="Welcome to the employer portal">
            Two steps: confirm your company profile, then post your first vacancy. Applicants will appear in the
            Applications tab as soon as someone sends a note.
          </Notice>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat value={active.length} label="Published" hint="Visible in search results" />
          <Stat value={closed.length} label="Closed or draft" />
          <Stat value={items.length} label="Applications received" />
          <Stat
            value={items.filter((a) => a.status === "interview").length}
            label="In interview"
            hint="Across your vacancies"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5 border-b border-line-200 pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <Link
                key={t.key}
                href={`/employer/dashboard?tab=${t.key}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-t-lg border-b-2 px-3.5 py-2.5 text-[0.85rem] font-bold transition-colors",
                  isActive
                    ? "border-brand-500 bg-brand-50/60 text-brand-700"
                    : "border-transparent text-ink-500 hover:bg-canvas hover:text-ink-900",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t.label}
                {t.key === "applications" ? (
                  <span className="rounded bg-line-100 px-1.5 text-[0.72rem] text-ink-500">{items.length}</span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === "jobs" ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-[1.1rem] font-bold text-ink-900">Published vacancies</h2>
                <ButtonLink href="/employer/jobs/new" size="sm" variant="outline">
                  Post another
                </ButtonLink>
              </div>
              <EmployerJobList jobs={active} filter="active" />
            </>
          ) : tab === "closed" ? (
            <>
              <h2 className="mb-4 font-display text-[1.1rem] font-bold text-ink-900">Closed listings and drafts</h2>
              <EmployerJobList jobs={closed} filter="closed" />
            </>
          ) : tab === "applications" ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[1.1rem] font-bold text-ink-900">
                    {selectedJob ? `Applicants for “${selectedJob.title}”` : "All applications"}
                  </h2>
                  <p className="mt-1 text-[0.84rem] text-ink-500">
                    You only see applications submitted to your own vacancies. Private applicant notes are never
                    included — only what the applicant wrote to you.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/employer/dashboard?tab=applications" className={cn("rounded-lg border px-3 py-2 text-[0.8rem] font-semibold", !jobFilter ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line-300 bg-white text-ink-600")}>
                    All vacancies
                  </Link>
                  {active.slice(0, 4).map((j) => (
                    <Link
                      key={j.id}
                      href={`/employer/dashboard?tab=applications&job=${j.id}`}
                      className={cn("rounded-lg border px-3 py-2 text-[0.8rem] font-semibold", jobFilter === j.id ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line-300 bg-white text-ink-600 hover:border-ink-300")}
                    >
                      {j.title.length > 26 ? `${j.title.slice(0, 26)}…` : j.title}
                      <span className="ml-1.5 text-ink-400">{j.applications}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <ApplicantList applications={items} jobTitle={selectedJob?.title} />
            </>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-[1.1rem] font-bold text-ink-900">Company profile</h2>
                {company?.isDemo ? <Badge tone="warn">Seeded demo profile</Badge> : null}
              </div>
              <CompanyProfileForm company={company ?? null} />
            </>
          )}
        </div>

        <Panel className="mt-8 bg-canvas">
          <p className="text-[0.82rem] leading-relaxed text-ink-500">
            <span className="font-bold text-ink-800">Permissions in this build: </span>
            an employer account can read and change only the vacancies it owns and the applications attached to them.
            Attempts to edit another company's post return a 403 and nothing is written. Job seekers' private tracker
            notes are stored per account and are not exposed by any employer endpoint.
          </p>
        </Panel>
      </PageContainer>
    </>
  );
}
