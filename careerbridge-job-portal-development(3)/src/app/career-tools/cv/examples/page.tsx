import Link from "next/link";
import { CvPreview } from "@/components/cv-preview";
import { PageContainer, PageHeader, Section } from "@/components/page-shell";
import { ButtonLink, Panel } from "@/components/ui";
import { CV_TEMPLATES } from "@/lib/constants";
import { experiencedExample, fresherExample, normalizeCv } from "@/lib/cv";

export const metadata = {
  title: "CV examples for freshers and experienced candidates",
  description: "Two complete example CVs rendered in CareerBridge templates, with notes on why each choice was made.",
};

const ANNOTATIONS = [
  {
    t: "The objective names the job and the hours",
    d: "“Part-time evening role in Mirpur” tells a shop owner more than “seeking a challenging environment”. It answers their first two questions before they ask.",
  },
  {
    t: "Family business work is listed as experience",
    d: "Counter and stock work at an uncle's shop is real, verifiable experience. It is written with verbs and numbers, not as an apology.",
  },
  {
    t: "Skills carry an honest level",
    d: "Beginner / Intermediate / Advanced next to each skill prevents the classic interview surprise, and matches what the vacancy asks for.",
  },
  {
    t: "No photo, no national ID, no marital status",
    d: "A one-page CV in Bangladesh does not need a photograph or personal identity numbers. Space goes to work instead.",
  },
];

export default function CvExamplesPage() {
  const fresher = normalizeCv(fresherExample);
  const experienced = normalizeCv(experiencedExample);

  return (
    <>
      <PageHeader
        tone="canvas"
        eyebrow="CV hub"
        title="Two complete examples, side by side"
        description="One for a fresher with no formal work history, one for a candidate with three years of experience. Both are written in the same templates you can select in the editor — copy the structure, never the details."
        aside={
          <ButtonLink href="/career-tools/cv" size="md">
            Use these in the editor
          </ButtonLink>
        }
      />

      <Section ariaLabel="Fresher example CV">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] xl:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-600">Example 1</p>
            <h2 className="mt-2 font-display text-[1.35rem] font-extrabold text-ink-900">
              Fresher — BBA student applying for part-time work
            </h2>
            <p className="mt-2 max-w-xl text-[0.9rem] leading-relaxed text-ink-500">
              Rendered in the <span className="font-semibold text-ink-700">{CV_TEMPLATES[0].name}</span> template, one
              page, five sections. Notice that education sits above experience because it is the stronger card here.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line-200 bg-canvas-deep p-4">
              <div className="mx-auto rounded-lg bg-white p-6 shadow-[var(--shadow-soft)]">
                <CvPreview content={fresher} />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {ANNOTATIONS.map((a) => (
              <Panel key={a.t} className="bg-canvas">
                <h3 className="font-display text-[0.92rem] font-bold text-ink-900">{a.t}</h3>
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-500">{a.d}</p>
              </Panel>
            ))}
            <p className="rounded-xl border border-line-200 bg-white p-4 text-[0.82rem] leading-relaxed text-ink-500">
              Sample names, institutions and contact details are fictional. Do not send these examples with your
              application — replace every line with your own information in the{" "}
              <Link href="/career-tools/cv" className="font-semibold text-brand-600 hover:underline">
                CV editor
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section tone="canvas" ariaLabel="Experienced example CV">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-600">Example 2</p>
            <h2 className="mt-2 font-display text-[1.35rem] font-extrabold text-ink-900">
              Experienced — remote developer with 3 years of work
            </h2>
            <p className="mt-2 max-w-xl text-[0.9rem] leading-relaxed text-ink-500">
              Same editor, different choices: a two-column layout with skills in the sidebar, achievements written with
              numbers, and training listed below experience instead of above it.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line-200 bg-white p-4">
              <div className="mx-auto rounded-lg border border-line-200 bg-white p-6">
                <CvPreview content={{ ...experienced, layout: { ...experienced.layout, template: "two-column", accent: "#1f5f57" } }} />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                t: "Each role has two to four result lines",
                d: "“Cut first load from 4.1s to 1.6s” is a claim an interviewer can ask about — and you can answer it.",
              },
              {
                t: "Projects sit beside employment",
                d: "For technology roles, an open-source or personal project often says more than the job title does.",
              },
              {
                t: "References reduced to one line",
                d: "“Available on request” saves space until someone actually asks. Never list a person's phone number without their permission.",
              },
              {
                t: "The objective is a summary, not a wish",
                d: "Three years in? Open with what you can do now and what you want next, in two sentences.",
              },
            ].map((a) => (
              <Panel key={a.t}>
                <h3 className="font-display text-[0.92rem] font-bold text-ink-900">{a.t}</h3>
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-500">{a.d}</p>
              </Panel>
            ))}
            <div className="cb-panel bg-ink-900 p-5 text-white">
              <p className="font-display text-[0.95rem] font-bold">Ready to write yours?</p>
              <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-200">
                The editor keeps your text while you try different templates. Start a section, leave it, come back
                tomorrow — the draft stays.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/career-tools/cv" className="inline-flex items-center rounded-lg bg-brand-500 px-3.5 py-2 text-[0.82rem] font-semibold hover:bg-brand-600">
                  Open the CV editor
                </Link>
                <Link href="/guidance/cv-writing-tips-freshers" className="inline-flex items-center rounded-lg border border-white/25 px-3.5 py-2 text-[0.82rem] font-semibold hover:bg-white/10">
                  Read the CV guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
