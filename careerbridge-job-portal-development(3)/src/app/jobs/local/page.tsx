import { JobsView } from "@/components/jobs-view";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui";
import { MapPin, Store, Coffee, BookOpen, ShoppingCart, UtensilsCrossed } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Local Part-Time Jobs",
  description:
    "Part-time, temporary and shift-based vacancies at shops, cafés, supermarkets, coaching centres and small businesses across Bangladesh.",
};

const EMPLOYERS = [
  { icon: <Store className="h-4 w-4" />, label: "Shops & boutiques" },
  { icon: <Coffee className="h-4 w-4" />, label: "Cafés & restaurants" },
  { icon: <ShoppingCart className="h-4 w-4" />, label: "Supermarkets" },
  { icon: <BookOpen className="h-4 w-4" />, label: "Coaching centres" },
  { icon: <UtensilsCrossed className="h-4 w-4" />, label: "Small food businesses" },
];

export default async function LocalJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Local part-time"
        title="Part-time work near your home or campus"
        description="Shops, restaurants, cafés, supermarkets, coaching centres and small businesses post shift-based and temporary roles here. Filter by division, district and upazila — locations are only shown when the employer provided them."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">Part-time · temporary · shift</Badge>
            <Badge tone="neutral">Pay per day, hour or month</Badge>
          </div>
        }
      >
        <ul className="mt-5 flex flex-wrap gap-2">
          {EMPLOYERS.map((e) => (
            <li
              key={e.label}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-200 bg-white px-2.5 py-1.5 text-[0.78rem] font-semibold text-ink-600"
            >
              <span className="text-brand-500" aria-hidden="true">
                {e.icon}
              </span>
              {e.label}
            </li>
          ))}
        </ul>
      </PageHeader>

      <PageContainer className="py-8 sm:py-10">
        <JobsView
          searchParams={searchParams}
          basePath="/jobs/local"
          mode="local"
          showAside={
            <div className="cb-panel p-5">
              <h2 className="flex items-center gap-2 font-display text-[0.95rem] font-bold text-ink-900">
                <MapPin className="h-4 w-4 text-brand-500" aria-hidden="true" />
                Nearby is only shown when data exists
              </h2>
              <p className="mt-2 text-[0.83rem] leading-relaxed text-ink-500">
                CareerBridge does not use GPS or claim a job is “near you”. Select a division, then a district and —
                where we have that detail — an upazila or thana. Results are limited to what the employer actually
                published.
              </p>
            </div>
          }
        />
      </PageContainer>
    </>
  );
}
