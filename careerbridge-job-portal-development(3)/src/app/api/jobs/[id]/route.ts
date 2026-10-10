import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { fail, num, ok, readJson, revalidateJobs } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { parseJobPayload } from "@/lib/job-payload";

async function ownedJob(jobId: number, userId: number) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!job) return null;
  if (job.employerId !== userId) return { job, allowed: false };
  return { job, allowed: true };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "employer") return fail("Employer account required.", 403);
  const jobId = num((await params).id);
  if (!jobId) return fail("Unknown job.", 404);

  const owned = await ownedJob(jobId, user.id);
  if (!owned) return fail("Job not found.", 404);
  if (!owned.allowed) return fail("You can only edit vacancies posted by your own company.", 403);

  const body = await readJson<Record<string, unknown>>(req);

  // Quick status change (publish / close / reopen) without a full form payload.
  if (Object.keys(body).length === 1 && typeof body.status === "string") {
    const status = body.status;
    if (!["draft", "published", "closed"].includes(status)) return fail("Unknown status.", 422);
    const [updated] = await db
      .update(jobs)
      .set({ status, updatedAt: new Date() })
      .where(eq(jobs.id, jobId))
      .returning();
    revalidateJobs(jobId);
    return ok({ job: updated, message: `Job marked as ${status}.` });
  }

  const { values, errors } = await parseJobPayload(body);
  if (Object.keys(errors).length) return fail("Some fields need attention.", 422, errors);

  const [updated] = await db
    .update(jobs)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(jobs.id, jobId))
    .returning();

  revalidateJobs(jobId);
  return ok({ job: updated, message: "Vacancy updated." });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "employer") return fail("Employer account required.", 403);
  const jobId = num((await params).id);
  if (!jobId) return fail("Unknown job.", 404);

  const owned = await ownedJob(jobId, user.id);
  if (!owned) return fail("Job not found.", 404);
  if (!owned.allowed) return fail("You can only remove vacancies posted by your own company.", 403);

  const [applied] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.jobId, jobId)))
    .limit(1);

  if (applied) {
    await db.update(jobs).set({ status: "closed", updatedAt: new Date() }).where(eq(jobs.id, jobId));
    revalidateJobs(jobId);
    return ok({
      closed: true,
      message:
        "This vacancy already has applications, so it was closed instead of deleted to keep applicant records intact.",
    });
  }

  await db.delete(jobs).where(eq(jobs.id, jobId));
  revalidateJobs(jobId);
  return ok({ deleted: true, message: "Vacancy deleted." });
}
