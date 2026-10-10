import Link from "next/link";
import { Accessibility, CheckCircle2, Keyboard, ListChecks, Type, Volume2 } from "lucide-react";
import { PageContainer, PageHeader, Section } from "@/components/page-shell";
import { Badge, ButtonLink, Panel } from "@/components/ui";

export const metadata = {
  title: "Accessibility statement",
  description: "How CareerBridge is built for keyboard, screen reader and low-vision use, and what is still outstanding.",
};

const BUILT = [
  { icon: <Keyboard className="h-5 w-5" />, title: "Everything reachable by keyboard", body: "Navigation, mobile menu, filters, saved-job buttons, the CV editor and every form work without a mouse. Focus is always visible as a 2px orange outline with an offset, and the Escape key closes the mobile menu." },
  { icon: <Accessibility className="h-5 w-5" />, title: "A skip link and real landmarks", body: "The first tab stop is “Skip to main content”. Pages use header, nav, main, aside and footer landmarks, and each job list has a labelled search region." },
  { icon: <Type className="h-5 w-5" />, title: "Readable type and contrast", body: "Body text is 14–15px minimum at 1.5–1.7 line height on white or warm off-white. Navy text on white measures about 15:1; the muted grey used for secondary text stays near 5:1. Colour is never the only signal — every status also carries a word." },
  { icon: <Volume2 className="h-5 w-5" />, title: "Motion and announcements", body: "Hover lifts and card shifts are the only animation, and all motion is disabled when the operating system requests reduced motion. Status changes (saved, applied, filter counts) announce through aria-live regions." },
];

const HONEST = [
  "Print output of the CV is a styled HTML page, not a tagged PDF — a screen reader may read it as plain text.",
  "The upazila/thana list is limited to the areas present in the demonstration dataset, so some districts offer only division-level filtering.",
  "No third-party accessibility audit has been run on this student project; the checklist below is self-assessed against WCAG 2.1 AA habits.",
];

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Accessibility"
        title="Built to be used without a mouse, without sound, and without assumptions"
        description="CareerBridge exists partly because job sites are often unusable for disabled applicants. Here is exactly what this build does, what it does not do, and how accessibility information gets onto a listing."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">Self-assessed WCAG 2.1 AA habits</Badge>
            <Badge tone="accent">Keyboard tested</Badge>
          </div>
        }
      />

      <PageContainer className="py-8 sm:py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {BUILT.map((b) => (
            <Panel key={b.title} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden="true">
                {b.icon}
              </span>
              <div>
                <h2 className="font-display text-[1rem] font-bold text-ink-900">{b.title}</h2>
                <p className="mt-1.5 text-[0.87rem] leading-relaxed text-ink-500">{b.body}</p>
              </div>
            </Panel>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel className="bg-canvas">
            <h2 className="flex items-center gap-2 font-display text-[1.02rem] font-bold text-ink-900">
              <ListChecks className="h-4.5 w-4.5 text-brand-500" aria-hidden="true" />
              How a job gets an accessibility badge
            </h2>
            <ol className="mt-3 space-y-2.5 text-[0.88rem] leading-relaxed text-ink-600">
              {[
                "The employer ticks each facility they actually provide when posting or editing a vacancy.",
                "The employer may add interview accommodations in their own words.",
                "CareerBridge stores and displays exactly that text — nothing is inferred, estimated or added.",
                "If nothing is recorded, the listing says “no accessibility facilities were recorded”, which is not a judgement about the workplace.",
              ].map((t, i) => (
                <li key={t} className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white text-[0.7rem] font-bold text-brand-600 ring-1 ring-line-200">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
            <ButtonLink href="/jobs/inclusive" variant="primary" size="sm" className="mt-4">
              Browse inclusive listings
            </ButtonLink>
          </Panel>

          <Panel className="border-red-700/20">
            <h2 className="font-display text-[1.02rem] font-bold text-ink-900">What we deliberately do not do</h2>
            <ul className="mt-3 space-y-2.5">
              {[
                "We never ask for a diagnosis, medical certificate or disability documentation.",
                "We never infer skill, reliability or suitability from a disability, gender or age.",
                "Accessibility preferences never change your matching score — they only filter and highlight listings.",
                "Private tracker notes are not shared with employers, in any view or export.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-[0.87rem] leading-relaxed text-ink-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-canvas px-3.5 py-3 text-[0.82rem] leading-relaxed text-ink-500">
              Set your own preferences in{" "}
              <Link href="/dashboard/profile?focus=accessibility" className="font-semibold text-brand-600 hover:underline">
                Profile &amp; matching settings
              </Link>{" "}
              — the accessibility section is optional and can stay empty.
            </p>
          </Panel>
        </div>
      </PageContainer>

      <Section tone="canvas" ariaLabel="Known limitations">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel>
            <h2 className="font-display text-[1.05rem] font-bold text-ink-900">Known limitations in this build</h2>
            <ul className="mt-3 space-y-2.5">
              {HONEST.map((t) => (
                <li key={t} className="flex gap-2.5 text-[0.87rem] leading-relaxed text-ink-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.84rem] leading-relaxed text-ink-500">
              Found a barrier? For a real deployment this page would list an email address and a response time. In this
              project, report it in the submission notes with the page, browser and step where it blocked you.
            </p>
          </Panel>
          <Panel className="bg-ink-900 text-white">
            <h2 className="font-display text-[1.05rem] font-bold">Keyboard shortcuts that exist here</h2>
            <ul className="mt-3 space-y-2 text-[0.86rem] text-ink-200">
              <li><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.78rem]">Tab</kbd> move through controls, including the filter chips</li>
              <li><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.78rem]">Enter</kbd> submit a search from the keyword field</li>
              <li><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.78rem]">Space</kbd> toggle a filter chip or checkbox</li>
              <li><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.78rem]">Esc</kbd> close the mobile navigation</li>
            </ul>
            <ButtonLink href="/jobs" variant="primary" size="sm" className="mt-5 w-full">
              Try it on Find Jobs
            </ButtonLink>
          </Panel>
        </div>
      </Section>
    </>
  );
}
