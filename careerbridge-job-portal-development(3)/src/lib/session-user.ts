import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type HeaderUser = { name: string; role: "jobseeker" | "employer" };

export async function getHeaderUser(): Promise<HeaderUser | null> {
  const session = await getSessionUser();
  if (!session) return null;
  try {
    const [row] = await db
      .select({ name: users.name, role: users.role })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);
    if (!row) return null;
    return { name: row.name, role: row.role === "employer" ? "employer" : "jobseeker" };
  } catch {
    return null;
  }
}
