import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "cb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 16) return raw;
  // Local development fallback. Set AUTH_SECRET in .env for any real deployment.
  return "careerbridge-dev-secret-change-me";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

type SessionPayload = { uid: number; role: "jobseeker" | "employer"; exp: number };

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string) {
  return b64url(createHmac("sha256", secret()).update(data).digest());
}

export function createToken(uid: number, role: "jobseeker" | "employer") {
  const payload: SessionPayload = { uid, role, exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function readToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64").toString("utf8"),
    ) as SessionPayload;
    if (!payload.uid || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(uid: number, role: "jobseeker" | "employer") {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(uid, role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export type SessionUser = { id: number; role: "jobseeker" | "employer" };

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const payload = readToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return { id: payload.uid, role: payload.role };
}

/** Redirects guests to the sign in page and returns the session otherwise. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/auth/signin?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireRole(role: "jobseeker" | "employer", next: string) {
  const user = await requireUser(next);
  if (user.role !== role) {
    redirect(role === "employer" ? "/auth/signin?next=/employer/dashboard" : "/dashboard");
  }
  return user;
}

export function generateRandomToken(bytes = 24) {
  return randomBytes(bytes).toString("hex");
}

/* ----------------------------- validation ----------------------------- */

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());
}

export function passwordProblem(value: string): string | null {
  if (!value || value.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value))
    return "Password must combine letters and numbers.";
  return null;
}

export function required(value: string | null | undefined, field: string): string | null {
  if (!value || !value.trim()) return `${field} is required.`;
  return null;
}
