import Link from "next/link";
import { JobsView } from "@/components/jobs-view";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui";
import { Code2, Laptop, Megaphone, Palette, Headset } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Remote & IT Jobs",
  description:
    "Remote, hybrid and on-site technology roles in Bangladesh: web and backend development, software engineering, UI/UX and graphic design, digital marketing and IT support.",
};

const TRACKS = [
  { icon: <Code2 className="h-4 w-4" />, label: "Web & Frontend", href: "/jobs?cat=web-development" },
  { icon: <Laptop className="h-4 w-4" />, label: "Backend & Software", href: "/jobs?cat=software-engineering" },
  { icon: <Palette className="h-4 w-4" />, label: "UI/UX & Design", href: "/jobs?cat=design" },
  { icon: <Megaphone className="h-4 w-4" />, label: "Digital Marketing", href: "/jobs?cat=digital-marketing" },
  { icon: <Headset className="h-4 w-4" />, label: "IT Support", href: "/jobs?cat=it-support" },
];

export default async function RemoteJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Remote & IT"
        title="Work-from-home, hybrid and technology roles"
        description="Filter by remote, hybrid or on-site, by employment type, by experience level and by the skills you already have. Salary and deadline are shown only when the employer provided them."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">Remote · Hybrid · On-site</Badge>
            <Badge tone="accent">Skill based search</Badge>
          </div>
        }
      >
        <ul className="mt-5 flex flex-wrap gap-2">
          {TRACKS.map((t) => (
            <li key={t.label}>
              <a
                href={t.href}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line-200 bg-white px-2.5 py-1.5 text-[0.78rem] font-semibold text-ink-600 transition-colors hover:border-brand-200 hover:text-brand-600"
              >
                <span className="text-brand-500" aria-hidden="true">
                  {t.icon}
                </span>
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </PageHeader>

      <PageContainer className="py-8 sm:py-10">
        <JobsView
          searchParams={searchParams}
          basePath="/jobs/remote"
          mode="remote"
          showAside={
            <div className="cb-panel p-5">
              <h2 className="font-display text-[0.95rem] font-bold text-ink-900">How the skill filter works</h2>
              <p className="mt-2 text-[0.83rem] leading-relaxed text-ink-500">
                Type a skill in the keyword box — for example <span className="font-semibold text-ink-700">React</span>,{" "}
                <span className="font-semibold text-ink-700">Figma</span> or{" "}
                <span className="font-semibold text-ink-700">networking</span>. The search looks inside job titles,
                company names, locations and the required and preferred skill lists of each vacancy.
              </p>
              <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[0.78rem] leading-relaxed text-ink-500">
                Prefer a ranked list instead?{" "}
                <Link href="/career-tools/matching" className="font-semibold text-brand-600 hover:underline">
                  Smart job matching
                </Link>{" "}
                scores every open role against your profile and shows the gaps.
              </p>
            </div>
          }
        />
      </PageContainer>
    </>
  );
}
