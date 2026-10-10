import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Saved jobs, matches and a full application tracker",
  "A classic CV editor with four templates and PDF export",
  "Local part-time, remote, fresher and inclusive listings in one search",
  "No fees, ever — for job seekers",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden border-r border-line-200 bg-ink-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-brand-300">Your career, organised</p>
          <h2 className="mt-4 font-display text-[1.85rem] font-extrabold leading-tight">
            One account for searching, applying and following up.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-[0.9rem] leading-relaxed text-ink-200">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-400" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* abstract geometric composition, no human imagery */}
        <div className="relative h-44" aria-hidden="true">
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-3xl border border-white/12 bg-white/5" />
          <div className="absolute bottom-8 left-16 h-20 w-20 rounded-full border border-brand-400/40" />
          <div className="absolute bottom-2 right-8 grid h-24 w-40 gap-1.5 rounded-2xl border border-white/12 bg-white/5 p-3">
            {[70, 45, 88].map((w) => (
              <span key={w} className="block h-1.5 rounded-full bg-white/20">
                <span className="block h-full rounded-full bg-brand-400" style={{ width: `${w}%` }} />
              </span>
            ))}
          </div>
        </div>
      </aside>

      <div className="bg-canvas px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
