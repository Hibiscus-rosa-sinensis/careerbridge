import Link from "next/link";
import { ArrowRight, Bookmark, MapPin, Search, Sparkles, TrendingUp } from "lucide-react";
import { PageContainer } from "@/components/page-shell";
import { buttonClass } from "@/components/ui";
import { DIVISIONS } from "@/lib/constants";

/**
 * Hero artwork is built entirely from interface fragments and geometry —
 * no people, no stock photography.
 */
function HeroArtwork() {
  return (
    <div className="relative mx-auto hidden h-[30rem] w-full max-w-[30rem] lg:block xl:max-w-[34rem]" aria-hidden="true">
      {/* abstract geometry backdrop */}
      <div className="absolute right-6 top-2 h-56 w-56 rounded-[2.5rem] bg-brand-100/70" />
      <div className="absolute right-0 top-24 h-40 w-40 rounded-full border border-brand-200" />
      <div className="absolute bottom-6 left-4 h-32 w-32 rotate-12 rounded-[1.75rem] border border-line-300 bg-canvas" />
      <svg className="absolute left-0 top-10 h-40 w-40 text-line-300" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeDasharray="4 6" />
        <path d="M50 4v92M4 50h92" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 6" />
      </svg>

      {/* dashboard fragment */}
      <div className="absolute left-6 top-16 w-[19rem] rounded-2xl border border-line-200 bg-white p-4 shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between">
          <p className="text-[0.72rem] font-bold uppercase tracking-widest text-ink-400">Match score</p>
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[0.68rem] font-bold text-brand-600">
            Rule based
          </span>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <p className="font-display text-[2rem] font-extrabold leading-none text-ink-900">82</p>
          <p className="pb-1 text-[0.75rem] font-semibold text-teal-600">
            <TrendingUp className="mr-1 inline h-3.5 w-3.5" />
            +18 this week
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {[
            { label: "Skills overlap", w: "72%", tone: "bg-brand-500" },
            { label: "Location & hours", w: "88%", tone: "bg-teal-600" },
            { label: "Experience level", w: "54%", tone: "bg-ink-300" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-[0.68rem] font-semibold text-ink-400">
                <span>{bar.label}</span>
                <span>{bar.w}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-line-100">
                <div className={`h-full rounded-full ${bar.tone}`} style={{ width: bar.w }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating sample job card — local part-time */}
      <div className="absolute right-0 top-2 w-[16.5rem] rounded-2xl border border-line-200 bg-white p-4 shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between">
          <span className="rounded-md border border-brand-100 bg-brand-50 px-1.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide text-brand-600">
            Local part-time
          </span>
          <Bookmark className="h-4 w-4 text-ink-200" />
        </div>
        <p className="mt-2.5 font-display text-[0.95rem] font-bold text-ink-900">Café Barista — Evening</p>
        <p className="mt-0.5 text-[0.76rem] text-ink-500">Sample employer · Dhanmondi, Dhaka</p>
        <div className="mt-2.5 flex items-center justify-between border-t border-line-100 pt-2.5">
          <span className="text-[0.8rem] font-bold text-ink-800">Tk 9,000–12,000</span>
          <span className="text-[0.7rem] font-semibold text-teal-600">4–5 hrs/day</span>
        </div>
      </div>

      {/* floating sample job card — remote */}
      <div className="absolute bottom-2 right-6 w-[17rem] rounded-2xl border border-line-200 bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-700/8 text-blue-700">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-[0.9rem] font-bold text-ink-900">Junior Frontend Developer</p>
            <p className="text-[0.74rem] text-ink-500">Remote · sample company</p>
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {["React", "Tailwind CSS", "Git"].map((s) => (
            <li key={s} className="rounded-md border border-line-200 bg-canvas px-1.5 py-0.5 text-[0.68rem] font-semibold text-ink-600">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink-400">
          <MapPin className="h-3.5 w-3.5" />
          Anywhere in Bangladesh
        </div>
      </div>

      {/* small map pin fragment */}
      <div className="absolute bottom-24 left-0 grid h-16 w-16 place-items-center rounded-2xl border border-line-200 bg-white shadow-[var(--shadow-soft)]">
        <div className="text-center">
          <MapPin className="mx-auto h-5 w-5 text-brand-500" />
          <p className="mt-1 text-[0.6rem] font-bold text-ink-500">8 divisions</p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line-200 bg-gradient-to-b from-canvas via-white to-white">
      <div className="dot-field pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <PageContainer className="relative py-14 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-line-300 bg-white px-3 py-1 text-[0.74rem] font-semibold text-ink-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              For students, fresh graduates, part-time seekers and remote workers
            </p>
            <h1 className="mt-5 font-display text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-[3.1rem]">
              Find the Right Job.
              <span className="block text-brand-600">Build Your Future.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-ink-500">
              Discover local part-time jobs, remote opportunities, and career options across
              Bangladesh. Your career journey starts here.
            </p>

            <form action="/jobs" method="get" className="mt-7 rounded-2xl border border-line-200 bg-white p-3 shadow-[var(--shadow-soft)]">
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
                <div>
                  <label htmlFor="hero-q" className="cb-label">
                    Job title or keyword
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
                    <input
                      id="hero-q"
                      name="q"
                      placeholder="barista, tutor, React, data entry…"
                      className="cb-input pl-9"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="hero-division" className="cb-label">
                    Location
                  </label>
                  <select id="hero-division" name="division" className="cb-input">
                    <option value="">All Bangladesh</option>
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} Division
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className={buttonClass({ size: "md", className: "w-full sm:w-auto" })}>
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Find Jobs
                  </button>
                </div>
              </div>
            </form>

            <p className="mt-3 text-[0.82rem] font-medium text-ink-400">
              Opportunities for students, freshers and professionals.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/jobs/local" className={buttonClass({ variant: "secondary", size: "md" })}>
                Browse local part-time
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/jobs/remote" className={buttonClass({ variant: "outline", size: "md" })}>
                See remote & IT roles
              </Link>
              <Link href="/career-tools/cv" className={buttonClass({ variant: "ghost", size: "md" })}>
                Build my CV
              </Link>
            </div>
          </div>

          <HeroArtwork />
        </div>
      </PageContainer>
    </section>
  );
}
