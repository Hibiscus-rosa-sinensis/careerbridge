import Link from "next/link";
import { ArrowRight, Info, RefreshCw, Target } from "lucide-react";
import { PageContainer, PageHeader, Section } from "@/components/page-shell";
import { Badge, ButtonLink, EmptyState, Panel } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { seekerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadJobRows } from "@/lib/jobs";
import { MATCH_EXPLANATION, rankJobs, type SeekerProfileInput } from "@/lib/matching";
import { ACCESSIBILITY_FACILITIES, EDUCATION_LEVELS, EXPERIENCE_LEVELS, labelFor } from "@/lib/constants";
import { formatSalary, locationLine } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Smart Job Matching",
  description: "Transparent, rule-based job recommendations with matched skills, gaps and a score you can audit.",
};

const TIER = (score: number) =>
  score >= 75
    ? { label: "Strong match", tone: "success" as const }
    : score >= 55
      ? { label: "Good match", tone: "accent" as const }
      : score >= 35
        ? { label: "Possible — check the gaps", tone: "warn" as const }
        : { label: "Stretch for now", tone: "muted" as const };

export default async function MatchingPage() {
  const session = await getSessionUser();
  const profileRow = session?.role === "jobseeker"
    ? await db
        .select()
        .from(seekerProfiles)
        .where(eq(seekerProfiles.userId, session.id))
        .limit(1)
        .then((r) => r[0])
    : undefined;

  const pool = await loadJobRows({ status: "published" });

  if (!session || session.role !== "jobseeker") {
    return (
      <>
        <PageHeader
          eyebrow="Career tools"
          title="Smart Job Matching"
          description="A weighted, rule-based comparison — not AI. See which skills you already have, what is missing, and exactly why each vacancy was ranked where it was."
        />
        <PageContainer className="py-10">
          <Panel className="mx-auto max-w-2xl text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
              <Target className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-[1.15rem] font-bold text-ink-900">Sign in to get your matches</h2>
            <p className="mx-auto mt-2 max-w-md text-[0.88rem] leading-relaxed text-ink-500">
              Matching reads your profile — education, skills, experience level, preferred category, location,
              employment type, work arrangement and pay expectation — and compares it with the vacancy requirements.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <ButtonLink href="/auth/signin?next=/career-tools/matching">Sign in</ButtonLink>
              <ButtonLink href="/auth/register" variant="outline">
                Create a free account
              </ButtonLink>
            </div>
          </Panel>
          <HowItWorks />
        </PageContainer>
      </>
    );
  }

  const input: SeekerProfileInput = {
    skills: profileRow?.skills ?? [],
    educationLevel: profileRow?.educationLevel ?? "",
    experienceLevel: profileRow?.experienceLevel ?? "fresher",
    preferredCategories: profileRow?.preferredCategories ?? [],
    preferredLocations: profileRow?.preferredLocations ?? [],
    preferredEmploymentTypes: profileRow?.preferredEmploymentTypes ?? [],
    workMode: profileRow?.workMode ?? "any",
    salaryExpectation: profileRow?.salaryExpectation ?? 0,
  };

  const ranked = rankJobs(input, pool, 12);
  const completeness = [
    input.skills.length > 0,
    Boolean(input.educationLevel),
    input.preferredCategories.length > 0,
    input.preferredLocations.length > 0,
    input.preferredEmploymentTypes.length > 0,
  ].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Career tools"
        title="Your matches, with the working shown"
        description="Every vacancy in the demonstration dataset is scored against your profile using the eight weights below. Nothing is hidden and nothing is automatic — you decide what to apply for."
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">Rule based · no AI</Badge>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-300 bg-white px-3 py-2 text-[0.8rem] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Edit profile &amp; refresh
            </Link>
          </div>
        }
      >
        {completeness < 5 ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-600/30 bg-amber-600/8 px-3.5 py-2.5 text-[0.83rem] leading-relaxed text-ink-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            Your profile has {completeness} of 5 useful matching fields.{" "}
            <Link href="/dashboard/profile" className="font-semibold underline">
              Add {5 - completeness} more
            </Link>{" "}
            and the ranking becomes far more accurate.
          </p>
        ) : null}
      </PageHeader>

      <PageContainer className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div>
            {ranked.length === 0 ? (
              <EmptyState
                title="No published vacancies to compare yet"
                description="When an employer publishes a vacancy in the employer portal it appears here immediately."
                action={<ButtonLink href="/employer/jobs/new" variant="outline" size="sm">Post a job</ButtonLink>}
              />
            ) : (
              <ol className="space-y-4">
                {ranked.map((m, index) => {
                  const tier = TIER(m.score);
                  return (
                    <li key={m.job.id}>
                      <Panel className="relative">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="flex shrink-0 items-start gap-3 sm:w-24 sm:flex-col">
                            <div
                              className="grid h-14 w-14 place-items-center rounded-2xl border"
                              style={{
                                borderColor: m.score >= 75 ? "#197a4b55" : m.score >= 55 ? "#ea6a1555" : "#c9cfd5",
                                background: m.score >= 75 ? "#197a4b0d" : m.score >= 55 ? "#ea6a150d" : "#faf7f2",
                              }}
                            >
                              <span className="font-display text-[1.15rem] font-extrabold text-ink-900">{m.score}</span>
                            </div>
                            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-400">Rank #{index + 1}</p>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone={tier.tone}>{tier.label}</Badge>
                              <Badge tone="neutral">{m.job.employmentType.replace("-", " ")}</Badge>
                              {m.job.workMode === "remote" ? <Badge tone="info">Remote</Badge> : null}
                            </div>
                            <h3 className="mt-2 font-display text-[1.05rem] font-bold text-ink-900">
                              <Link href={`/jobs/${m.job.id}`} className="hover:text-brand-600">
                                {m.job.title}
                              </Link>
                            </h3>
                            <p className="mt-0.5 text-[0.83rem] text-ink-500">
                              {m.job.companyName} · {locationLine([m.job.district, m.job.division]) || "Remote"} ·{" "}
                              {formatSalary(m.job.salaryMin, m.job.salaryMax, m.job.salaryPeriod ?? "month")}
                            </p>

                            {m.matchedSkills.length ? (
                              <ul className="mt-3 flex flex-wrap gap-1.5">
                                {m.matchedSkills.map((s) => (
                                  <li key={s} className="inline-flex items-center gap-1 rounded-md border border-green-700/25 bg-green-700/8 px-2 py-0.5 text-[0.74rem] font-semibold text-green-700">
                                    ✓ {s}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {m.missingRequired.length || m.missingPreferred.length ? (
                              <ul className="mt-2 flex flex-wrap gap-1.5">
                                {m.missingRequired.map((s) => (
                                  <li key={`r-${s}`} className="rounded-md border border-amber-600/30 bg-amber-600/8 px-2 py-0.5 text-[0.74rem] font-semibold text-amber-600">
                                    Learn next: {s}
                                  </li>
                                ))}
                                {m.missingPreferred.map((s) => (
                                  <li key={`p-${s}`} className="rounded-md border border-line-300 bg-canvas px-2 py-0.5 text-[0.74rem] font-medium text-ink-500">
                                    Optional: {s}
                                  </li>
                                ))}
                              </ul>
                            ) : null}

                            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl bg-canvas p-3">
                                <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-400">Why this ranked here</p>
                                <ul className="mt-1.5 space-y-1">
                                  {m.reasons.length ? (
                                    m.reasons.slice(0, 4).map((r) => (
                                      <li key={r} className="text-[0.8rem] leading-snug text-ink-600">
                                        · {r}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-[0.8rem] text-ink-400">No specific requirement conflicts found.</li>
                                  )}
                                </ul>
                              </div>
                              <div className="rounded-xl border border-line-200 p-3">
                                <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-400">Requirements check</p>
                                <ul className="mt-1.5 space-y-1 text-[0.8rem] text-ink-600">
                                  <li>· Education asked: {labelFor(EDUCATION_LEVELS, m.job.educationLevel) || "Not specified"}</li>
                                  <li>· Experience asked: {labelFor(EXPERIENCE_LEVELS, m.job.experienceLevel)}</li>
                                  {m.gaps.length ? (
                                    <li className="pt-1 font-semibold text-ink-700">
                                      Gaps are suggestions, never a rejection:
                                      <ul className="mt-1 space-y-1 font-normal">
                                        {m.gaps.slice(0, 3).map((g) => (
                                          <li key={g}>– {g}</li>
                                        ))}
                                      </ul>
                                    </li>
                                  ) : (
                                    <li className="font-semibold text-green-700">· No blocking gap detected</li>
                                  )}
                                </ul>
                              </div>
                            </div>

                            <div className="mt-3.5 flex flex-wrap gap-2">
                              <Link href={`/jobs/${m.job.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-[0.8rem] font-semibold text-white hover:bg-ink-800">
                                Read the listing
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </Link>
                              <Link href={`/jobs/${m.job.id}/apply`} className="inline-flex items-center gap-1.5 rounded-lg border border-line-300 bg-white px-3 py-2 text-[0.8rem] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600">
                                Apply
                              </Link>
                              <Link href={`/jobs?cat=${m.job.categorySlug}`} className="inline-flex items-center rounded-lg px-2.5 py-2 text-[0.8rem] font-semibold text-ink-400 hover:text-ink-700">
                                More like this
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Panel>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Panel>
              <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Your matching profile</h2>
              <dl className="mt-3 space-y-2 text-[0.82rem]">
                {[
                  ["Skills", input.skills.length ? input.skills.join(", ") : "None yet"],
                  ["Education", labelFor(EDUCATION_LEVELS, input.educationLevel) || "Not set"],
                  ["Experience", labelFor(EXPERIENCE_LEVELS, input.experienceLevel)],
                  ["Categories", input.preferredCategories.length ? input.preferredCategories.join(", ") : "Any"],
                  ["Locations", input.preferredLocations.length ? input.preferredLocations.join(", ") : "Any"],
                  ["Type", input.preferredEmploymentTypes.length ? input.preferredEmploymentTypes.join(", ") : "Any"],
                  ["Arrangement", input.workMode],
                  ["Pay expectation", input.salaryExpectation ? `Tk ${input.salaryExpectation.toLocaleString("en-BD")}/month` : "Not set"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-line-100 pb-1.5 last:border-0">
                    <dt className="shrink-0 text-ink-400">{k}</dt>
                    <dd className="text-right font-semibold text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
              {profileRow?.accessibilityNeeds?.length ? (
                <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[0.78rem] leading-relaxed text-ink-500">
                  Accessibility preferences on file:{" "}
                  {profileRow.accessibilityNeeds
                    .map((n) => ACCESSIBILITY_FACILITIES.find((f) => f.value === n)?.label ?? n)
                    .join(", ")}
                  . These only filter listings — they never change your score.
                </p>
              ) : null}
              <ButtonLink href="/dashboard/profile" variant="outline" size="sm" className="mt-4 w-full">
                Update profile
              </ButtonLink>
            </Panel>
            <Panel className="bg-canvas">
              <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Dataset</h2>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-500">
                {pool.length} published demonstration vacancies were scored. Real listings you post in the employer
                portal are included automatically.
              </p>
            </Panel>
          </aside>
        </div>
      </PageContainer>

      <Section tone="canvas" ariaLabel="How matching works">
        <HowItWorks />
      </Section>
    </>
  );
}

function HowItWorks() {
  return (
    <Panel>
      <h2 className="font-display text-[1.05rem] font-bold text-ink-900">How the score is calculated</h2>
      <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-500">
        Each rule contributes up to its weight; the total is out of 100. Missing a single preferred skill only removes a
        few points — it never removes the job from your list.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.84rem]">
          <caption className="sr-only">Matching weights and what each one measures</caption>
          <thead>
            <tr className="border-b border-line-300 text-[0.72rem] uppercase tracking-wide text-ink-400">
              <th scope="col" className="py-2 pr-3 font-bold">Factor</th>
              <th scope="col" className="py-2 pr-3 font-bold">Weight</th>
              <th scope="col" className="py-2 font-bold">What it measures</th>
            </tr>
          </thead>
          <tbody>
            {MATCH_EXPLANATION.map((row) => (
              <tr key={row.label} className="border-b border-line-100 last:border-0">
                <td className="py-2 pr-3 font-semibold text-ink-800">{row.label}</td>
                <td className="py-2 pr-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line-100" aria-hidden="true">
                      <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(row.weight / 30) * 100}%` }} />
                    </span>
                    <span className="font-bold text-ink-700">{row.weight}</span>
                  </span>
                </td>
                <td className="py-2 text-ink-500">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
