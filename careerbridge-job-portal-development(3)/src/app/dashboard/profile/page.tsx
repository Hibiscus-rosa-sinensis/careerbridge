import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/profile-form";
import { Panel } from "@/components/ui";
import { db } from "@/db";
import { seekerProfiles, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { getCategories } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile & matching settings",
  description: "Education, skills, preferences and optional accessibility settings used by Smart Job Matching.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole("jobseeker", "/dashboard/profile");
  const sp = await searchParams;
  const [user, profile, categories] = await Promise.all([
    db.select().from(users).where(eq(users.id, session.id)).limit(1).then((r) => r[0]),
    db.select().from(seekerProfiles).where(eq(seekerProfiles.userId, session.id)).limit(1).then((r) => r[0]),
    getCategories(),
  ]);

  return (
    <div className="space-y-5">
      <Panel>
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-600">Dashboard</p>
        <h1 className="mt-2 font-display text-[1.5rem] font-extrabold text-ink-900">Profile &amp; matching settings</h1>
        <p className="mt-1.5 max-w-2xl text-[0.88rem] leading-relaxed text-ink-500">
          This information powers Smart Job Matching and pre-fills your applications. Employers only see it after you
          apply to one of their vacancies — it is never broadcast to every company, and it is never used to assume
          anything about your ability.
        </p>
      </Panel>

      <ProfileForm
        userId={session.id}
        profile={profile ?? null}
        userName={user?.name ?? ""}
        userEmail={user?.email ?? ""}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        focusAccessibility={sp.focus === "accessibility"}
      />
    </div>
  );
}
