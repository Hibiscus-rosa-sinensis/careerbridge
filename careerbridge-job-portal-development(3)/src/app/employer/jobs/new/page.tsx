import { JobForm } from "@/components/job-form";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Notice } from "@/components/ui";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { getCategories } from "@/lib/jobs";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Post a vacancy" };

export default async function NewJobPage() {
  const session = await requireRole("employer", "/employer/jobs/new");
  const [company, categories] = await Promise.all([
    db.select().from(companies).where(eq(companies.ownerId, session.id)).limit(1).then((r) => r[0]),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title="Post a local or remote vacancy"
        description="Fields marked with an asterisk are required. Everything else you skip simply shows as “not specified” to applicants — CareerBridge never fills in pay, hours or accessibility details for you."
      />
      <PageContainer className="py-8 sm:py-10">
        {!company ? (
          <Notice tone="warn" className="mb-5" title="Add your company profile first">
            Your account has no company record yet. A name is enough — applicants need to see who is hiring.
          </Notice>
        ) : null}
        <div className="max-w-4xl">
          <JobForm
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            companyName={company?.name ?? null}
          />
        </div>
      </PageContainer>
    </>
  );
}
