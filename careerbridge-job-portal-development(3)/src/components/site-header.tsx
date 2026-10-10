"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

export type HeaderUser = { name: string; role: "jobseeker" | "employer" };

const NAV = [
  { label: "Home", href: "/" },
  { label: "Find Jobs", href: "/jobs" },
  { label: "Local Part-Time", href: "/jobs/local" },
  { label: "Remote & IT", href: "/jobs/remote" },
  { label: "Career Tools", href: "/career-tools" },
  { label: "For Employers", href: "/employers" },
];

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const dashboardHref = user?.role === "employer" ? "/employer/dashboard" : "/dashboard";

  return (
    <header className="site-header sticky top-0 z-50 border-b border-line-200 bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden flex-1 items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-[0.86rem] font-semibold transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-canvas hover:text-ink-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Badge tone="accent" className="mr-1 hidden xl:inline-flex">
                {user.role === "employer" ? "Employer account" : "Job seeker"}
              </Badge>
              <Link href={dashboardHref} className={buttonClass({ variant: "outline", size: "sm" })}>
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={signOut}
                className={buttonClass({ variant: "ghost", size: "sm" })}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={buttonClass({ variant: "ghost", size: "sm" })}
              >
                Sign In
              </Link>
              <Link href="/auth/register" className={buttonClass({ variant: "primary", size: "sm" })}>
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-line-300 text-ink-700 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line-200 bg-white lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <ul className="divide-y divide-line-100">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-1 py-3 text-[0.95rem] font-semibold text-ink-800 hover:text-brand-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <Link href={dashboardHref} className={buttonClass({ variant: "outline", size: "md" })}>
                    Dashboard
                  </Link>
                  <button type="button" onClick={signOut} className={buttonClass({ variant: "secondary", size: "md" })}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className={buttonClass({ variant: "outline", size: "md" })}>
                    Sign In
                  </Link>
                  <Link href="/auth/register" className={buttonClass({ variant: "primary", size: "md" })}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
