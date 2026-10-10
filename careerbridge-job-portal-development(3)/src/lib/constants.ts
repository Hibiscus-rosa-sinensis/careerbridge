/**
 * Shared design/content tokens for CareerBridge.
 * Everything here is static reference data used by both the server queries
 * and the forms, so labels never drift between pages.
 */

export const DIVISIONS = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
] as const;

export const DISTRICTS: Record<string, string[]> = {
  Barishal: ["Barishal", "Bhola", "Patuakhali", "Pirojpur"],
  Chattogram: ["Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Brahmanbaria"],
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Manikganj"],
  Khulna: ["Khulna", "Jashore", "Kushtia", "Satkhira"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
  Rajshahi: ["Rajshahi", "Bogura", "Pabna", "Sirajganj", "Natore"],
  Rangpur: ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
};

/** Thana / area level data is only offered for the metros we have demo listings for. */
export const UPAZILAS: Record<string, string[]> = {
  Dhaka: ["Dhanmondi", "Mirpur", "Uttara", "Gulshan", "Motijheel", "Mohammadpur", "Bashundhara"],
  Gazipur: ["Tongi", "Kaliakair", "Sreepur"],
  Narayanganj: ["Fatullah", "Siddhirganj", "Rupganj"],
  Chattogram: ["Panchlaish", "Kotwali", "Halishahar", "Pahartali", "Chandgaon"],
  "Cox's Bazar": ["Hotel-Motel Zone", "Chakaria", "Teknaf"],
  Rajshahi: ["Boalia", "Motihar", "Shah Makhdum"],
  Khulna: ["Khalishpur", "Sonadanga", "Daulatpur"],
  Sylhet: ["Zindabazar", "Shahjalal Upashahar", "Amberkhana"],
};

export const EMPLOYMENT_TYPES = [
  { value: "part-time", label: "Part-time" },
  { value: "full-time", label: "Full-time" },
  { value: "temporary", label: "Temporary / Contract" },
  { value: "internship", label: "Internship" },
  { value: "shift", label: "Shift based" },
  { value: "freelance", label: "Freelance / Project" },
] as const;

export const WORK_MODES = [
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher / No experience" },
  { value: "entry", label: "Entry level (under 1 year)" },
  { value: "junior", label: "Junior (1–2 years)" },
  { value: "mid", label: "Mid (3–5 years)" },
  { value: "senior", label: "Senior (5+ years)" },
  { value: "any", label: "Open to all levels" },
] as const;

export const EDUCATION_LEVELS = [
  { value: "ssc", label: "SSC / Equivalent" },
  { value: "hsc", label: "HSC / Equivalent" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor (Honours)" },
  { value: "masters", label: "Master's" },
  { value: "any", label: "Not specified" },
] as const;

export const WORKING_HOURS = [
  { value: "2-3 hrs/day", label: "2–3 hours a day" },
  { value: "4-5 hrs/day", label: "4–5 hours a day" },
  { value: "6 hrs/day", label: "About 6 hours a day" },
  { value: "weekends-only", label: "Weekends only" },
  { value: "evening", label: "Evening shift (after classes)" },
  { value: "morning", label: "Morning shift" },
  { value: "full-day", label: "Full day" },
] as const;

export const SALARY_PERIODS = [
  { value: "month", label: "Per month (BDT)" },
  { value: "day", label: "Per day (BDT)" },
  { value: "hour", label: "Per hour (BDT)" },
  { value: "project", label: "Per project (BDT)" },
] as const;

export const ACCESSIBILITY_FACILITIES = [
  { value: "step-free-access", label: "Step-free access / ramp" },
  { value: "lift-access", label: "Lift access" },
  { value: "accessible-toilet", label: "Accessible toilet" },
  { value: "flexible-hours", label: "Flexible working hours" },
  { value: "remote-work", label: "Fully remote work" },
  { value: "quiet-space", label: "Quiet / low-stimulation space" },
  { value: "assistive-software", label: "Assistive software provided" },
  { value: "written-interview", label: "Written interview option" },
  { value: "extra-time", label: "Extra time for tests" },
  { value: "companion-allowed", label: "Support companion allowed at interview" },
] as const;

export const APPLICATION_STATUSES = [
  { value: "applied", label: "Applied", tone: "neutral" },
  { value: "under-review", label: "Under Review", tone: "info" },
  { value: "interview", label: "Interview", tone: "accent" },
  { value: "offer", label: "Offer", tone: "success" },
  { value: "rejected", label: "Rejected", tone: "danger" },
  { value: "withdrawn", label: "Withdrawn", tone: "muted" },
  { value: "no-response", label: "No Response Yet", tone: "warn" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]["value"];

export const EMPLOYER_STATUSES = [
  "applied",
  "under-review",
  "shortlisted",
  "interview",
  "offer",
  "rejected",
] as const;

export const CATEGORY_ICONS = [
  "Store",
  "Coffee",
  "BookOpen",
  "ShoppingCart",
  "UtensilsCrossed",
  "Laptop",
  "Code2",
  "Palette",
  "Megaphone",
  "Headset",
  "Truck",
  "Building2",
] as const;

export const CV_TEMPLATES = [
  {
    slug: "classic",
    name: "Classic Navy",
    description: "Single column, serif-free, safe for applicant tracking systems.",
    accent: "#14202b",
  },
  {
    slug: "orange-header",
    name: "Bold Header",
    description: "Strong name block with a warm accent bar. Good for design roles.",
    accent: "#ea6a15",
  },
  {
    slug: "two-column",
    name: "Two Column",
    description: "Skills and contact details in a sidebar, experience in the main column.",
    accent: "#1f5f57",
  },
  {
    slug: "minimal",
    name: "Minimal Grey",
    description: "Very quiet layout with wide margins. Best for fresher CVs.",
    accent: "#4b5563",
  },
] as const;

export type CvTemplateSlug = (typeof CV_TEMPLATES)[number]["slug"];

export const JOB_LIST_LABELS: Record<string, string> = {
  "local-part-time": "Local part-time",
  "remote-it": "Remote & IT",
  fresher: "Fresher friendly",
  inclusive: "Inclusive workplace",
};

export function labelFor(
  list: readonly { value: string; label: string }[],
  value: string | null | undefined,
) {
  if (!value) return "";
  return list.find((i) => i.value === value)?.label ?? value;
}

export function titleCase(value: string) {
  return value
    .split(/[-\s]/)
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");
}
