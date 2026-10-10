import type { JobRow } from "@/lib/jobs";

/**
 * Smart Job Matching — a transparent, rule based scorer.
 * No machine learning and no AI: every point awarded below comes from an
 * explicit weight that is also rendered to the user.
 */

export type SeekerProfileInput = {
  skills: string[];
  educationLevel: string;
  experienceLevel: string;
  preferredCategories: string[];
  preferredLocations: string[];
  preferredEmploymentTypes: string[];
  workMode: string;
  salaryExpectation: number;
};

export const WEIGHTS = {
  skills: 30,
  education: 10,
  experience: 15,
  category: 15,
  location: 15,
  workMode: 5,
  employmentType: 5,
  salary: 5,
} as const;

const EDU_RANK: Record<string, number> = { "": 0, any: 0, ssc: 1, hsc: 2, diploma: 3, bachelor: 4, masters: 5 };
const EXP_ORDER = ["fresher", "entry", "junior", "mid", "senior"];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#. ]/g, "").trim();
const normSet = (list: string[]) => new Set(list.map(norm).filter(Boolean));

export type MatchResult = {
  job: JobRow;
  score: number;
  matchedSkills: string[];
  missingRequired: string[];
  missingPreferred: string[];
  reasons: string[];
  gaps: string[];
};

function skillScore(required: string[], preferred: string[], userSkills: Set<string>) {
  if (required.length === 0 && preferred.length === 0) {
    return { ratio: 0.6, matched: [], missingRequired: [], missingPreferred: [] };
  }
  const matched = required.filter((s) => userSkills.has(norm(s)));
  const missingRequired = required.filter((s) => !userSkills.has(norm(s)));
  const missingPreferred = preferred.filter((s) => !userSkills.has(norm(s)));
  const requiredRatio = required.length ? matched.length / required.length : 1;
  const preferredRatio = preferred.length
    ? 1 - missingPreferred.length / preferred.length
    : requiredRatio;
  // Missing a preferred skill never disqualifies — it only trims the score slightly.
  const ratio = required.length ? requiredRatio * 0.8 + preferredRatio * 0.2 : preferredRatio;
  return { ratio, matched, missingRequired, missingPreferred };
}

