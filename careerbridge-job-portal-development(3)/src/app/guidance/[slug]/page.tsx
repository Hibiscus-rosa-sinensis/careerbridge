import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, Clock3, ListChecks, Printer, Target } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge, ButtonLink, Panel } from "@/components/ui";
import { db } from "@/db";
import { guidanceResources } from "@/db/schema";
import type { GuidanceSection } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [row] = await db
    .select({ title: guidanceResources.title, summary: guidanceResources.summary })
    .from(guidanceResources)
    .where(eq(guidanceResources.slug, slug))
    .limit(1);
  return { title: row?.title ?? "Guide", description: row?.summary ?? "" };
}

export default async function GuidanceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [guide, others] = await Promise.all([
    db.select().from(guidanceResources).where(eq(guidanceResources.slug, slug)).limit(1).then((r) => r[0]),
    db
      .select({ slug: guidanceResources.slug, title: guidanceResources.title, minutes: guidanceResources.minutes })
      .from(guidanceResources)
      .limit(12)
      .then((rows) => rows.filter((r) => r.slug !== slug).slice(0, 4)),
  ]);
  if (!guide) notFound();

  const sections = (guide.sections ?? []) as GuidanceSection[];

  return (
    <>
      <PageHeader
        tone="canvas"
        eyebrow={`${guide.track ?? "general"} · ${guide.level ?? "any level"}`}
        title={guide.title}
        description={guide.summary ?? ""}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" icon={<Clock3 className="h-3 w-3" aria-hidden="true" />}>
              {guide.minutes} minute read
            </Badge>
            <Badge tone="accent">Written guide</Badge>
          </div>
        }
      />

      <PageContainer className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="no-print text-[0.78rem] font-medium text-ink-400">
              <Link href="/guidance" className="inline-flex items-center gap-1.5 hover:text-brand-600">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                All guidance
              </Link>
            </nav>

            {sections.map((section, i) => (
              <section key={section.heading} id={`s-${i}`} className="mt-8 first:mt-6">
                <h2 className="font-display text-[1.15rem] font-bold text-ink-900">
                  <span className="mr-2 text-brand-500">{String(i + 1).padStart(2, "0")}</span>
                  {section.heading}
                </h2>
                {section.body ? (
                  <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-ink-600">{section.body}</p>
                ) : null}
                {section.bullets?.length ? (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5 text-[0.92rem] leading-relaxed text-ink-600">
                        <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="no-print mt-10 rounded-2xl border border-line-200 bg-canvas p-5">
              <h2 className="flex items-center gap-2 font-display text-[1rem] font-bold text-ink-900">
                <ListChecks className="h-4 w-4 text-brand-500" aria-hidden="true" />
                Do this next
              </h2>
              <ul className="mt-3 space-y-2 text-[0.87rem] text-ink-600">
                <li>· Write or update the matching CV section in the{" "}<Link href="/career-tools/cv" className="font-semibold text-brand-600 hover:underline">CV hub</Link>.</li>
                <li>· Save three jobs you would genuinely apply for from{" "}<Link href="/jobs" className="font-semibold text-brand-600 hover:underline">Find Jobs</Link>.</li>
                <li>· Run{" "}<Link href="/career-tools/matching" className="font-semibold text-brand-600 hover:underline">Smart Job Matching</Link> after adding the skills from this guide to your profile.</li>
              </ul>
            </div>
          </article>

          <aside className="no-print space-y-4 lg:sticky lg:top-24 lg:self-start">
            {guide.roleSkills.length ? (
              <Panel>
                <h2 className="flex items-center gap-2 font-display text-[0.95rem] font-bold text-ink-900">
                  <Target className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  Skills this role asks for
                </h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {guide.roleSkills.map((s) => (
                    <li key={s} className="rounded-lg border border-line-200 bg-canvas px-2.5 py-1 text-[0.78rem] font-semibold text-ink-700">
                      {s}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/dashboard/profile" variant="outline" size="sm" className="mt-4 w-full">
                  Add them to my profile
                </ButtonLink>
              </Panel>
            ) : null}

            <Panel className="bg-canvas">
              <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Contents</h2>
              <ol className="mt-3 space-y-1.5">
                {sections.map((s, i) => (
                  <li key={s.heading}>
                    <a href={`#s-${i}`} className="flex gap-2 text-[0.82rem] text-ink-600 hover:text-brand-600">
                      <span className="font-mono text-ink-300">{i + 1}</span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel>
              <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Keep reading</h2>
              <ul className="mt-3 space-y-2.5">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/guidance/${o.slug}`} className="group flex items-start gap-2 text-[0.84rem] font-semibold text-ink-700 hover:text-brand-600">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300 group-hover:text-brand-500" aria-hidden="true" />
                      {o.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>

            <p className="rounded-xl border border-line-200 bg-white p-4 text-[0.76rem] leading-relaxed text-ink-400">
              Educational guidance written for this project — not legal advice, and not an AI career coach. Content is
              stored in the project database as demonstration data.
            </p>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
