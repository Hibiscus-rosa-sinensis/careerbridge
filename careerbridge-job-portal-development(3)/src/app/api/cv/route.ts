import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cvDocuments } from "@/db/schema";
import { fail, ok, readJson, str } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { emptyCv, type CvContent } from "@/lib/cv";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return fail("Sign in required.", 401);
  const [row] = await db
    .select()
    .from(cvDocuments)
    .where(eq(cvDocuments.userId, user.id))
    .limit(1);
  return ok({ document: row ?? null });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail("Sign in required.", 401);
  const body = await readJson<{ title?: string; template?: string; content?: CvContent }>(req);
  const content = (body.content ?? emptyCv()) as CvContent;
  const template = str(body.template, 40) || "classic";

  const [existing] = await db
    .select({ id: cvDocuments.id })
    .from(cvDocuments)
    .where(eq(cvDocuments.userId, user.id))
    .limit(1);

  const values = { title: str(body.title, 160) || "My CV", template, content, updatedAt: new Date() };

  if (existing) {
    await db.update(cvDocuments).set(values).where(eq(cvDocuments.userId, user.id));
  } else {
    await db.insert(cvDocuments).values({ userId: user.id, ...values });
  }

  return ok({ message: "CV saved to your account." });
}
