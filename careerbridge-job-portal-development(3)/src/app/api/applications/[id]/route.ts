import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { fail, num, ok, readJson, revalidateJobs, str } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

const SEEKER_STATUSES = ["applied", "under-review", "interview", "offer", "rejected", "withdrawn", "no-response"];
const EMPLOYER_STATUSES = ["applied", "under-review", "shortlisted", "interview", "offer", "rejected"];

type AppPatch = Partial<typeof applications.$inferInsert>;

async function findOwned(id: number, userId: number) {
  const [row] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!row) return null;
  let isOwner = false;
  if (row.jobId) {
    const [job] = await db.select({ employerId: jobs.employerId }).from(jobs).where(eq(jobs.id, row.jobId)).limit(1);
    isOwner = Boolean(job) && job.employerId === userId;
  }
  return { row, can: { isOwner, isApplicant: row.userId === userId } };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in required.", 401);
  const appId = num((await params).id);
  if (!appId) return fail("Unknown application.", 404);

  const owned = await findOwned(appId, user.id);
  if (!owned) return fail("You do not have permission to change this application.", 403);

  const body = await readJson<Record<string, unknown>>(req);
  const values: AppPatch = { updatedAt: new Date() };

  if (user.role === "jobseeker") {
    if (!owned.can.isApplicant) return fail("Only the applicant can update their own tracker.", 403);
    const status = str(body.status, 30);
    if (status) {
      if (!SEEKER_STATUSES.includes(status)) return fail("Unknown status.", 422);
      values.status = status;
    }
    if (typeof body.privateNotes === "string") values.privateNotes = str(body.privateNotes, 2000);
    if (body.interviewAt === "") {
      values.interviewAt = null;
    } else if (typeof body.interviewAt === "string" && body.interviewAt) {
      const d = new Date(body.interviewAt);
      if (!Number.isNaN(d.getTime())) values.interviewAt = d;
    }
    if (typeof body.interviewMode === "string") values.interviewMode = str(body.interviewMode, 40);
    if (typeof body.contactPhone === "string") values.contactPhone = str(body.contactPhone, 40);
  } else {
    if (!owned.can.isOwner)
      return fail("Employers can only manage applications submitted to their own vacancies.", 403);
    const status = str(body.status, 30);
    if (status) {
      if (!EMPLOYER_STATUSES.includes(status)) return fail("Unknown status.", 422);
      values.status = status;
      if (status === "interview") {
        const when = str(body.interviewAt, 40);
        if (when) {
          const d = new Date(when);
          if (!Number.isNaN(d.getTime())) values.interviewAt = d;
        }
        values.interviewMode = str(body.interviewMode, 40);
      }
    }
    if (typeof body.employerNotes === "string") values.employerNotes = str(body.employerNotes, 2000);
  }

  const [updated] = await db
    .update(applications)
    .set(values)
    .where(eq(applications.id, appId))
    .returning();

  revalidateJobs(owned.row.jobId ?? undefined);
  return ok({ application: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in required.", 401);
  const appId = num((await params).id);
  if (!appId) return fail("Unknown application.", 404);
  const owned = await findOwned(appId, user.id);
  if (!owned) return fail("You do not have permission to remove this record.", 403);
  if (!owned.can.isApplicant)
    return fail("Employers update an applicant's status rather than deleting their record.", 403);

  await db.delete(applications).where(and(eq(applications.id, appId), eq(applications.userId, user.id)));
  revalidateJobs(owned.row.jobId ?? undefined);
  return ok();
}
