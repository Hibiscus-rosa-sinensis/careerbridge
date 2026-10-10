import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  HandHeart,
  Lock,
  Plus,
  Users,
} from "lucide-react";
import { DemoNotice, PageContainer, PageHeader, Section } from "@/components/page-shell";
import { Badge, ButtonLink, Panel, SectionHeading, Stat } from "@/components/ui";
import { searchJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "For Employers",
  description:
    "Post local part-time and remote vacancies, manage applicants and describe the accessibility of your workplace.",
};

const STEPS = [
  { icon: <Building2 className="h-5 w-5" />, title: "Register the company", body: "Name, industry, area and a short description. No subscription, no card, and no verification claims we cannot back up." },
  { icon: <Plus className="h-5 w-5" />, title: "Publish a vacancy", body: "Category, employment type, pay range, hours, upazila or district, required and preferred skills, deadline — plus accessibility details if you provide them." },
  { icon: <Users className="h-5 w-5" />, title: "Read applicants, not rankings", body: "Each application shows the candidate's note, their profile skills and the CV they saved. CareerBridge does not score or rank applicants for you." },
  { icon: <ClipboardList className="h-5 w-5" />, title: "Move people forward", body: "Under review → shortlisted → interview → offer, with an internal note on each. Applicants see status changes in their own tracker." },
];

export default async function EmployersPage() {
  const { total } = await searchJobs({ perPage: 1 });

  return (
    <>
      <PageHeader
        tone="ink"
        eyebrow="For employers"
        title="Hire for a shift, an internship or a remote role — in one place"
        description="CareerBridge was designed for the two hardest parts of local hiring: reaching students and part-time seekers near your business, and describing flexible or accessible work clearly enough that the right people apply."
        aside={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/auth/register?role=employer" size="md">
              Create employer account
            </ButtonLink>
            <ButtonLink href="/employer/dashboard" variant="outline" size="md" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
              Employer dashboard
            </ButtonLink>
          </div>
        }
      />

      <Section ariaLabel="Employer workflow">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="Four steps, no sales call"
              description="The employer portal is the same interface for a five-person café and a distributed software team."
            />
            <ol className="mt-7 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl border border-line-200 bg-white p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600" aria-hidden="true">
                    {s.icon}
                  </span>
                  <div>
                    <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink-300">Step {i + 1}</p>
                    <h3 className="font-display text-[1rem] font-bold text-ink-900">{s.title}</h3>
                    <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-500">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <Panel className="bg-canvas">
              <h3 className="font-display text-[1rem] font-bold text-ink-900">What your listing shows candidates</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Job title, your company name and the work location or remote flag",
                  "Pay range with its period — per day, per hour, per project or per month",
                  "Working hours and shift pattern, and whether times can move",
                  "Required skills separately from preferred skills",
                  "Accessibility facilities you confirmed, and interview accommodations",
                  "Application deadline, or an explicit “no deadline published”",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-[0.86rem] leading-relaxed text-ink-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="space-y-3">
              <h3 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
                <HandHeart className="h-4.5 w-4.5 text-teal-600" aria-hidden="true" />
                Accessibility details, your words
              </h3>
              <p className="text-[0.86rem] leading-relaxed text-ink-500">
                Tick what exists — ramp, lift, accessible toilet, quiet space, assistive software, written interview,
                extra time. Anything you leave unticked is simply shown as “not recorded”, never as a failure. You are
                never asked for anything about a candidate's disability.
              </p>
              <Link href="/jobs/inclusive" className="inline-flex items-center gap-1.5 text-[0.84rem] font-bold text-brand-600 hover:underline">
                See how inclusive listings look to candidates
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Panel>
          </div>
        </div>
      </Section>

      <Section tone="canvas" ariaLabel="Employer promises">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: <Lock className="h-5 w-5" />, title: "Applicant data stays scoped", body: "Your account reads only applications to your own vacancies. Other employers see nothing of yours." },
            { icon: <BadgeCheck className="h-5 w-5" />, title: "Honest labelling", body: "Listings built from the project dataset carry a visible demonstration badge; your own posts say “your company post”." },
            { icon: <Users className="h-5 w-5" />, title: "No hidden scoring", body: "Matching is candidate-side and fully explained. You get the applicant's own words and profile, not an opaque ranking." },
          ].map((c) => (
            <Panel key={c.title}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-line-200" aria-hidden="true">
                {c.icon}
              </span>
              <h3 className="mt-3 font-display text-[1rem] font-bold text-ink-900">{c.title}</h3>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-500">{c.body}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section ariaLabel="Pricing and start">
        <div className="grid items-center gap-8 rounded-3xl border border-line-200 bg-ink-900 p-8 text-white sm:p-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Badge tone="accent" className="border-white/15 bg-white/10 text-brand-200">
              Project build
            </Badge>
            <h2 className="mt-4 font-display text-[1.7rem] font-extrabold leading-tight">
              Post to a dataset of {total} demonstration vacancies
            </h2>
            <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-ink-200">
              Employer posting is fully wired to this project's PostgreSQL database: create, edit, publish, close and
              delete your own listings, and manage the applications they receive. There is no payment, no ad
              promotion and no verified-employer badge, because this build does not have a real backend process behind
              those claims.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/auth/register?role=employer" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-[0.9rem] font-bold text-white hover:bg-brand-600">
                Create employer account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/auth/signin?next=/employer/dashboard" className="inline-flex items-center rounded-xl border border-white/25 px-5 py-3 text-[0.9rem] font-semibold text-white hover:bg-white/10">
                Sign in to the demo employer account
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat value={total} label="Listings in dataset" />
            <Stat value="8" label="Divisions covered" />
            <Stat value="0" label="Posting fees" />
            <Stat value="403" label="Cross-company edits blocked" />
          </div>
        </div>
        <DemoNotice className="mt-4">
          The employer accounts in this project are for evaluation. Sign in with hr@nexa.dev / Employer123 to see the
          dashboard with seeded vacancies and applicants.
        </DemoNotice>
      </Section>
    </>
  );
}
