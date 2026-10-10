import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkCheck, LayoutDashboard, ListChecks, Sparkles, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "Applications", icon: ListChecks },
  { href: "/dashboard/saved", label: "Saved jobs", icon: BookmarkCheck },
  { href: "/dashboard/profile", label: "Profile & matching", icon: UserRound },
  { href: "/dashboard/settings", label: "Account settings", icon: Sparkles },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("jobseeker", "/dashboard");
  if (!session) redirect("/auth/signin?next=/dashboard");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Job seeker dashboard" className="cb-panel overflow-hidden p-2">
            <p className="px-3 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-400">
              Job seeker dashboard
            </p>
            <ul className="space-y-0.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.86rem] font-semibold transition-colors",
                        t.href === "/dashboard" ? "text-ink-600 hover:bg-canvas hover:text-ink-900" : "text-ink-600 hover:bg-canvas hover:text-ink-900",
                      )}
                    >
                      <Icon className="h-4 w-4 text-ink-300" aria-hidden="true" />
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 rounded-xl bg-canvas p-3">
              <p className="text-[0.76rem] font-bold uppercase tracking-wide text-ink-400">Also available</p>
              <ul className="mt-1.5 space-y-1.5 text-[0.82rem] font-semibold">
                <li>
                  <Link href="/career-tools/cv" className="text-ink-600 hover:text-brand-600">
                    CV writing hub
                  </Link>
                </li>
                <li>
                  <Link href="/career-tools/matching" className="text-ink-600 hover:text-brand-600">
                    Smart job matching
                  </Link>
                </li>
                <li>
                  <Link href="/guidance" className="text-ink-600 hover:text-brand-600">
                    Fresher guidance
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
