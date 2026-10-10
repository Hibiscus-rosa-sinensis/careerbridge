import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  tone = "canvas",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  tone?: "canvas" | "white" | "ink";
  children?: ReactNode;
}) {
  const dark = tone === "ink";
  return (
    <section
      className={cn(
        "border-b",
        dark ? "border-ink-800 bg-ink-900" : tone === "canvas" ? "border-line-200 bg-canvas" : "border-line-200 bg-white",
      )}
    >
      <PageContainer className="py-10 sm:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <div
                className={cn(
                  "mb-2.5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em]",
                  dark ? "text-brand-300" : "text-brand-600",
                )}
              >
                <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
                {eyebrow}
              </div>
            ) : null}
            <h1 className={cn("text-[1.75rem] font-extrabold leading-tight sm:text-[2.35rem]", dark && "text-white")}>
              {title}
            </h1>
            {description ? (
              <p className={cn("mt-3 max-w-2xl text-[0.95rem] leading-relaxed", dark ? "text-ink-200" : "text-ink-500")}>
                {description}
              </p>
            ) : null}
            {children}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </PageContainer>
    </section>
  );
}

export function Section({
  children,
  className,
  tone = "white",
  id,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "canvas" | "canvas-deep";
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "border-b border-line-200 py-14 sm:py-16",
        tone === "canvas" && "bg-canvas",
        tone === "canvas-deep" && "bg-canvas-deep",
        tone === "white" && "bg-white",
        className,
      )}
    >
      <PageContainer>{children}</PageContainer>
    </section>
  );
}

export function DemoNotice({
  children = "All vacancies, companies and applicant records on CareerBridge are demonstration data created for this university project. They are not real employers and do not represent live job availability.",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-line-200 bg-white/70 px-3.5 py-2.5 text-[0.78rem] leading-relaxed text-ink-500",
        className,
      )}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function ToolCard({
  icon,
  title,
  description,
  href,
  cta = "Open tool",
  points,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  cta?: string;
  points?: string[];
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-line-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-500 group-hover:text-white">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-[1.05rem] font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-500">{description}</p>
      {points?.length ? (
        <ul className="mt-3.5 space-y-1.5">
          {points.map((p) => (
            <li key={p} className="flex gap-2 text-[0.8rem] text-ink-600">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      ) : null}
      <span className="mt-auto pt-5 text-[0.82rem] font-bold text-brand-600">
        {cta}
        <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">
          {" →"}
        </span>
      </span>
    </Link>
  );
}
