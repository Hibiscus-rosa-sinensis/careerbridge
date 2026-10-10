import { AlertTriangle, CheckCircle2, Database, Github, PlayCircle } from "lucide-react";
import Link from "next/link";
import { PageContainer, PageHeader, Section } from "@/components/page-shell";
import { Badge, ButtonLink, Panel } from "@/components/ui";

export const metadata = {
  title: "Demo data & setup status",
  description: "Which CareerBridge features are functional, which use demonstration data, and what still needs configuration.",
};

const DONE = [
  ["Homepage, navigation, mobile menu, footer", "Server-rendered, every navigation item resolves to a real page."],
  ["Find Jobs search + filters + pagination", "Keyword search across title, company, skills and location; division, district, upazila, employment type, work arrangement, experience, education, salary and quick switches; 9 per page."],
  ["Local part-time page", "Scoped to part-time, temporary and shift roles in local categories. Location filters work only where the record has location data."],
  ["Remote & IT page", "Scoped to technology categories with remote / hybrid / on-site, employment type, experience and skill keyword filters."],
  ["Job detail pages", "Each /jobs/[id] renders from the database, including skills, pay, hours, deadline, accessibility info and instructions."],
  ["Apply workflow", "Validated form, duplicate-application guard, deadline and closed-listing checks, recorded in the tracker."],
  ["Save job", "Toggle for signed-in users, works from cards, detail page and the saved list."],
  ["Accounts, sign in, sign out, password recovery", "bcrypt hashing, httpOnly signed session cookie, role-based dashboards, token-based reset (7 days → 30 minute link)."],
  ["CV hub (no AI)", "4 templates, form-based editing, add / remove / reorder sections, hide sections, live preview, browser + account storage, JSON backup, print-to-PDF."],
  ["Smart job matching", "Rule-based weighted score with matched skills, gaps and per-factor explanation; weights published on the page."],
  ["Application tracking", "7 statuses, private notes, interview date, status filters, upcoming interviews, remove record."],
  ["Employer portal", "Register/login, company profile, create / edit / publish / close / delete own vacancies, applicant list with profile + saved CV, status management."],
  ["Permissions", "Employer endpoints check ownership before write or read; other companies' posts return 403; job seeker notes are never exposed."],
  ["Accessibility features", "Skip link, landmarks, labelled controls, visible focus, aria-live statuses, reduced-motion support, keyboard-operable filters and forms."],
];

const PARTIAL = [
  ["Passwords reset link", "No mail provider is configured, so the generated link is displayed on screen instead of emailed. Add SMTP (or Resend/SendGrid) and send `resetLink` to the address."],
  ["CV delivery to employers", "Employers view the CV saved in your CareerBridge account. There is no file upload, so a CV written elsewhere cannot be attached — paste the content into the editor instead."],
  ["Employer verification", "Deliberately absent. Nothing in this build verifies that a company is real, so no listing claims a “verified employer”."],
  ["Real job availability", "All vacancies are demonstration records with a visible Demo badge. Only listings you post from an employer account are live in your own database."],
  ["Messaging / chat", "Not implemented by design — contact happens through the email or phone the applicant submits, exactly as a small employer would expect."],
];

const SETUP = [
  ["Database", "PostgreSQL + Drizzle ORM. npx drizzle-kit push applies src/db/schema.ts; node scripts/seed.mjs loads the demonstration dataset (34 vacancies, 18 companies, 12 categories, 10 guides, accounts, applications)."],
  ["Environment", "DATABASE_URL (required) and AUTH_SECRET (set this to any 32+ character string for production; a development fallback is used when it is missing)."],
  ["Demo logins", "seeker@careerbridge.dev / Seeker1234 · hr@nexa.dev / Employer123 — seeded only, so change them if you deploy the database anywhere public."],
  ["No external keys", "There is no AI, map, payment or email provider dependency. Nothing in the app requires a secret to function."],
];

