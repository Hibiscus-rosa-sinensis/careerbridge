import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  MapPin,
  Search,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Hero } from "@/components/hero";
import { CategoryIcon } from "@/components/category-icon";
import { JobGrid } from "@/components/job-list";
import { DemoNotice, PageContainer, Section, ToolCard } from "@/components/page-shell";
import { Badge, ButtonLink, SectionHeading, Stat } from "@/components/ui";
import { getCategories, getStats, searchJobs } from "@/lib/jobs";
import { toJobCardData } from "@/lib/serialize";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const OPPORTUNITIES = [
  {
    icon: <MapPin className="h-5 w-5" aria-hidden="true" />,
    title: "Local Part-Time Jobs",
    description:
      "Find opportunities at nearby shops, restaurants, cafés, supermarkets, coaching centres and small businesses — with hours you can plan a semester around.",
    href: "/jobs/local",
    tone: "bg-brand-50 text-brand-600 ring-brand-100",
  },
  {
    icon: <LaptopIcon />,
    title: "Remote & IT Jobs",
    description:
      "Discover work-from-home, remote, hybrid and IT-related roles: development, design, digital marketing, QA and helpdesk support.",
    href: "/jobs/remote",
    tone: "bg-blue-700/8 text-blue-700 ring-blue-700/20",
  },
  {
    icon: <GraduationCap className="h-5 w-5" aria-hidden="true" />,
    title: "Fresher Opportunities",
    description:
      "Entry-level jobs, internships and beginner-friendly openings, plus the career preparation resources that go with them.",
    href: "/jobs?entry=1",
    tone: "bg-teal-600/8 text-teal-600 ring-teal-600/20",
  },
  {
    icon: <Accessibility className="h-5 w-5" aria-hidden="true" />,
    title: "Inclusive Jobs",
    description:
      "Roles where employers have shared accessibility facilities, flexible arrangements or accommodations they provide — shown as reported, nothing assumed.",
    href: "/jobs/inclusive",
    tone: "bg-green-700/8 text-green-700 ring-green-700/20",
  },
];

function LaptopIcon() {
  return <LaptopGlyph />;
}

function LaptopGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="11" rx="1.8" />
      <path d="M2 19h20" />
    </svg>
  );
}

const STEPS = [
  { n: "01", title: "Create a free profile", body: "Add your education, skills and the areas you can work in. Employers see only what you choose to share with an application." },
  { n: "02", title: "Search or get matches", body: "Filter by division, upazila, pay and hours — or let the rule-based matcher rank open vacancies against your profile." },
  { n: "03", title: "Build a CV and apply", body: "Write a clean CV in the classic editor, export it as PDF, and send it with a short note written by you." },
  { n: "04", title: "Track every step", body: "Applied, under review, interview, offer — keep dates and private notes in one tracker until you have an answer." },
];

