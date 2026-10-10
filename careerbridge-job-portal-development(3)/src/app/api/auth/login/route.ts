import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fail, ok, readJson, str } from "@/lib/api";
import { isEmail, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await readJson<Record<string, unknown>>(req);
  const email = str(body.email, 200).toLowerCase();
  const password = str(body.password, 200);
  if (!isEmail(email) || !password)
    return fail("Enter your email and password.", 422, {
      ...(isEmail(email) ? {} : { email: "Enter a valid email address." }),
      ...(password ? {} : { password: "Password is required." }),
    });

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash)))
    return fail("Email or password is incorrect.", 401);

  const role = user.role === "employer" ? "employer" : "jobseeker";
  await setSessionCookie(user.id, role);
  return ok({ user: { id: user.id, name: user.name, role } });
}
