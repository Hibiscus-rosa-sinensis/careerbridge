import type { CvContent, CvSectionKey } from "@/lib/cv";
import { SECTION_LABELS } from "@/lib/cv";
import { cn } from "@/lib/utils";

const densityMap = { compact: "0.78rem", regular: "0.83rem", relaxed: "0.88rem" } as const;

function Heading({
  children,
  template,
  accent,
  uppercase,
}: {
  children: string;
  template: string;
  accent: string;
  uppercase: boolean;
}) {
  const base = "font-bold";
  if (template === "minimal")
    return (
      <h3 className={cn(base, "mb-1.5 text-[0.72rem] tracking-[0.18em] text-ink-400", uppercase && "uppercase")}>
        {children}
      </h3>
    );
  if (template === "two-column")
    return (
      <h3
        className={cn(base, "mb-1.5 border-b pb-1 text-[0.74rem] tracking-[0.14em]", uppercase && "uppercase")}
        style={{ color: accent, borderColor: `${accent}33` }}
      >
        {children}
      </h3>
    );
  return (
    <h3
      className={cn(base, "mb-2 border-b pb-1 text-[0.78rem] tracking-[0.14em] text-ink-900", uppercase && "uppercase")}
      style={{ borderColor: `${accent}44` }}
    >
      {children}
    </h3>
  );
}

function Bullets({ text }: { text: string }) {
  const items = text
    .split("\n")
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  if (!items.length) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-1.5">
          <span aria-hidden="true">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionBody({ field, content }: { field: CvSectionKey; content: CvContent }) {
  switch (field) {
    case "objective":
      return content.objective ? <p className="whitespace-pre-line">{content.objective}</p> : null;

    case "education":
      return (
        <div className="space-y-2">
          {content.education.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-bold">{e.degree || "Qualification"}</p>
                <p className="text-[0.9em] opacity-70">{e.year}</p>
              </div>
              <p className="opacity-85">
                {[e.institution, e.location].filter(Boolean).join(" · ")}
                {e.result ? <span className="font-semibold"> — {e.result}</span> : null}
              </p>
              {e.details ? <p className="mt-0.5 opacity-75">{e.details}</p> : null}
            </div>
          ))}
        </div>
      );

    case "experience":
      return (
        <div className="space-y-2.5">
          {content.experience.map((x) => (
            <div key={x.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-bold">{x.role || "Role"}</p>
                <p className="text-[0.9em] opacity-70">{x.period}</p>
              </div>
              <p className="opacity-85">{[x.company, x.location].filter(Boolean).join(" · ")}</p>
              <Bullets text={x.bullets} />
            </div>
          ))}
        </div>
      );

    case "skills":
      return (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {content.skills.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between gap-2">
              <span>{s.name}</span>
              {s.level ? <span className="text-[0.85em] opacity-65">{s.level}</span> : null}
            </li>
          ))}
        </ul>
      );

    case "projects":
      return (
        <div className="space-y-2">
          {content.projects.map((p) => (
            <div key={p.id}>
              <p className="font-bold">
                {p.name}
                {p.tech ? <span className="ml-1 font-normal opacity-70">· {p.tech}</span> : null}
              </p>
              {p.description ? <p className="opacity-80">{p.description}</p> : null}
              {p.link ? <p className="text-[0.9em] underline decoration-dotted">{p.link}</p> : null}
            </div>
          ))}
        </div>
      );

    case "training":
      return (
        <ul className="space-y-1">
          {content.training.map((t) => (
            <li key={t.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span>
                <span className="font-semibold">{t.title}</span>
                {t.institute ? <span className="opacity-75"> — {t.institute}</span> : null}
              </span>
              <span className="text-[0.9em] opacity-70">{t.year}</span>
            </li>
          ))}
        </ul>
      );

    case "references":
      return (
        <ul className="space-y-1.5">
          {content.references.map((r) => (
            <li key={r.id}>
              <p className="font-semibold">{r.name}</p>
              <p className="opacity-75">{[r.position, r.organization].filter(Boolean).join(", ")}</p>
              {r.contact ? <p className="opacity-75">{r.contact}</p> : null}
            </li>
          ))}
        </ul>
      );
  }
}

const isEmpty = (field: CvSectionKey, c: CvContent) => {
  switch (field) {
    case "objective":
      return !c.objective.trim();
    case "skills":
      return c.skills.length === 0;
    case "education":
      return c.education.length === 0;
    case "experience":
      return c.experience.length === 0;
    case "projects":
      return c.projects.length === 0;
    case "training":
      return c.training.length === 0;
    case "references":
      return c.references.length === 0;
  }
};

