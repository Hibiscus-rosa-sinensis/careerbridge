import Link from "next/link";
import { JobsView } from "@/components/jobs-view";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge, Panel } from "@/components/ui";
import { ACCESSIBILITY_FACILITIES } from "@/lib/constants";
import { Accessibility, CheckCircle2, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Disability-Inclusive Jobs",
  description:
    "Job listings where employers have described accessibility facilities and accommodations, with remote and flexible working filters.",
};

export default async function InclusiveJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Inclusive jobs"
        title="Accessible work, shown exactly as employers described it"
        description="This page filters the same demonstration dataset for vacancies that carry accessibility information, remote work or flexible hours. Nothing is estimated or assumed: if an employer has not said something, CareerBridge shows nothing."
        tone="canvas"
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Employer-reported only
            </Badge>
            <Badge tone="accent">Remote & flexible filters</Badge>
          </div>
        }
      >
        <div className="mt-5 flex flex-wrap gap-2 text-[0.78rem]">
          {ACCESSIBILITY_FACILITIES.slice(0, 8).map((f) => (
            <span key={f.value} className="inline-flex items-center gap-1.5 rounded-lg border border-line-200 bg-white px-2.5 py-1.5 font-semibold text-ink-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-700" aria-hidden="true" />
              {f.label}
            </span>
          ))}
        </div>
      </PageHeader>

      <PageContainer className="py-8 sm:py-10">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Panel className="md:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-[0.98rem] font-bold text-ink-900">
              <Accessibility className="h-4 w-4 text-brand-500" aria-hidden="true" />
              Set your preferences once, use them everywhere
            </h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-500">
              Your job seeker profile has an optional accessibility section. It is used only to filter and highlight
              listings — it is never used to judge your ability, and no medical information is ever requested.
              Employers only see the accommodation you choose to mention in an application note.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/profile?focus=accessibility"
                className="inline-flex items-center gap-2 rounded-[10px] bg-brand-500 px-4 py-2.5 text-[0.85rem] font-semibold text-white hover:bg-brand-600"
              >
                Edit accessibility preferences
              </Link>
              <Link
                href="/accessibility"
                className="inline-flex items-center gap-2 rounded-[10px] border border-line-300 bg-white px-4 py-2.5 text-[0.85rem] font-semibold text-ink-700 hover:border-ink-300"
              >
                Site accessibility statement
              </Link>
              <Link
                href="/guidance/asking-for-workplace-accommodations"
                className="inline-flex items-center gap-2 rounded-[10px] border border-line-300 bg-white px-4 py-2.5 text-[0.85rem] font-semibold text-ink-700 hover:border-ink-300"
              >
                Guide: asking for an accommodation
              </Link>
            </div>
          </Panel>
          <Panel className="bg-canvas">
            <h2 className="font-display text-[0.98rem] font-bold text-ink-900">What “no data” means</h2>
            <ul className="mt-3 space-y-2 text-[0.83rem] leading-relaxed text-ink-600">
              <li>· A job without an accessibility badge simply has no reported information.</li>
              <li>· It does not mean the workplace is inaccessible.</li>
              <li>· Ask the employer through the application note — it is always allowed.</li>
            </ul>
          </Panel>
        </div>

        <JobsView searchParams={searchParams} basePath="/jobs/inclusive" mode="inclusive" />
      </PageContainer>
    </>
  );
}
