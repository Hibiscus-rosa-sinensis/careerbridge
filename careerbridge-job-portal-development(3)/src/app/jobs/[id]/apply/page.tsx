import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ApplyForm } from "@/components/apply-form";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge, ButtonLink, Notice, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { cvDocuments, users } from "@/db/schema";
import { getJobDetail } from "@/lib/jobs";
import { formatSalary, locationLine } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Apply for this job" };

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) notFound();

  const session = await requireUser(`/jobs/${jobId}/apply`);
  const user = await db.select().from(users).where(eq(users.id, session.id)).limit(1).then((r) => r[0]);
  if (!user) redirect("/auth/signin");

  const job = await getJobDetail(jobId, false);
  if (!job) notFound();

  const [cv] = await db
    .select({ template: cvDocuments.template, title: cvDocuments.title })
    .from(cvDocuments)
    .where(eq(cvDocuments.userId, session.id))
    .limit(1);

  if (user.role !== "jobseeker") {
    return (
      <PageContainer className="py-12">
        <Notice tone="warn" title="Employer accounts cannot apply for jobs">
          You are signed in as an employer. Switch to a job seeker account to apply, or manage the vacancies posted
          by your company in the{" "}
          <Link href="/employer/dashboard" className="font-semibold underline">
            employer dashboard
          </Link>
          .
        </Notice>
      </PageContainer>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Apply"
        title={`Apply: ${job.title}`}
        description="Check the details, add a short note in your own words and submit. Your application is recorded in the tracker with the status “Applied”."
        tone="canvas"
        aside={<Badge tone="muted">Demonstration vacancy</Badge>}
      />
      <PageContainer className="py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div>
            <ApplyForm
              jobId={job.id}
              jobTitle={job.title}
              companyName={job.companyName}
              defaultName={user.name}
              defaultEmail={user.email}
              defaultPhone=""
              instructions={job.applicationInstructions}
              requiredSkills={job.requiredSkills}
              hasSavedCv={Boolean(cv)}
              cvTemplate={cv?.template ?? null}
            />
          </div>

          <aside className="space-y-4">
            <Panel className="space-y-3">
              <h2 className="font-display text-[0.95rem] font-bold text-ink-900">The role you are applying for</h2>
              <dl className="space-y-2 text-[0.84rem]">
                {[
                  ["Employer", job.companyName],
                  ["Location", locationLine([job.district, job.division]) || label(job.workMode)],
                  ["Pay", formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod ?? "month")],
                  ["Hours", job.workingHours || "Not specified"],
                  ["Type", job.employmentType.replace("-", " ")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-line-100 pb-2 last:border-0">
                    <dt className="text-ink-400">{k}</dt>
                    <dd className="text-right font-semibold text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href={`/jobs/${job.id}`} variant="outline" size="sm" className="w-full">
                Re-read the full listing
              </ButtonLink>
            </Panel>

            <Panel className="bg-canvas">
              <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Before you send</h2>
              <ul className="mt-3 space-y-2 text-[0.82rem] leading-relaxed text-ink-600">
                <li>· Name the hours you can actually work.</li>
                <li>· Mention one concrete example — a shift, a project, a shop you helped in.</li>
                <li>· Ask about accessibility or flexibility if you need it; it is a normal question.</li>
                <li>· Never pay money to be considered for a job.</li>
              </ul>
            </Panel>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}

function label(mode: string) {
  return mode === "remote" ? "Remote — anywhere in Bangladesh" : mode === "hybrid" ? "Hybrid" : "On-site";
}
