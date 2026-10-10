import { eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { jobCategories, jobs } from "@/db/schema";
import { list, num, str } from "@/lib/api";

export type JobPayload = {
  values: Partial<typeof jobs.$inferInsert>;
  errors: Record<string, string>;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export function newReference() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CB-${year}-${rand}`;
}

const EMPLOYMENT = ["part-time", "full-time", "temporary", "internship", "shift", "freelance"];
const MODES = ["onsite", "hybrid", "remote"];
const EXPERIENCE = ["fresher", "entry", "junior", "mid", "senior", "any"];

export async function categoryIdFor(slug: string): Promise<number | null> {
  if (!slug) return null;
  const [row] = await db
    .select({ id: jobCategories.id })
    .from(jobCategories)
    .where(ilike(jobCategories.slug, `%${slug}%`))
    .limit(1);
  if (row) return row.id;
  // Unknown category name from a free-text field: create it so the post still works.
  const clean = slugify(slug);
  if (!clean) return null;
  const [created] = await db
    .insert(jobCategories)
    .values({
      slug: clean,
      name: slug.trim().slice(0, 80),
      description: "",
      icon: "Building2",
      group: "general",
    })
    .returning({ id: jobCategories.id });
  return created?.id ?? null;
}

export async function parseJobPayload(body: Record<string, unknown>): Promise<JobPayload> {
  const errors: Record<string, string> = {};

  const title = str(body.title, 160);
  if (title.length < 4) errors.title = "Give the vacancy a clear title (at least 4 characters).";

  const employmentType = str(body.employmentType, 30) || "part-time";
  if (!EMPLOYMENT.includes(employmentType)) errors.employmentType = "Choose an employment type.";

  const workMode = str(body.workMode, 20) || "onsite";
  if (!MODES.includes(workMode)) errors.workMode = "Choose a work arrangement.";

  const experienceLevel = str(body.experienceLevel, 20) || "any";
  if (!EXPERIENCE.includes(experienceLevel)) errors.experienceLevel = "Choose an experience level.";

  const district = str(body.district, 60);
  const division = str(body.division, 60);
  if (workMode !== "remote" && !district && !division)
    errors.district = "Add a district or division so nearby candidates can find the job.";

  const salaryMin = num(body.salaryMin);
  const salaryMax = num(body.salaryMax);
  if (salaryMin !== null && salaryMin < 0) errors.salaryMin = "Salary cannot be negative.";
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin)
    errors.salaryMax = "Maximum pay must be equal to or above minimum pay.";

  const deadline = str(body.deadline, 20);
  if (deadline && Number.isNaN(new Date(deadline).getTime())) errors.deadline = "Enter a valid date.";

  const description = str(body.description, 6000);
  if (description.length > 0 && description.length < 40)
    errors.description = "Add a little more detail (at least 40 characters) about the role.";

  const categoryId = await categoryIdFor(str(body.category, 80));

  const values: Partial<typeof jobs.$inferInsert> = {
    title,
    summary: str(body.summary, 320),
    description,
    responsibilities: str(body.responsibilities, 3000),
    requirements: str(body.requirements, 3000),
    applicationInstructions: str(body.applicationInstructions, 1500),
    benefits: str(body.benefits, 1200),
    employmentType,
    workMode,
    experienceLevel,
    educationLevel: str(body.educationLevel, 30),
    workingHours: str(body.workingHours, 80),
    shift: str(body.shift, 60),
    division,
    district,
    upazila: str(body.upazila, 60),
    salaryMin,
    salaryMax,
    salaryPeriod: str(body.salaryPeriod, 20) || "month",
    payRate: str(body.payRate, 60),
    requiredSkills: list(body.requiredSkills),
    preferredSkills: list(body.preferredSkills),
    accessibilityFacilities: list(body.accessibilityFacilities),
    interviewAccommodations: str(body.interviewAccommodations, 800),
    flexibleHours: Boolean(body.flexibleHours),
    deadline: deadline ? deadline.slice(0, 10) : null,
    categoryId,
    status: str(body.status, 20) === "draft" ? "draft" : "published",
  };

  return { values, errors };
}

export async function companyForEmployer(userId: number) {
  const { companies } = await import("@/db/schema");
  const [row] = await db.select().from(companies).where(eq(companies.ownerId, userId)).limit(1);
  return row ?? null;
}
