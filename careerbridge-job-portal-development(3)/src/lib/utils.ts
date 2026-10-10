export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/** BDT amounts are stored as integers. Part-time roles may use daily or hourly pay. */
export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  period = "month",
) {
  if (!min && !max) return "Salary not mentioned";
  const unit = period === "month" ? "Tk" : "Tk";
  const perLabel =
    period === "month" ? "/month" : period === "day" ? "/day" : period === "hour" ? "/hour" : "/project";
  const fmt = (n: number) => new Intl.NumberFormat("en-BD").format(n);
  if (min && max && min !== max) return `${unit} ${fmt(min)} – ${fmt(max)} ${perLabel}`;
  return `${unit} ${fmt((min ?? max) as number)} ${perLabel}`;
}

export function monthlyEquivalent(
  min: number | null | undefined,
  period = "month",
): number | null {
  if (!min) return null;
  if (period === "day") return min * 26;
  if (period === "hour") return min * 176;
  if (period === "project") return min;
  return min;
}

export function formatDate(value: string | Date | null | undefined, withTime = false) {
  if (!value) return "—";
  const d = typeof value === "string" && value.length <= 12 ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function timeAgo(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year(s) ago`;
}

export function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  const target = new Date(`${value}T23:59:59`).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86_400_000);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function locationLine(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).filter((p, i, arr) => arr.indexOf(p) === i).join(", ");
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