export default async function HomePage() {
  const [stats, featured, latest, categories, session] = await Promise.all([
    getStats(),
    searchJobs({ sort: "salary", perPage: 6, status: "published" }),
    searchJobs({ perPage: 6, openOnly: true }),
    getCategories(),
    getSessionUser(),
  ]);

  let appliedCount = 0;
  if (session?.role === "jobseeker") {
    try {
      const rows = await db
        .select({ id: applications.id })
        .from(applications)
        .where(eq(applications.userId, session.id));
      appliedCount = rows.length;
    } catch {
      appliedCount = 0;
    }
  }

  const savedIds: number[] = [];

  return (
    <>
      <Hero />

      {/* ---------------- stat strip ---------------- */}
      <div className="border-b border-line-200 bg-white">
        <PageContainer className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-4">
          <Stat value={stats.total} label="Sample vacancies" hint="Demo data" />
          <Stat value={stats.partTime} label="Part-time & shift roles" />
          <Stat value={stats.remote} label="Remote openings" />
          <Stat value={stats.accessible} label="With accessibility info" />
        </PageContainer>
      </div>

      {/* ---------------- explore opportunities ---------------- */}
      <Section tone="canvas" ariaLabel="Explore opportunities">
        <SectionHeading
          eyebrow="Explore opportunities"
          title="Four ways to start looking"
          description="Every route uses the same verified search and filter system — pick the one that matches how you need to work right now."
          action={
            <ButtonLink href="/jobs" variant="outline" size="md">
              All jobs
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          }
        />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {OPPORTUNITIES.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group flex h-full flex-col rounded-2xl border border-line-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${c.tone}`} aria-hidden="true">
                {c.icon}
              </span>
              <h3 className="mt-4 font-display text-[1.05rem] font-bold text-ink-900">{c.title}</h3>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-500">{c.description}</p>
              <span className="mt-auto pt-5 text-[0.82rem] font-bold text-brand-600">
                Explore
                <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">
                  {" →"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ---------------- featured jobs ---------------- */}
      <Section ariaLabel="Featured jobs">
        <SectionHeading
          eyebrow="Featured jobs"
          title="Sample vacancies worth a look"
          description="Selected from the demonstration listings in this project. Pay ranges and employers are examples, not live openings."
          action={<ButtonLink href="/jobs" variant="outline">Browse all jobs</ButtonLink>}
        />
        <div className="mt-8">
          <JobGrid jobs={featured.results.map(toJobCardData)} signedIn={Boolean(session)} savedIds={savedIds} compact />
        </div>
        <DemoNotice className="mt-6" />
      </Section>

      {/* ---------------- career tools ---------------- */}
      <Section tone="canvas-deep" ariaLabel="Career tools">
        <SectionHeading
          eyebrow="Career tools"
          title="Free tools that stay useful after the search"
          description="Everything here is manual and transparent: you write the words, the tool keeps the formatting, and the matcher explains its rules."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ToolCard
            icon={<FileText className="h-5 w-5" aria-hidden="true" />}
            title="CV Writing & Editing"
            description="Choose a template, fill in simple forms, reorder sections and export a clean A4 PDF. No AI rewrites your words — ever."
            href="/career-tools/cv"
            cta="Open the CV hub"
            points={["4 professional templates", "Live preview while you type", "Print-ready PDF export"]}
          />
          <ToolCard
            icon={<Target className="h-5 w-5" aria-hidden="true" />}
            title="Smart Job Matching"
            description="A transparent weighted score compares your profile with each vacancy and shows exactly why a job ranked where it did."
            href="/career-tools/matching"
            cta="See my matches"
            points={["Matched and missing skills", "Clear scoring weights", "Never rejects on one gap"]}
          />
          <ToolCard
            icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
            title="Application Tracking"
            description="Record every application, update the status, log interview dates and keep private notes only you can read."
            href="/dashboard/applications"
            cta="Open my tracker"
            points={["7 statuses including No Response Yet", "Upcoming interviews", "Notes stay private"]}
          />
        </div>
        <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl border border-line-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-600/8 text-teal-600" aria-hidden="true">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-[0.98rem] font-bold text-ink-900">Fresher Career Guidance</p>
              <p className="mt-0.5 text-[0.85rem] text-ink-500">
                Ten written guides: learning roadmaps, project ideas, interview practice and how to ask for an
                accommodation. Educational guidance, not an AI career coach.
              </p>
            </div>
          </div>
          <ButtonLink href="/guidance" variant="primary" size="sm">
            Read the guides
          </ButtonLink>
        </div>
      </Section>

      {/* ---------------- latest opportunities ---------------- */}
      <Section ariaLabel="Latest opportunities">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Latest opportunities"
              title="Most recently posted"
              description="Newest demonstration vacancies first — deadlines shown when the employer provided one."
              action={<ButtonLink href="/jobs" variant="ghost" size="sm">Load more in Find Jobs</ButtonLink>}
            />
            <div className="mt-7">
              <JobGrid jobs={latest.results.map(toJobCardData)} signedIn={Boolean(session)} columns={2} compact />
            </div>
          </div>

          <div className="lg:pt-14">
            <div className="cb-panel p-5">
              <h3 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
                <Layers className="h-4 w-4 text-brand-500" aria-hidden="true" />
                Browse by category
              </h3>
              <ul className="mt-4 divide-y divide-line-100">
                {categories.slice(0, 9).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/jobs?cat=${c.slug}`} className="group flex items-center gap-3 py-2.5">
                      <CategoryIcon name={c.icon} tone="ink" className="h-8 w-8 rounded-lg" />
                      <span className="flex-1 text-[0.85rem] font-semibold text-ink-700 group-hover:text-brand-600">
                        {c.name}
                      </span>
                      <span className="text-[0.75rem] font-bold text-ink-300">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/jobs" variant="outline" size="sm" className="mt-4 w-full">
                All {categories.length} categories
              </ButtonLink>
            </div>

            <div className="cb-panel mt-4 bg-ink-900 p-5 text-white">
              <Badge tone="accent" className="border-white/15 bg-white/10 text-brand-200">
                {session ? "Your account" : "Free account"}
              </Badge>
              <p className="mt-3 font-display text-[1.05rem] font-bold leading-snug">
                {session && session.role === "jobseeker"
                  ? appliedCount > 0
                    ? `You have ${appliedCount} application${appliedCount > 1 ? "s" : ""} in progress.`
                    : "Your application tracker is empty — start with one saved job."
                  : "Saved jobs, matches and application status live in your dashboard."}
              </p>
              <p className="mt-2 text-[0.83rem] leading-relaxed text-ink-200">
                {session && session.role === "employer"
                  ? "You are signed in with an employer account. Manage vacancies and applicant progress from the employer dashboard."
                  : "No CV upload fees, no charges to apply, and no medical information required."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {session ? (
                  <Link href={session.role === "employer" ? "/employer/dashboard" : "/dashboard"} className={buttonLinkClass()}>
                    Go to dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" className={buttonLinkClass()}>
                      Get Started
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="rounded-lg border border-white/25 px-3 py-2 text-[0.8rem] font-semibold text-white hover:bg-white/10"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------- how it works ---------------- */}
      <Section tone="canvas" ariaLabel="How CareerBridge works">
        <SectionHeading
          eyebrow="How CareerBridge works"
          title="Four steps from search to interview"
          description="The same flow works for a weekend shop shift and for a remote engineering role."
        />
        <ol className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative rounded-2xl border border-line-200 bg-white p-5">
              <span className="font-display text-[1.6rem] font-extrabold text-brand-200">{s.n}</span>
              <h3 className="mt-2 font-display text-[1rem] font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-500">{s.body}</p>
              {i < STEPS.length - 1 ? (
                <ArrowRight className="absolute -right-3 top-8 hidden h-4 w-4 text-line-400 xl:block" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.82rem] font-medium text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-700" aria-hidden="true" /> Applying is always free
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-green-700" aria-hidden="true" /> Accessibility details come from employers only
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Search className="h-4 w-4 text-green-700" aria-hidden="true" /> Filters work on every listing page
          </span>
        </div>
      </Section>

      {/* ---------------- employers ---------------- */}
      <Section ariaLabel="For employers">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="For employers"
              title="Post a vacancy in under five minutes"
              description="Shops, restaurants, coaching centres, supermarkets and tech teams use the same employer account. Publish locally, filter applicants by the skills you actually need, and record each applicant's progress."
            />
            <ul className="mt-7 space-y-3">
              {[
                { icon: <Building2 className="h-4 w-4" aria-hidden="true" />, t: "Company profile you control", d: "Industry, size, address and the accessibility facilities your workplace really provides." },
                { icon: <Briefcase className="h-4 w-4" aria-hidden="true" />, t: "Draft, publish and close", d: "Keep a vacancy as a draft, publish it, and close it the moment you have hired." },
                { icon: <Users className="h-4 w-4" aria-hidden="true" />, t: "Applicant list with progress", d: "See who applied to your jobs only, move them through review → interview → offer, and keep internal notes." },
              ].map((f) => (
                <li key={f.t} className="flex gap-3 rounded-xl border border-line-200 bg-canvas p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-line-200" aria-hidden="true">
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-[0.9rem] font-bold text-ink-900">{f.t}</p>
                    <p className="mt-0.5 text-[0.83rem] leading-relaxed text-ink-500">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <ButtonLink href="/employer/jobs/new" size="md">
                Post a job now
              </ButtonLink>
              <ButtonLink href="/employers" variant="outline" size="md">
                How the employer portal works
              </ButtonLink>
            </div>
          </div>

          {/* abstract recruitment panel */}
          <div className="relative">
            <div className="absolute -right-2 -top-4 h-32 w-32 rounded-3xl bg-brand-100/60" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-line-200 bg-canvas p-5">
              <div className="flex items-center justify-between">
                <p className="text-[0.75rem] font-bold uppercase tracking-widest text-ink-400">Employer view</p>
                <span className="rounded-md border border-line-200 bg-white px-1.5 py-0.5 text-[0.68rem] font-semibold text-ink-500">
                  Demo interface
                </span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {[
                  { name: "Evening Data Entry Operator", count: 4, stage: "2 in interview" },
                  { name: "Junior Frontend Developer (React)", count: 3, stage: "1 shortlisted" },
                  { name: "Weekend Counter Staff", count: 0, stage: "Awaiting applicants" },
                ].map((row) => (
                  <li key={row.name} className="flex items-center gap-3 rounded-xl border border-line-200 bg-white p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-canvas font-display text-[0.8rem] font-bold text-ink-600">
                      {row.count}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.85rem] font-bold text-ink-900">{row.name}</p>
                      <p className="text-[0.75rem] text-ink-400">{row.stage}</p>
                    </div>
                    <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-line-100" aria-hidden="true">
                      <span className="block h-full w-2/3 rounded-full bg-brand-500" />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "Posted", v: "34" },
                  { k: "Closed", v: "6" },
                  { k: "Divisions", v: "8" },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg border border-line-200 bg-white py-2">
                    <p className="font-display text-[1rem] font-extrabold text-ink-900">{s.v}</p>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-ink-400">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function buttonLinkClass() {
  return "inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[0.85rem] font-semibold text-white transition-colors hover:bg-brand-600";
}
