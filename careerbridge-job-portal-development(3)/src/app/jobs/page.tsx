import { JobsView } from "@/components/jobs-view";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find Jobs",
  description:
    "Search every demonstration vacancy on CareerBridge: local part-time, remote and IT, fresher friendly and inclusive roles across Bangladesh.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Find jobs"
        title="All opportunities in one search"
        description="Keyword search across job titles, employers, skills and locations, with filters for pay, hours, work arrangement, education and accessibility information. Every filter changes the results list."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">Keyword search</Badge>
            <Badge tone="neutral">8 divisions</Badge>
            <Badge tone="success">Demo dataset</Badge>
          </div>
        }
      />
      <PageContainer className="py-8 sm:py-10">
        <JobsView searchParams={searchParams} basePath="/jobs" mode="all" />
      </PageContainer>
    </>
  );
}
