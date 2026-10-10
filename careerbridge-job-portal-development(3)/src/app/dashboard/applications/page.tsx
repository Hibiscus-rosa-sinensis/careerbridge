import { desc, eq } from "drizzle-orm";
import { ApplicationsTracker, type TrackerApplication } from "@/components/applications-tracker";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Application tracking",
  description: "Track every job application: status, interview dates and private notes.",
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole("jobseeker", "/dashboard/applications");
  const sp = await searchParams;
  const justApplied = sp.applied === "1";

  const rows = await db
    .select({ application: applications, job: { status: jobs.status } })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.userId, session.id))
    .orderBy(desc(applications.appliedAt));

  const items: TrackerApplication[] = rows.map(({ application: a, job }) => ({
    id: a.id,
    jobId: a.jobId,
    jobTitle: a.jobTitle,
    companyName: a.companyName,
    jobReference: a.jobReference,
    status: a.status,
    appliedAt: a.appliedAt ? new Date(a.appliedAt).toISOString() : null,
    updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : null,
    interviewAt: a.interviewAt ? new Date(a.interviewAt).toISOString() : null,
    interviewMode: a.interviewMode,
    privateNotes: a.privateNotes,
    coverNote: a.coverNote,
    contactName: a.contactName,
    contactEmail: a.contactEmail,
    contactPhone: a.contactPhone,
    jobStatus: job?.status ?? "published",
  }));

  return (
    <>
      {justApplied ? (
        <div className="mb-5">
          <Badge tone="success" className="w-full justify-center py-2">
            Application recorded — it now shows in your tracker with the status “Applied”.
          </Badge>
        </div>
      ) : null}
      <PageContainer className="py-0">
        <PageHeaderInline />
        <div className="pb-10">
          <ApplicationsTracker applications={items} />
        </div>
      </PageContainer>
    </>
  );
}

function PageHeaderInline() {
  return (
    <header className="mb-6 border-b border-line-200 pb-5">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-600">Career tools</p>
      <h1 className="mt-2 font-display text-[1.6rem] font-extrabold text-ink-900">Application tracking</h1>
      <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-ink-500">
        Every application you send through CareerBridge is listed here. Update the status when the employer contacts
        you, log interview times, and keep notes only you can read. “No Response Yet” is not a rejection — it just
        means nobody has answered.
      </p>
    </header>
  );
}
