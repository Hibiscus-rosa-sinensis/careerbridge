import { eq } from "drizzle-orm";
import { AccountSettings } from "@/components/account-settings";
import { Panel } from "@/components/ui";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Account settings" };

export default async function SettingsPage() {
  const session = await requireRole("jobseeker", "/dashboard/settings");
  const user = await db.select().from(users).where(eq(users.id, session.id)).limit(1).then((r) => r[0]);

  return (
    <div className="space-y-5">
      <Panel>
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-600">Dashboard</p>
        <h1 className="mt-2 font-display text-[1.5rem] font-extrabold text-ink-900">Account settings</h1>
        <p className="mt-1.5 max-w-2xl text-[0.88rem] leading-relaxed text-ink-500">
          Update your name and email, change your password, or sign out. Passwords are stored hashed and never shown
          to anyone, including employers.
        </p>
      </Panel>
      <AccountSettings name={user?.name ?? ""} email={user?.email ?? ""} role="jobseeker" />
    </div>
  );
}
