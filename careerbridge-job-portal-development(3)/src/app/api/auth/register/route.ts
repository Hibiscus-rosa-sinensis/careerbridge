import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, seekerProfiles, users } from "@/db/schema";
import { fail, ok, readJson, str } from "@/lib/api";
import { hashPassword, isEmail, passwordProblem, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await readJson<Record<string, unknown>>(req);
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const password = str(body.password, 200);
  const role = str(body.role, 20) === "employer" ? "employer" : "jobseeker";
  const companyName = str(body.companyName, 160);

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Enter your full name (at least 2 characters).";
  if (!isEmail(email)) fields.email = "Enter a valid email address.";
  const pwProblem = passwordProblem(password);
  if (pwProblem) fields.password = pwProblem;
  if (role === "employer" && companyName.length < 2)
    fields.companyName = "Employer accounts need a company or business name.";
  if (Object.keys(fields).length) return fail("Please fix the highlighted fields.", 422, fields);

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return fail("An account with this email already exists.", 409, { email: "Use another email or sign in." });

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning({ id: users.id, name: users.name, role: users.role });

  if (role === "jobseeker") {
    await db.insert(seekerProfiles).values({ userId: user.id, skills: [], preferredCategories: [], preferredLocations: [], preferredEmploymentTypes: [], accessibilityNeeds: [] });
  } else {
    await db.insert(companies).values({
      ownerId: user.id,
      name: companyName,
      contactEmail: email,
      district: str(body.district, 60),
      division: str(body.division, 60),
      industry: str(body.industry, 120),
      about: str(body.about, 1200),
    });
  }

  await setSessionCookie(user.id, user.role as "jobseeker" | "employer");
  return ok({ user: { id: user.id, name: user.name, role: user.role } });
}
