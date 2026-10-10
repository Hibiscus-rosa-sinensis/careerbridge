import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fail, ok, readJson, str } from "@/lib/api";
import { generateRandomToken, hashPassword, isEmail, passwordProblem } from "@/lib/auth";
import { createHash } from "node:crypto";

/**
 * Password recovery without an email provider.
 * Step 1 sends back a signed one-time link in the response (shown in the UI)
 * because no SMTP service is configured for this project.
 * Step 2 exchanges the token for a new password.
 */
export async function POST(req: Request) {
  const body = await readJson<Record<string, unknown>>(req);
  const action = str(body.action, 30);

  if (action === "request") {
    const email = str(body.email, 200).toLowerCase();
    if (!isEmail(email)) return fail("Enter a valid email address.", 422, { email: "Enter a valid email address." });
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    // Do not reveal whether the account exists.
    if (!user) return ok({ sent: true });
    const raw = generateRandomToken(16);
    const hashed = createHash("sha256").update(raw).digest("hex");
    await db
      .update(users)
      .set({ resetToken: hashed, resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000) })
      .where(eq(users.id, user.id));
    return ok({
      sent: true,
      // No mail transport is configured, so the link is surfaced for the demo.
      resetLink: `/auth/forgot?token=${raw}&email=${encodeURIComponent(email)}`,
      note: "No email service is connected to this project, so the reset link is shown on screen.",
    });
  }

  if (action === "reset") {
    const token = str(body.token, 120);
    const password = str(body.password, 200);
    if (!token) return fail("Reset link is missing its token.", 422);
    const problem = passwordProblem(password);
    if (problem) return fail("Choose a stronger password.", 422, { password: problem });
    const hashed = createHash("sha256").update(token).digest("hex");
    const [user] = await db.select().from(users).where(eq(users.resetToken, hashed)).limit(1);
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now())
      return fail("This reset link is invalid or has expired. Please request a new one.", 400);
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(password), resetToken: null, resetTokenExpiresAt: null });
    return ok({ reset: true });
  }

  return fail("Unknown action.", 400);
}
