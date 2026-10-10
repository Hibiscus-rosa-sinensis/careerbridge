import { db } from "@/db";
import { jobs } from "@/db/schema";
import { fail, ok, readJson, revalidateJobs } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { newReference, parseJobPayload } from "@/lib/job-payload";
import { companyForEmployer } from "@/lib/job-payload";

/** Employers publish new vacancies here. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in as an employer to post a job.", 401);
  if (user.role !== "employer") return fail("Only employer accounts can publish vacancies.", 403);

  const body = await readJson<Record<string, unknown>>(req);
  const { values, errors } = await parseJobPayload(body);
  if (Object.keys(errors).length) return fail("Some fields need attention.", 422, errors);

  const company = await companyForEmployer(user.id);
  if (!company) return fail("Complete your company profile before posting a job.", 422);

  const [record] = await db
    .insert(jobs)
    .values({
      ...values,
      reference: newReference(),
      title: values.title ?? "Untitled vacancy",
      employmentType: values.employmentType ?? "part-time",
      workMode: values.workMode ?? "onsite",
      experienceLevel: values.experienceLevel ?? "any",
      status: values.status ?? "published",
      employerId: user.id,
      companyId: company.id,
      isDemo: false,
    })
    .returning();

  revalidateJobs(record.id);
  return ok({ job: record, message: "Vacancy published." });
}
