import { PageContainer } from "@/components/page-shell";
import { JobGrid } from "@/components/job-list";
import { ButtonLink, EmptyState, Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getSavedJobs } from "@/lib/jobs";
import { toJobCardData } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export const metadata = { title: "Saved jobs" };

export default async function SavedJobsPage() {
  const session = await requireRole("jobseeker", "/dashboard/saved");
  const saved = await getSavedJobs(session.id);

  return (
    <div className="space-y-5">
      <Panel>
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-600">Dashboard</p>
        <h1 className="mt-2 font-display text-[1.5rem] font-extrabold text-ink-900">Saved jobs</h1>
        <p className="mt-1.5 max-w-2xl text-[0.88rem] leading-relaxed text-ink-500">
          {saved.length
            ? `${saved.length} ${saved.length === 1 ? "vacancy is" : "vacancies are"} waiting for a decision. Use the filled bookmark to remove one; the bookmark button on any card also works.`
            : "Nothing saved yet. Bookmark any job card and it appears here — even after you close the browser."}
        </p>
      </Panel>

      {saved.length ? (
        <JobGrid jobs={saved.map(toJobCardData)} savedIds={saved.map((s) => s.id)} signedIn columns={2} />
      ) : (
        <EmptyState
          title="No saved jobs yet"
          description="Saving is free and private. It is handy for jobs you want to think about, or finish your CV for first."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink href="/jobs" size="sm">
                Browse vacancies
              </ButtonLink>
              <ButtonLink href="/jobs/local" size="sm" variant="outline">
                Local part-time
              </ButtonLink>
            </div>
          }
        />
      )}
    </div>
  );
}
