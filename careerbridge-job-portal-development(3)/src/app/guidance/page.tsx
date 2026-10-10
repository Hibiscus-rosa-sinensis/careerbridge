import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowRight, BookOpen, Clock3, Compass, GraduationCap } from "lucide-react";
import { DemoNotice, PageContainer, PageHeader, Section } from "@/components/page-shell";
import { Badge, ButtonLink, Panel } from "@/components/ui";
import { db } from "@/db";
import { guidanceResources } from "@/db/schema";
import { plural } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fresher Career Guidance",
  description:
    "Plain-language career guides, learning roadmaps, project ideas, interview preparation and accessibility guidance for people with little or no work experience.",
};

const TRACKS = [
  { key: "local-part-time", label: "Local part-time work", blurb: "Shops, cafés, supermarkets, coaching centres — starting out nearby." },
  { key: "remote-it", label: "Remote & IT", blurb: "Roadmaps for technology and marketing roles you can do from home." },
  { key: "fresher", label: "First job basics", blurb: "CV writing, interviews and what to say when you have no experience." },
  { key: "inclusive", label: "Inclusive work", blurb: "Accommodations, rights and how to ask for what you need." },
];

export default async function GuidancePage() {
  const rows = await db.select().from(guidanceResources).orderBy(asc(guidanceResources.title));
  const byTrack = TRACKS.map((t) => ({ ...t, items: rows.filter((r) => r.track === t.key) }));
  const other = rows.filter((r) => !TRACKS.some((t) => t.key === r.track));

  return (
    <>
      <PageHeader
        eyebrow="Fresher career guidance"
        title="Everything the job guides do not tell you"
        description="Written teaching material for people with little or no work experience — roadmaps, skill lists, project ideas, interview practice and application guidance. No AI coach, no chatbot, no generic motivational filler."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{plural(rows.length, "guide")}</Badge>
            <Badge tone="neutral">Beginner friendly</Badge>
            <Badge tone="success">Free to read</Badge>
          </div>
        }
      />

      <PageContainer className="py-8 sm:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: <Compass className="h-4 w-4" />, title: "Start with a path", body: "Pick a career track, follow the weeks in order, and build one small project per stage." },
            { icon: <BookOpen className="h-4 w-4" />, title: "Read at your level", body: "Every guide is marked beginner or any-level, with the minutes it takes to read." },
            { icon: <GraduationCap className="h-4 w-4" />, title: "Then apply it", body: "Each guide links to the vacancies, CV editor or matching tool that uses what you just read." },
          ].map((c) => (
            <Panel key={c.title} className="bg-canvas">
              <span className="inline-flex items-center gap-2 text-[0.76rem] font-bold uppercase tracking-wide text-brand-600">
                {c.icon}
                How to use this
              </span>
              <h2 className="mt-2 font-display text-[1rem] font-bold text-ink-900">{c.title}</h2>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-500">{c.body}</p>
            </Panel>
          ))}
        </div>

        {byTrack.map((track) =>
          track.items.length ? (
            <div key={track.key} className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-[1.2rem] font-bold text-ink-900">{track.label}</h2>
                  <p className="mt-1 text-[0.86rem] text-ink-500">{track.blurb}</p>
                </div>
                <Link
                  href={track.key === "remote-it" ? "/jobs/remote" : track.key === "local-part-time" ? "/jobs/local" : "/jobs?entry=1"}
                  className="text-[0.82rem] font-bold text-brand-600 hover:underline"
                >
                  Browse these jobs →
                </Link>
              </div>
              <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {track.items.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guidance/${g.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-line-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-center justify-between">
                        <Badge tone={g.level === "beginner" ? "success" : "neutral"}>{g.level}</Badge>
                        <span className="inline-flex items-center gap-1 text-[0.74rem] font-semibold text-ink-400">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          {g.minutes} min
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-[1rem] font-bold leading-snug text-ink-900 group-hover:text-brand-600">
                        {g.title}
                      </h3>
                      <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-500">{g.summary}</p>
                      {g.roleSkills.length ? (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {g.roleSkills.slice(0, 4).map((s) => (
                            <li key={s} className="rounded border border-line-200 bg-canvas px-1.5 py-0.5 text-[0.7rem] font-semibold text-ink-600">
                              {s}
                            </li>
                          ))}
                          {g.roleSkills.length > 4 ? (
                            <li className="px-1 text-[0.7rem] font-semibold text-ink-400">+{g.roleSkills.length - 4}</li>
                          ) : null}
                        </ul>
                      ) : null}
                      <span className="mt-auto pt-4 text-[0.8rem] font-bold text-brand-600">
                        Read guide <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}

        {other.length ? (
          <div className="mt-10">
            <h2 className="font-display text-[1.2rem] font-bold text-ink-900">More reading</h2>
            <ul className="mt-3 divide-y divide-line-200 rounded-2xl border border-line-200 bg-white">
              {other.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guidance/${g.slug}`} className="flex items-center gap-4 px-5 py-4 hover:bg-canvas">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.92rem] font-bold text-ink-900">{g.title}</span>
                      <span className="mt-0.5 block text-[0.82rem] text-ink-500">{g.summary}</span>
                    </span>
                    <Badge tone="neutral">{g.minutes} min</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </PageContainer>

      <Section tone="canvas" ariaLabel="Guidance disclaimer">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <DemoNotice className="max-w-3xl">
            These guides are educational material written for this project. They describe general practice in
            Bangladesh and are not legal, immigration or professional advice. Salary examples are indicative ranges,
            not offers.
          </DemoNotice>
          <ButtonLink href="/career-tools/cv" size="md">
            Apply this in the CV hub
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
