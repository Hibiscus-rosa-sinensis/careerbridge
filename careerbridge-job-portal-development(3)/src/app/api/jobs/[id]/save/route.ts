import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedJobs } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { revalidateJobs } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in to save jobs.", 401);
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) return fail("Unknown job.", 404);

  const existing = await db
    .select({ id: savedJobs.id })
    .from(savedJobs)
    .where(and(eq(savedJobs.userId, user.id), eq(savedJobs.jobId, jobId)))
    .limit(1);

  if (existing.length) {
    await db.delete(savedJobs).where(eq(savedJobs.id, existing[0].id));
    revalidateJobs(jobId);
    return ok({ saved: false });
  }

  try {
    await db.insert(savedJobs).values({ userId: user.id, jobId });
  } catch {
    return fail("This job is already in your saved list.", 409);
  }
  revalidateJobs(jobId);
  return ok({ saved: true });
}