export function scoreJob(profile: SeekerProfileInput, job: JobRow): MatchResult {
  const userSkills = normSet(profile.skills ?? []);
  const reasons: string[] = [];
  const gaps: string[] = [];

  const skills = skillScore(job.requiredSkills ?? [], job.preferredSkills ?? [], userSkills);
  if (!profile.skills?.length) {
    gaps.push("Add your skills to your profile so matching can compare them.");
  } else if (skills.matched.length) {
    reasons.push(`You already have ${skills.matched.join(", ")}.`);
  }
  if (skills.missingRequired.length) {
    gaps.push(`Worth learning: ${skills.missingRequired.join(", ")}.`);
  }
  if (skills.missingPreferred.length) {
    gaps.push(`Nice to have (not required): ${skills.missingPreferred.join(", ")}.`);
  }

  // Education
  const need = EDU_RANK[job.educationLevel ?? ""] ?? 0;
  const have = EDU_RANK[profile.educationLevel ?? ""] ?? 0;
  let educationRatio = 1;
  if (!need) {
    educationRatio = 0.8;
    reasons.push("No specific degree required for this role.");
  } else if (have >= need) {
    reasons.push("Your education level meets the requirement.");
  } else {
    educationRatio = 0.4;
    gaps.push("The employer asked for a higher education level than your profile lists.");
  }

  // Experience
  let expRatio = 1;
  const jobExp = job.experienceLevel ?? "any";
  const userExp = profile.experienceLevel || "fresher";
  const jobRank = jobExp === "any" ? -1 : EXP_ORDER.indexOf(jobExp);
  const userRank = EXP_ORDER.indexOf(userExp);
  if (jobRank === -1) {
    reasons.push("Open to all experience levels.");
  } else if (userRank >= jobRank) {
    reasons.push(`Your ${userExp}-level experience fits the ${jobExp} requirement.`);
  } else if (userExp === "fresher" && (jobExp === "fresher" || jobExp === "entry")) {
    reasons.push("Beginner friendly — built for people starting out.");
    expRatio = 0.9;
  } else {
    expRatio = 0.35;
    gaps.push(`Employer prefers ${jobExp} experience; your profile lists ${userExp}.`);
  }

  // Category
  let categoryRatio = 0.35;
  if (job.categorySlug && profile.preferredCategories?.includes(job.categorySlug)) {
    categoryRatio = 1;
    reasons.push(`Matches your interest in ${job.categoryName ?? "this field"}.`);
  } else if (!profile.preferredCategories?.length) {
    categoryRatio = 0.6;
  }

  // Location
  let locationRatio = 0.6;
  const places = profile.preferredLocations ?? [];
  if (!places.length) {
    locationRatio = job.workMode === "remote" ? 0.9 : 0.6;
  } else if (places.includes(job.district ?? "") || places.includes(job.division ?? "")) {
    locationRatio = 1;
    reasons.push(`Located in ${job.district ?? job.division}, one of your preferred areas.`);
  } else if (job.workMode === "remote") {
    locationRatio = 0.85;
    reasons.push("Remote role, so your location preference does not limit it.");
  } else {
    locationRatio = 0.2;
    gaps.push(`Based in ${job.district ?? job.division ?? "another area"}, outside your preferred locations.`);
  }

  // Work mode
  let workRatio = 1;
  if (!profile.workMode || profile.workMode === "any") {
    workRatio = 0.9;
  } else if (profile.workMode === job.workMode) {
    workRatio = 1;
    reasons.push(`${job.workMode} arrangement matches your preference.`);
  } else if (profile.workMode === "remote" && job.workMode === "hybrid") {
    workRatio = 0.5;
    gaps.push("Hybrid — some days are on-site.");
  } else {
    workRatio = 0.15;
    gaps.push(`Work arrangement is ${job.workMode}, you prefer ${profile.workMode}.`);
  }

  // Employment type
  let typeRatio = 1;
  if (!profile.preferredEmploymentTypes?.length) {
    typeRatio = 0.8;
  } else if (profile.preferredEmploymentTypes.includes(job.employmentType)) {
    typeRatio = 1;
    reasons.push(`${job.employmentType} work, as you selected.`);
  } else {
    typeRatio = 0.2;
  }

  // Salary
  let salaryRatio = 0.6;
  const expectation = Number(profile.salaryExpectation ?? 0);
  const monthly = job.salaryMin
    ? job.salaryPeriod === "day"
      ? job.salaryMin * 26
      : job.salaryPeriod === "hour"
        ? job.salaryMin * 176
        : job.salaryMin
    : null;
  if (!expectation) {
    salaryRatio = 0.6;
  } else if (monthly === null) {
    salaryRatio = 0.4;
    gaps.push("Salary is not published for this role.");
  } else if (monthly >= expectation) {
    salaryRatio = 1;
    reasons.push("Published pay meets your stated expectation.");
  } else {
    salaryRatio = 0.3;
    gaps.push(`Published pay is below your expectation of Tk ${expectation.toLocaleString("en-BD")}/month.`);
  }

  const score = Math.round(
    WEIGHTS.skills * skills.ratio +
      WEIGHTS.education * educationRatio +
      WEIGHTS.experience * expRatio +
      WEIGHTS.category * categoryRatio +
      WEIGHTS.location * locationRatio +
      WEIGHTS.workMode * workRatio +
      WEIGHTS.employmentType * typeRatio +
      WEIGHTS.salary * salaryRatio,
  );

  return {
    job,
    score: Math.max(0, Math.min(100, score)),
    matchedSkills: skills.matched,
    missingRequired: skills.missingRequired,
    missingPreferred: skills.missingPreferred,
    reasons,
    gaps,
  };
}

export function rankJobs(profile: SeekerProfileInput, pool: JobRow[], limit = 50) {
  return pool
    .map((job) => scoreJob(profile, job))
    .sort((a, b) => b.score - a.score || a.job.id - b.job.id)
    .slice(0, limit);
}

export const MATCH_EXPLANATION = [
  { label: "Skills overlap", weight: WEIGHTS.skills, note: "How many required and preferred skills your profile already lists." },
  { label: "Education", weight: WEIGHTS.education, note: "Your study level compared with the employer's stated minimum." },
  { label: "Experience", weight: WEIGHTS.experience, note: "Your experience level against the level the employer prefers." },
  { label: "Job category", weight: WEIGHTS.category, note: "Whether the category is one you selected as interesting." },
  { label: "Location", weight: WEIGHTS.location, note: "Preferred districts or divisions, with remote roles treated flexibly." },
  { label: "Work arrangement", weight: WEIGHTS.workMode, note: "Remote, hybrid or on-site preference." },
  { label: "Employment type", weight: WEIGHTS.employmentType, note: "Part-time, full-time, internship and so on." },
  { label: "Pay", weight: WEIGHTS.salary, note: "Published salary compared with your expectation, when both exist." },
];
