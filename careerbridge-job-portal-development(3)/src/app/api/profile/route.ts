import { eq } from "drizzle-orm";
import { db } from "@/db";
import { seekerProfiles } from "@/db/schema";
import { fail, list, num, ok, readJson, revalidateJobs, str } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in required.", 401);
  if (user.role !== "jobseeker") return fail("Only job seeker profiles can be updated here.", 403);

  const body = await readJson<Record<string, unknown>>(req);
  const values = {
    headline: str(body.headline, 160),
    bio: str(body.bio, 1200),
    phone: str(body.phone, 40),
    division: str(body.division, 60),
    district: str(body.district, 60),
    upazila: str(body.upazila, 60),
    educationLevel: str(body.educationLevel, 40),
    institution: str(body.institution, 160),
    fieldOfStudy: str(body.fieldOfStudy, 120),
    graduationYear: num(body.graduationYear),
    experienceLevel: str(body.experienceLevel, 40) || "fresher",
    skills: list(body.skills),
    preferredCategories: list(body.preferredCategories),
    preferredLocations: list(body.preferredLocations),
    preferredEmploymentTypes: list(body.preferredEmploymentTypes),
    workMode: str(body.workMode, 20) || "any",
    salaryExpectation: num(body.salaryExpectation) ?? 0,
    availability: str(body.availability, 60),
    accessibilityNeeds: list(body.accessibilityNeeds),
    needsAccommodation: Boolean(body.needsAccommodation),
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select({ id: seekerProfiles.id })
    .from(seekerProfiles)
    .where(eq(seekerProfiles.userId, user.id))
    .limit(1);

  if (existing) {
    await db.update(seekerProfiles).set(values).where(eq(seekerProfiles.userId, user.id));
  } else {
    await db.insert(seekerProfiles).values({ userId: user.id, ...values });
  }

  revalidateJobs();
  return ok({ message: "Profile saved. Job recommendations refreshed." });
}