export default function ProjectStatusPage() {
  return (
    <>
      <PageHeader
        eyebrow="Honest status"
        title="What works, what is demonstration data, what still needs setup"
        description="A student project should not pretend. This page lists the implemented journeys, the parts that are intentionally simplified, and the configuration a real deployment would need."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">14 working feature areas</Badge>
            <Badge tone="warn">5 intentional simplifications</Badge>
          </div>
        }
      />

      <PageContainer className="py-8 sm:py-10">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="flex items-center gap-2 font-display text-[1.05rem] font-bold text-ink-900">
              <CheckCircle2 className="h-4.5 w-4.5 text-green-700" aria-hidden="true" />
              Completed and functional
            </h2>
            <ul className="mt-4 divide-y divide-line-100">
              {DONE.map(([title, body]) => (
                <li key={title} className="py-2.5">
                  <p className="text-[0.88rem] font-bold text-ink-900">{title}</p>
                  <p className="mt-0.5 text-[0.83rem] leading-relaxed text-ink-500">{body}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <h2 className="flex items-center gap-2 font-display text-[1.05rem] font-bold text-ink-900">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600" aria-hidden="true" />
                Simplified on purpose
              </h2>
              <ul className="mt-4 space-y-3">
                {PARTIAL.map(([title, body]) => (
                  <li key={title}>
                    <p className="text-[0.88rem] font-bold text-ink-900">{title}</p>
                    <p className="mt-0.5 text-[0.83rem] leading-relaxed text-ink-500">{body}</p>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel className="bg-canvas">
              <h2 className="flex items-center gap-2 font-display text-[1.05rem] font-bold text-ink-900">
                <Database className="h-4.5 w-4.5 text-brand-500" aria-hidden="true" />
                Running it
              </h2>
              <ul className="mt-3 space-y-2.5">
                {SETUP.map(([k, v]) => (
                  <li key={k} className="text-[0.84rem] leading-relaxed text-ink-600">
                    <span className="font-bold text-ink-900">{k}: </span>
                    {v}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href="/jobs" size="sm" variant="outline">
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  Test the search
                </ButtonLink>
                <ButtonLink href="/career-tools/cv" size="sm" variant="outline">
                  Test the CV export
                </ButtonLink>
                <ButtonLink href="/auth/signin?next=/employer/dashboard" size="sm" variant="outline">
                  Test the employer portal
                </ButtonLink>
              </div>
            </Panel>
          </div>
        </div>
      </PageContainer>

      <Section tone="canvas" ariaLabel="Data model">
        <h2 className="font-display text-[1.2rem] font-bold text-ink-900">Data model behind the pages</h2>
        <p className="mt-1.5 max-w-3xl text-[0.88rem] leading-relaxed text-ink-500">
          Nine tables in PostgreSQL, defined in <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.8rem]">src/db/schema.ts</code>{" "}
          with foreign keys and indexes on the columns search actually filters.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["users", "One table, role = jobseeker | employer. Hashed password, reset token and expiry."],
            ["seeker_profiles", "Education, skills, preferences, availability and optional accessibility needs — 1:1 with a job seeker."],
            ["companies", "Owner-scoped employer profile, including the accessibility text shown publicly."],
            ["job_categories", "12 categories with icon and group (local / remote / general)."],
            ["jobs", "Vacancy with pay, hours, location levels, jsonb skill and facility arrays, status and deadline."],
            ["saved_jobs", "Unique (user, job) — powers the saved list and card bookmarks."],
            ["applications", "Snapshot of title/company plus contact, note, status, interview time, private and employer notes."],
            ["cv_documents", "One CV per account: template key, layout settings and all content as jsonb."],
            ["guidance_resources", "Guides by track and level with structured sections — the library is data, not hardcoded copy."],
          ].map(([table, note]) => (
            <div key={table} className="rounded-xl border border-line-200 bg-white p-4">
              <p className="font-mono text-[0.82rem] font-bold text-brand-600">{table}</p>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-500">{note}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[0.84rem] leading-relaxed text-ink-500">
          Supabase was not used: this environment provides PostgreSQL directly, so the project keeps authentication,
          authorisation and queries in first-party code (Next.js route handlers, bcrypt and a signed httpOnly cookie).
          Read more in the repository <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.8rem]">README.md</code> or explore{" "}
          <Link href="/career-tools" className="font-semibold text-brand-600 hover:underline">
            the career tools
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