export function CvPreview({
  content,
  className,
  printMode = false,
}: {
  content: CvContent;
  className?: string;
  printMode?: boolean;
}) {
  const { layout } = content;
  const template = layout.template;
  const accent = layout.accent || "#14202b";
  const size = densityMap[layout.density] ?? densityMap.regular;
  const visible = layout.sectionOrder.filter((k) => !layout.hidden.includes(k) && !isEmpty(k, content));
  const p = content.personal;

  const contactBits = [
    p.email,
    p.phone,
    p.address,
    p.website,
    p.linkedin,
  ].filter(Boolean);

  const renderSection = (key: CvSectionKey) => (
    <section key={key} className="cv-section">
      <Heading template={template} accent={accent} uppercase={layout.uppercaseHeadings}>
        {SECTION_LABELS[key]}
      </Heading>
      <SectionBody field={key} content={content} />
    </section>
  );

  if (template === "two-column") {
    const sidebarKeys = visible.filter((k) => ["skills", "training", "references"].includes(k));
    const mainKeys = visible.filter((k) => !["skills", "training", "references"].includes(k));
    return (
      <div
        className={cn("cv-sheet text-ink-800", className)}
        style={{ fontSize: size, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}
      >
        <header className="mb-4 border-b-2 pb-3" style={{ borderColor: accent }}>
          <h1 className="font-display text-[1.45rem] font-extrabold leading-tight" style={{ color: accent }}>
            {p.fullName || "Your Name"}
          </h1>
          {p.jobTitle ? <p className="mt-0.5 font-semibold opacity-80">{p.jobTitle}</p> : null}
          <p className="mt-1.5 opacity-75">{contactBits.join("  ·  ")}</p>
        </header>
        <div className="grid grid-cols-[1fr_2.1fr] gap-5">
          <div className="space-y-4 border-r border-line-200 pr-4">{sidebarKeys.map(renderSection)}</div>
          <div className="space-y-4">{mainKeys.map(renderSection)}</div>
        </div>
      </div>
    );
  }

  if (template === "orange-header") {
    return (
      <div
        className={cn("cv-sheet text-ink-800", className)}
        style={{ fontSize: size } as React.CSSProperties}
      >
        <header className="-m-6 mb-5 px-6 py-6 text-white" style={{ background: "#ea6a15" }}>
          <h1 className="font-display text-[1.75rem] font-extrabold leading-none tracking-tight">
            {p.fullName || "Your Name"}
          </h1>
          {p.jobTitle ? <p className="mt-1.5 text-[1.02em] font-semibold opacity-95">{p.jobTitle}</p> : null}
          <p className="mt-2.5 text-[0.92em] opacity-95">{contactBits.join("  ·  ")}</p>
        </header>
        <div className="space-y-4">{visible.map(renderSection)}</div>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div
        className={cn("cv-sheet text-ink-800", className)}
        style={{ fontSize: size } as React.CSSProperties}
      >
        <header className="mb-6">
          <h1 className="font-display text-[1.5rem] font-extrabold leading-none tracking-tight text-ink-900">
            {p.fullName || "Your Name"}
          </h1>
          {p.jobTitle ? <p className="mt-1 text-ink-500">{p.jobTitle}</p> : null}
          <p className="mt-2 text-ink-400">{contactBits.join(" · ")}</p>
        </header>
        <div className="space-y-5">{visible.map(renderSection)}</div>
      </div>
    );
  }

  // classic navy
  return (
    <div
      className={cn("cv-sheet text-ink-800", className)}
      style={{ fontSize: size } as React.CSSProperties}
    >
      <header className={cn("mb-4 text-center", !printMode && "pb-3")}>
        <h1 className="font-display text-[1.55rem] font-extrabold leading-none tracking-tight text-ink-900">
          {p.fullName || "Your Name"}
        </h1>
        {p.jobTitle ? <p className="mt-1 font-semibold text-ink-600">{p.jobTitle}</p> : null}
        <p className="mt-1.5 text-ink-500">{contactBits.join("  ·  ")}</p>
        <div className="mx-auto mt-3 h-[2px] w-16" style={{ background: accent }} aria-hidden="true" />
      </header>
      <div className="space-y-4">{visible.map(renderSection)}</div>
    </div>
  );
}
