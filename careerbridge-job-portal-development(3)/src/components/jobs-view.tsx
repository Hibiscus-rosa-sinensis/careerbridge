import Link from "next/link";
import { SearchX } from "lucide-react";
import { JobGrid } from "@/components/job-list";
import { JobFilters, Pagination, emptyFilters, filtersFromParams, type FilterState } from "@/components/job-filters";
import { DemoNotice } from "@/components/page-shell";
import { ButtonLink, EmptyState } from "@/components/ui";
import { getCategories, searchJobs, getSavedJobIds } from "@/lib/jobs";
import { toJobCardData } from "@/lib/serialize";
import type { JobFilterParams } from "@/lib/jobs";
import { getSessionUser } from "@/lib/auth";

const REMOTE_CATEGORIES = [
  "web-development",
  "software-engineering",
  "design",
  "digital-marketing",
  "it-support",
];

const LOCAL_CATEGORIES = ["retail-shop", "cafe-restaurant", "coaching", "supermarket", "delivery-logistics", "admin-office", "data-entry"];

export type ListingMode = "all" | "local" | "remote" | "fresher" | "inclusive";

export async function JobsView({
  searchParams,
  basePath = "/jobs",
  mode = "all",
  perPage = 9,
  showAside,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  basePath?: string;
  mode?: ListingMode;
  perPage?: number;
  showAside?: React.ReactNode;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const filters: FilterState = filtersFromParams(sp);

  const query: JobFilterParams = {
    q: filters.q,
    category: filters.category,
    division: filters.division,
    district: filters.district,
    upazila: filters.upazila,
    employmentTypes: filters.types,
    workModes: filters.modes,
    experienceLevels: filters.experience,
    educationLevels: filters.education,
    minSalary: filters.salary || undefined,
    onlyEntryLevel: filters.entry || mode === "fresher",
    onlyAccessible: filters.accessible || mode === "inclusive",
    onlyFlexible: filters.flexible,
    openOnly: true,
    sort: filters.sort === "salary" ? "salary" : "recent",
    page,
    perPage,
  };

  if (mode === "local") {
    query.categories = LOCAL_CATEGORIES;
    if (!query.employmentTypes?.length) query.employmentTypes = ["part-time", "temporary", "shift"];
  }
  if (mode === "remote") query.categories = REMOTE_CATEGORIES;
  if (mode === "fresher" && !query.experienceLevels?.length)
    query.experienceLevels = ["fresher", "entry"];

  const [result, categories, session] = await Promise.all([
    searchJobs(query),
    getCategories(),
    getSessionUser(),
  ]);
  const savedIds = session ? Array.from(await getSavedJobIds(session.id)) : [];

  const scoped =
    mode === "all"
      ? categories
      : categories.filter((c) => (mode === "remote" ? REMOTE_CATEGORIES.includes(c.slug) : LOCAL_CATEGORIES.includes(c.slug)));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <JobFilters
          initial={filters}
          basePath={basePath}
          total={result.total}
          categories={scoped.map((c) => ({ slug: c.slug, name: c.name, count: c.count }))}
          show={{
            modes: true,
            experience: mode !== "fresher",
            education: true,
            location: true,
            types: true,
            entry: true,
            accessible: true,
            flexible: true,
            category: mode !== "local" && mode !== "remote",
          }}
        />

        {result.results.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<SearchX className="h-5 w-5" aria-hidden="true" />}
              title="No vacancies match these filters"
              description="This is a real search over the project's demonstration dataset — nothing is invented to fill the page. Try removing a filter, widening the location, or browsing another category."
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Link href={basePath} className="rounded-lg bg-brand-500 px-3.5 py-2 text-[0.82rem] font-semibold text-white hover:bg-brand-600">
                    Clear all filters
                  </Link>
                  {mode === "local" ? (
                    <Link href="/jobs/remote" className="rounded-lg border border-line-300 bg-white px-3.5 py-2 text-[0.82rem] font-semibold text-ink-700 hover:border-ink-300">
                      Look at remote roles instead
                    </Link>
                  ) : null}
                  {mode === "remote" ? (
                    <Link href="/jobs/local" className="rounded-lg border border-line-300 bg-white px-3.5 py-2 text-[0.82rem] font-semibold text-ink-700 hover:border-ink-300">
                      Look at local part-time instead
                    </Link>
                  ) : null}
                  <Link href="/jobs" className="rounded-lg border border-line-300 bg-white px-3.5 py-2 text-[0.82rem] font-semibold text-ink-700 hover:border-ink-300">
                    All jobs
                  </Link>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-6">
            <JobGrid
              jobs={result.results.map(toJobCardData)}
              savedIds={savedIds}
              signedIn={Boolean(session)}
              columns={2}
            />
            <Pagination
              page={result.page}
              pages={result.pages}
              basePath={basePath}
              filters={filters === emptyFilters ? emptyFilters : filters}
              total={result.total}
              perPage={perPage}
            />
          </div>
        )}

        <DemoNotice className="mt-8">
          Listings are sample records generated for this project. Employer names, pay ranges, deadlines and
          application instructions are examples — no vacancy here is a live job offer.
        </DemoNotice>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {showAside}
        <div className="cb-panel p-5">
          <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Refine by category</h2>
          <ul className="mt-3 space-y-1.5">
            {scoped.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`${basePath}?cat=${c.slug}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[0.83rem] font-medium text-ink-600 hover:bg-canvas hover:text-brand-600"
                >
                  {c.name}
                  <span className="text-[0.72rem] font-bold text-ink-300">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="cb-panel bg-canvas p-5">
          <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Looking for something specific?</h2>
          <ul className="mt-3 space-y-2 text-[0.83rem] text-ink-600">
            <li><Link className="font-semibold text-brand-600 hover:underline" href="/jobs/local">Local part-time jobs</Link></li>
            <li><Link className="font-semibold text-brand-600 hover:underline" href="/jobs/remote">Remote &amp; IT jobs</Link></li>
            <li><Link className="font-semibold text-brand-600 hover:underline" href="/jobs?entry=1">Fresher &amp; internship roles</Link></li>
            <li><Link className="font-semibold text-brand-600 hover:underline" href="/jobs/inclusive">Inclusive workplaces</Link></li>
          </ul>
          <ButtonLink href="/career-tools/matching" variant="outline" size="sm" className="mt-4 w-full">
            Match jobs to my profile
          </ButtonLink>
        </div>
      </aside>
    </div>
  );
}
