import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, companies, jobs, users } from "@/db/schema";
import { fail, num, ok, readJson, revalidateJobs, str } from "@/lib/api";
import { getSessionUser, isEmail } from "@/lib/auth";

/** Job seekers see their own applications; employers see applications on their own vacancies. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return fail("Sign in required.", 401);

  if (user.role === "employer") {
    const rows = await db
      .select({
        application: applications,
        job: { id: jobs.id, title: jobs.title, status: jobs.status, reference: jobs.reference },
        applicant: { name: users.name, email: users.email },
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(users, eq(users.id, applications.userId))
      .where(eq(jobs.employerId, user.id))
      .orderBy(desc(applications.appliedAt));
    return ok({
      applications: rows.map((r) => ({
        ...r.application,
        jobTitle: r.job?.title ?? r.application.jobTitle,
        jobStatus: r.job?.status ?? "closed",
        applicantName: r.applicant?.name ?? r.application.contactName,
      })),
    });
  }

  const rows = await db
    .select({
      application: applications,
      job: { id: jobs.id, title: jobs.title, status: jobs.status },
      company: { name: companies.name },
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(applications.userId, user.id))
    .orderBy(desc(applications.appliedAt));

  return ok({
    applications: rows.map((r) => ({
      ...r.application,
      companyName: r.company?.name || r.application.companyName,
      jobStatus: r.job?.status ?? "closed",
    })),
  });
}

/** Record an application against a published vacancy. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in to apply.", 401);
  if (user.role !== "jobseeker") return fail("Only job seeker accounts can apply for jobs.", 403);

  const body = await readJson<Record<string, unknown>>(req);
  const jobId = num(body.jobId);
  if (!jobId) return fail("Missing job reference.", 422);

  const [job] = await db
    .select({ job: jobs, company: { name: companies.name } })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobs.id, jobId))
    .limit(1);
  if (!job) return fail("That job no longer exists.", 404);
  if (job.job.status !== "published")
    return fail("This vacancy is closed and no longer accepting applications.", 409);
  if (job.job.deadline && new Date(`${job.job.deadline}T23:59:59`).getTime() < Date.now())
    return fail("The application deadline for this job has passed.", 409);
  if (job.job.employerId === user.id) return fail("You cannot apply for your own job post.", 403);

  const name = str(body.contactName, 120);
  const email = str(body.contactEmail, 200).toLowerCase();
  const fields: Record<string, string> = {};
  if (name.length < 2) fields.contactName = "Enter your full name.";
  if (!isEmail(email)) fields.contactEmail = "Enter a valid email address.";
  if (Object.keys(fields).length) return fail("Please fix the highlighted fields.", 422, fields);

  const duplicate = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.userId, user.id), eq(applications.jobId, jobId)))
    .limit(1);
  if (duplicate.length)
    return fail("You already applied for this job. Track it in your application list.", 409);

  const [record] = await db
    .insert(applications)
    .values({
      userId: user.id,
      jobId: job.job.id,
      employerId: job.job.employerId,
      jobTitle: job.job.title,
      companyName: job.company?.name ?? "",
      jobReference: job.job.reference,
      contactName: name,
      contactEmail: email,
      contactPhone: str(body.contactPhone, 40),
      coverNote: str(body.coverNote, 2000),
      cvTemplate: str(body.cvTemplate, 60),
      status: "applied",
      privateNotes: str(body.privateNotes, 2000),
    })
    .returning();

  revalidateJobs(job.job.id);
  return ok({ application: record, redirect: "/dashboard/applications" });
}
