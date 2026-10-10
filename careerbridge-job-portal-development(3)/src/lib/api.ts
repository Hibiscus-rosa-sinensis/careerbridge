import { revalidatePath } from "next/cache";

export function ok<T extends Record<string, unknown>>(data: T = {} as T) {
  return Response.json({ ok: true, ...data });
}

export function fail(message: string, status = 400, fields?: Record<string, string>) {
  return Response.json({ ok: false, error: message, ...(fields ? { fields } : {}) }, { status });
}

export async function readJson<T = Record<string, any>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

export function missing(values: Record<string, unknown>, keys: string[]) {
  const fields: Record<string, string> = {};
  for (const k of keys) {
    const v = values[k];
    if (typeof v === "string" ? !v.trim() : v === undefined || v === null) {
      fields[k] = "This field is required.";
    }
  }
  return Object.keys(fields).length ? fields : null;
}

export function str(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function num(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[,\n]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

const REVALIDATE = [
  "/",
  "/jobs",
  "/jobs/local",
  "/jobs/remote",
  "/jobs/inclusive",
  "/dashboard",
  "/dashboard/applications",
  "/dashboard/saved",
  "/dashboard/profile",
  "/career-tools/matching",
  "/employer/dashboard",
];

export function revalidateJobs(id?: number | string) {
  for (const path of REVALIDATE) revalidatePath(path, "page");
  if (id) revalidatePath(`/jobs/${id}`, "page");
}
