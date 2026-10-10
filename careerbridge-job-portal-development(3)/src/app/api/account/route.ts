import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fail, ok, readJson, str } from "@/lib/api";
import { getSessionUser, hashPassword, isEmail, passwordProblem, verifyPassword } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSessionUser();
  if (!session) return fail("Sign in required.", 401);

  const body = await readJson<Record<string, unknown>>(req);
  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user) return fail("Account not found.", 404);

  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  if (typeof body.name === "string") {
    const name = str(body.name, 120);
    if (name.length < 2) errors.name = "Enter your full name.";
    else values.name = name;
  }

  if (typeof body.email === "string") {
    const email = str(body.email, 200).toLowerCase();
    if (!isEmail(email)) errors.email = "Enter a valid email address.";
    else {
      const clash = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (clash.length && clash[0].id !== user.id) errors.email = "That email is already used by another account.";
      else values.email = email;
    }
  }

  if (body.currentPassword || body.newPassword) {
    const current = str(body.currentPassword, 200);
    const next = str(body.newPassword, 200);
    if (!(await verifyPassword(current, user.passwordHash)))
      errors.currentPassword = "Your current password is not correct.";
    const problem = passwordProblem(next);
    if (problem) errors.newPassword = problem;
    if (!errors.currentPassword && !errors.newPassword) values.passwordHash = await hashPassword(next);
  }

  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", 422, errors);
  if (!Object.keys(values).length) return fail("Nothing to save.", 422);

  const [updated] = await db
    .update(users)
    .set(values)
    .where(eq(users.id, user.id))
    .returning({ id: users.id, name: users.name, email: users.email });

  return ok({ user: updated, message: "Account settings updated." });
}
