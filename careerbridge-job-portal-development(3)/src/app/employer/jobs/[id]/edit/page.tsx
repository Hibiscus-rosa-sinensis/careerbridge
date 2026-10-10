import { notFound, redirect } from "next/navigation";
import { JobForm, jobToFormValues } from "@/components/job-form";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getCategories, getJobDetail } from "@/lib/jobs";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit vacancy" };

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("employer", "/employer/dashboard");
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) notFound();

  const job = await getJobDetail(jobId, true);
  if (!job) notFound();
  if (job.employerId !== session.id) {
    // Permission denied: another company's post is never shown or editable.
    redirect("/employer/dashboard?denied=1");
  }

  const [company, categories] = await Promise.all([
    db.select().from(companies).where(eq(companies.ownerId, session.id)).limit(1).then((r) => r[0]),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title={`Edit: ${job.title}`}
        description="Changes save immediately and are reflected in search, matching and any application already received."
        aside={<Badge tone={job.status === "published" ? "success" : "warn"}>Currently {job.status}</Badge>}
      />
      <PageContainer className="py-8 sm:py-10">
        <div className="max-w-4xl">
          <JobForm
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            jobId={job.id}
            companyName={company?.name ?? null}
            initial={{ ...jobToFormValues(job as unknown as Record<string, unknown>), category: job.categorySlug ?? "" }}
          />
        </div>
      </PageContainer>
    </>
  );
}
