import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { fail, ok, readJson, revalidateJobs, str } from "@/lib/api";
import { getSessionUser, isEmail } from "@/lib/auth";

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in required.", 401);
  if (user.role !== "employer") return fail("Only employer accounts can edit a company profile.", 403);

  const body = await readJson<Record<string, unknown>>(req);
  const name = str(body.name, 160);
  const email = str(body.contactEmail, 200).toLowerCase();
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Company or business name is required.";
  if (email && !isEmail(email)) errors.contactEmail = "Enter a valid contact email.";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", 422, errors);

  const values = {
    name,
    industry: str(body.industry, 120),
    size: str(body.size, 60),
    about: str(body.about, 2500),
    website: str(body.website, 200),
    contactEmail: email,
    phone: str(body.phone, 40),
    division: str(body.division, 60),
    district: str(body.district, 60),
    address: str(body.address, 240),
    accessibilityInfo: str(body.accessibilityInfo, 2000),
  };

  const [existing] = await db.select().from(companies).where(eq(companies.ownerId, user.id)).limit(1);
  if (existing) {
    await db.update(companies).set(values).where(eq(companies.id, existing.id));
  } else {
    await db.insert(companies).values({ ownerId: user.id, isDemo: false, ...values });
  }

  revalidateJobs();
  return ok({ message: "Company profile updated." });
}
