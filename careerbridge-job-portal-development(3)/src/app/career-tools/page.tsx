import { PageContainer, PageHeader, Section, ToolCard } from "@/components/page-shell";
import { ButtonLink, Panel } from "@/components/ui";
import { FileText, GraduationCap, ListChecks, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Career Tools",
  description: "CV writing and editing, rule-based job matching and application tracking for job seekers in Bangladesh.",
};

const PRINCIPLES = [
  {
    icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
    title: "No AI writing your words",
    body: "The CV editor is a classic form-and-template tool. It formats, orders and exports — it never generates or rewrites your content.",
  },
  {
    icon: <Target className="h-4 w-4" aria-hidden="true" />,
    title: "Matching you can audit",
    body: "Recommendations come from eight published weights. Every score shows the reason behind it, including the points you did not get.",
  },
  {
    icon: <ListChecks className="h-4 w-4" aria-hidden="true" />,
    title: "Your notes stay yours",
    body: "Private application notes are readable only by the account that wrote them. Employers see your application details, never your notes.",
  },
];

export default function CareerToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career tools"
        title="Tools for the part of job hunting nobody teaches"
        description="Write a CV you are happy to send, see how you measure up against real requirements, and keep track of who replied. All three work on their own — you do not need to use them in order."
        aside={
          <div className="flex gap-2">
            <ButtonLink href="/career-tools/cv" size="md">
              Open the CV hub
            </ButtonLink>
          </div>
        }
      />

      <Section tone="white" ariaLabel="Career tools list">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ToolCard
            icon={<FileText className="h-5 w-5" aria-hidden="true" />}
            title="CV Writing & Editing Hub"
            description="Four professional templates, plain forms, section reordering, a live preview and a print-ready PDF export."
            href="/career-tools/cv"
            cta="Start writing"
            points={["Beginner instructions included", "Two example CVs to copy the style from", "Saves to your account and this browser"]}
          />
          <ToolCard
            icon={<Target className="h-5 w-5" aria-hidden="true" />}
            title="Smart Job Matching"
            description="A weighted, rule-based comparison of your profile against every open vacancy — with matched skills and skill gaps explained."
            href="/career-tools/matching"
            cta="See my matches"
            points={["Transparent scoring table", "Missing skills are advice, not rejection", "Refresh after any profile edit"]}
          />
          <ToolCard
            icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
            title="Application Tracking"
            description="Every application in one list: status, interview dates, follow-up notes and a clear view of who has not answered yet."
            href="/dashboard/applications"
            cta="Open my tracker"
            points={["Seven statuses", "Upcoming interviews panel", "Remove a record any time"]}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-line-200 bg-canvas p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-teal-600 ring-1 ring-line-200" aria-hidden="true">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-[1rem] font-bold text-ink-900">Fresher Career Guidance</p>
              <p className="mt-1 max-w-2xl text-[0.86rem] leading-relaxed text-ink-500">
                Learning roadmaps, skills per role, project ideas, interview practice and how to ask for workplace
                accommodations — written as teaching material, not as an AI coach.
              </p>
            </div>
          </div>
          <ButtonLink href="/guidance" variant="secondary" size="md">
            Read the guidance library
          </ButtonLink>
        </div>
      </Section>

      <Section tone="canvas" ariaLabel="Tool principles">
        <div className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <Panel key={p.title}>
              <span className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[0.76rem] font-bold text-brand-600" aria-hidden="true">
                {p.icon}
                Principle
              </span>
              <h2 className="mt-3 font-display text-[1rem] font-bold text-ink-900">{p.title}</h2>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-500">{p.body}</p>
            </Panel>
          ))}
        </div>
        <p className="mt-6 text-[0.82rem] text-ink-400">
          Setup note: all three tools use this project's own PostgreSQL database — no third-party AI or paid API keys
          are required. See the{" "}
          <Link href="/project-status" className="font-semibold text-brand-600 hover:underline">
            project status page
          </Link>{" "}
          for what is live and what still needs configuration.
        </p>
      </Section>
    </>
  );
}
