import type { ReactNode } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getHeaderUser } from "@/lib/session-user";

export async function generateMetadata() {
  return {
    title: {
      default: "CareerBridge — Find the Right Job. Build Your Future.",
      template: "%s · CareerBridge",
    },
    description:
      "Discover local part-time jobs, remote and IT opportunities, fresher roles and inclusive workplaces across Bangladesh. Build a CV, match with jobs and track every application.",
  } satisfies import("next").Metadata;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getHeaderUser();

  return (
    <html lang="en">
      <body className="bg-white text-ink-900 antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader user={user} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
