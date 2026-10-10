import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { PageContainer } from "@/components/page-shell";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="dot-field">
      <PageContainer className="py-20 text-center sm:py-28">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-line-200 bg-white text-brand-600" aria-hidden="true">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-6 font-display text-[0.8rem] font-bold uppercase tracking-[0.2em] text-ink-400">Error 404</p>
        <h1 className="mt-2 font-display text-[2rem] font-extrabold text-ink-900">That page is not here</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-relaxed text-ink-500">
          The link may be out of date, or the vacancy you were looking at was removed from the demonstration dataset.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Link href="/jobs" className={buttonClass({ variant: "primary" })}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Search all jobs
          </Link>
          <Link href="/jobs/local" className={buttonClass({ variant: "outline" })}>
            Local part-time
          </Link>
          <Link href="/" className={buttonClass({ variant: "ghost" })}>
            Back to the homepage
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
