import Link from "next/link";
import { Accessibility, FileText, Info, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Find work",
    links: [
      { label: "All jobs", href: "/jobs" },
      { label: "Local part-time jobs", href: "/jobs/local" },
      { label: "Remote & IT jobs", href: "/jobs/remote" },
      { label: "Fresher opportunities", href: "/jobs?entry=1" },
      { label: "Inclusive jobs", href: "/jobs/inclusive" },
    ],
  },
  {
    title: "Career tools",
    links: [
      { label: "CV writing & editing", href: "/career-tools/cv" },
      { label: "CV examples", href: "/career-tools/cv/examples" },
      { label: "Smart job matching", href: "/career-tools/matching" },
      { label: "Application tracking", href: "/dashboard/applications" },
      { label: "Fresher career guidance", href: "/guidance" },
    ],
  },
  {
    title: "Employers",
    links: [
      { label: "Why CareerBridge", href: "/employers" },
      { label: "Post a vacancy", href: "/employer/jobs/new" },
      { label: "Employer dashboard", href: "/employer/dashboard" },
      { label: "Create an account", href: "/auth/register?role=employer" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Accessibility statement", href: "/accessibility" },
      { label: "Demo data & setup status", href: "/project-status" },
      { label: "Sign in", href: "/auth/signin" },
      { label: "Register", href: "/auth/register" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer mt-20 border-t border-line-200 bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-500">
              CareerBridge connects students, fresh graduates, part-time job seekers, remote
              workers and people with disabilities with employers across all eight divisions of
              Bangladesh.
            </p>
            <ul className="mt-5 space-y-2 text-[0.8rem] text-ink-500">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
                Role-based accounts with private applicant data
              </li>
              <li className="flex items-center gap-2">
                <Accessibility className="h-4 w-4 text-brand-500" aria-hidden="true" />
                Keyboard friendly, screen-reader labelled interface
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-500" aria-hidden="true" />
                Classic CV editor — no AI rewriting your words
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-display text-[0.78rem] font-bold uppercase tracking-[0.14em] text-ink-900">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[0.86rem] text-ink-500 transition-colors hover:text-brand-600"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-[0.78rem] leading-relaxed text-ink-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            This project runs on demonstration data. Company names, vacancies and hiring activity
            shown on this site are sample records for a university project — they are not real
            employers and do not represent live job availability.
          </p>
          <p className="shrink-0 text-[0.78rem] font-semibold text-ink-400">
            © {new Date().getFullYear()} CareerBridge · Built as an academic project
          </p>
        </div>
      </div>
    </footer>
  );
}
