import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { companies, jobCategories, jobs, savedJobs } from "@/db/schema";
import { monthlyEquivalent } from "@/lib/utils";

export type JobFilterParams = {
  q?: string;
  category?: string;
  categories?: string[];
  division?: string;
  district?: string;
  upazila?: string;
  employmentTypes?: string[];
  workModes?: string[];
  experienceLevels?: string[];
  educationLevels?: string[];
  minSalary?: number;
  onlyEntryLevel?: boolean;
  onlyAccessible?: boolean;
  onlyFlexible?: boolean;
  openOnly?: boolean;
  sort?: "recent" | "salary" | "match";
  status?: "published" | "any";
  employerId?: number;
  page?: number;
  perPage?: number;
};

export type JobRowBase = {
  id: number;
  reference: string;
  title: string;
  summary: string | null;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  educationLevel: string | null;
  division: string | null;
  district: string | null;
  upazila: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
  payRate: string | null;
  workingHours: string | null;
  shift: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  accessibilityFacilities: string[];
  flexibleHours: boolean;
  deadline: string | null;
  postedAt: Date | null;
  status: string;
  isDemo: boolean;
  companyId: number | null;
  companyName: string;
  companyIsDemo: boolean;
  categoryId: number | null;
  categorySlug: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
};

export type JobRow = JobRowBase & { employerId: number | null };

export type JobDetail = JobRow & {
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  applicationInstructions: string | null;
  benefits: string | null;
  interviewAccommodations: string | null;
  companyAbout: string | null;
  companyAddress: string | null;
  companyIndustry: string | null;
  companyAccessibility: string | null;
  updatedAt: Date | null;
};

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function decorate(rows: Array<Record<string, unknown>>): JobRow[] {
  return rows.map((row) => {
    const job = row.job as Record<string, unknown>;
    const company = (row.company ?? {}) as Record<string, unknown>;
    const category = (row.category ?? {}) as Record<string, unknown>;
    return {
      id: job.id as number,
      employerId: (job.employerId as number) ?? null,
      reference: job.reference as string,
      title: job.title as string,
      summary: (job.summary as string) ?? null,
      employmentType: job.employmentType as string,
      workMode: job.workMode as string,
      experienceLevel: job.experienceLevel as string,
      educationLevel: (job.educationLevel as string) || null,
      division: (job.division as string) || null,
      district: (job.district as string) || null,
      upazila: (job.upazila as string) || null,
      salaryMin: (job.salaryMin as number) ?? null,
      salaryMax: (job.salaryMax as number) ?? null,
      salaryPeriod: (job.salaryPeriod as string) ?? "month",
      payRate: (job.payRate as string) || null,
      workingHours: (job.workingHours as string) || null,
      shift: (job.shift as string) || null,
      requiredSkills: asStringArray(job.requiredSkills),
      preferredSkills: asStringArray(job.preferredSkills),
      accessibilityFacilities: asStringArray(job.accessibilityFacilities),
      flexibleHours: Boolean(job.flexibleHours),
      deadline: (job.deadline as string) ?? null,
      postedAt: (job.postedAt as Date) ?? null,
      status: job.status as string,
      isDemo: Boolean(job.isDemo),
      companyId: (job.companyId as number) ?? null,
      companyName: (company.name as string) ?? "Unlisted employer",
      companyIsDemo: Boolean(company.isDemo),
      categoryId: (job.categoryId as number) ?? null,
      categorySlug: (category.slug as string) ?? null,
      categoryName: (category.name as string) ?? null,
      categoryIcon: (category.icon as string) ?? null,
    };
  });
}

const selection = {
  job: jobs,
  company: {
    id: companies.id,
    name: companies.name,
    isDemo: companies.isDemo,
    district: companies.district,
    division: companies.division,
  },
  category: {
    id: jobCategories.id,
    slug: jobCategories.slug,
    name: jobCategories.name,
    icon: jobCategories.icon,
  },
};

/**
 * The demo dataset is small (a few dozen listings), so we join once and then
 * apply the filters in one place. That keeps search behaviour identical for
 * job seekers, employers and the matching engine.
 */
export async function loadJobRows(params: { status?: string; employerId?: number } = {}) {
  const rows = await db
    .select(selection)
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(jobCategories, eq(jobs.categoryId, jobCategories.id));
  let decorated = decorate(rows as Array<Record<string, unknown>>);
  if (params.status) decorated = decorated.filter((j) => j.status === params.status);
  if (params.employerId !== undefined)
    decorated = decorated.filter((j) => j.employerId === params.employerId);
  return decorated;
}

function isExpired(deadline: string | null) {
  if (!deadline) return false;
  const t = new Date(`${deadline}T23:59:59`).getTime();
  return !Number.isNaN(t) && t < Date.now();
}

export async function searchJobs(params: JobFilterParams) {
  const pool = await loadJobRows({
    status: params.status === "any" ? undefined : "published",
    employerId: params.employerId,
  });
  const q = (params.q ?? "").trim().toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length > 1);

  let results = pool.filter((job) => {
    if (terms.length) {
      const haystack = [
        job.title,
        job.companyName,
        job.summary ?? "",
        job.district ?? "",
        job.division ?? "",
        job.upazila ?? "",
        job.categoryName ?? "",
        job.requiredSkills.join(" "),
        job.preferredSkills.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const ok = terms.every((t) => haystack.includes(t));
      if (!ok) return false;
    }
    if (params.category && job.categorySlug !== params.category) return false;
    if (params.categories?.length && !params.categories.includes(job.categorySlug ?? "")) return false;
    if (params.division && job.division !== params.division) return false;
    if (params.district && job.district !== params.district) return false;
    if (params.upazila && job.upazila !== params.upazila) return false;
    if (params.employmentTypes?.length && !params.employmentTypes.includes(job.employmentType))
      return false;
    if (params.workModes?.length && !params.workModes.includes(job.workMode)) return false;
    if (
      params.experienceLevels?.length &&
      !params.experienceLevels.includes(job.experienceLevel) &&
      job.experienceLevel !== "any"
    )
      return false;
    if (params.educationLevels?.length && !params.educationLevels.includes(job.educationLevel ?? ""))
      return false;
    if (params.minSalary) {
      const monthly = monthlyEquivalent(job.salaryMin, job.salaryPeriod ?? "month");
      if (monthly === null || monthly < params.minSalary) return false;
    }
    if (params.onlyEntryLevel) {
      if (!["fresher", "entry", "any"].includes(job.experienceLevel)) return false;
      if (["internship", "part-time"].includes(job.employmentType)) {
        // keep
      }
    }
    if (params.onlyAccessible) {
      if (job.accessibilityFacilities.length === 0 && job.workMode !== "remote" && !job.flexibleHours)
        return false;
    }
    if (params.onlyFlexible) {
      if (!job.flexibleHours && !["part-time", "shift", "temporary"].includes(job.employmentType))
        return false;
    }
    if (params.openOnly && isExpired(job.deadline)) return false;
    return true;
  });

  if (params.sort === "salary") {
    results = results.sort(
      (a, b) =>
        (monthlyEquivalent(b.salaryMin, b.salaryPeriod ?? "month") ?? 0) -
        (monthlyEquivalent(a.salaryMin, a.salaryPeriod ?? "month") ?? 0),
    );
  } else if (params.sort !== "match") {
    results = results.sort(
      (a, b) => new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime(),
    );
  }

  const page = Math.max(1, params.page ?? 1);
  const perPage = params.perPage ?? 9;
  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const paged = results.slice((page - 1) * perPage, page * perPage);

  const districts = Array.from(new Set(pool.map((j) => j.district).filter(Boolean))).sort() as string[];
  const salaryBands = [0, 5000, 8000, 12000, 20000, 35000];

  return {
    results: paged,
    all: results,
    total,
    page,
    pages,
    perPage,
    districts,
    salaryBands,
  };
}

export async function getJobDetail(id: number, allowUnpublished = false): Promise<JobDetail | null> {
  const rows = await db
    .select({
      job: jobs,
      company: {
        id: companies.id,
        name: companies.name,
        isDemo: companies.isDemo,
        about: companies.about,
        address: companies.address,
        industry: companies.industry,
        accessibilityInfo: companies.accessibilityInfo,
      },
      category: {
        id: jobCategories.id,
        slug: jobCategories.slug,
        name: jobCategories.name,
        icon: jobCategories.icon,
      },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(jobCategories, eq(jobs.categoryId, jobCategories.id))
    .where(eq(jobs.id, id))
    .limit(1);
  const row = rows[0] as unknown as Record<string, unknown> | undefined;
  if (!row) return null;
  const [base] = decorate([row]);
  if (!allowUnpublished && base.status !== "published") return null;
  const company = (row.company ?? {}) as Record<string, unknown>;
  const job = row.job as Record<string, unknown>;
  return {
    ...base,
    employerId: (job.employerId as number) ?? null,
    description: (job.description as string) ?? null,
    responsibilities: (job.responsibilities as string) ?? null,
    requirements: (job.requirements as string) ?? null,
    applicationInstructions: (job.applicationInstructions as string) ?? null,
    benefits: (job.benefits as string) ?? null,
    interviewAccommodations: (job.interviewAccommodations as string) ?? null,
    companyAbout: (company.about as string) ?? null,
    companyAddress: (company.address as string) ?? null,
    companyIndustry: (company.industry as string) ?? null,
    companyAccessibility: (company.accessibilityInfo as string) ?? null,
    updatedAt: (job.updatedAt as Date) ?? null,
  };
}

export async function getSavedJobIds(userId: number | null) {
  if (!userId) return new Set<number>();
  const rows = await db
    .select({ jobId: savedJobs.jobId })
    .from(savedJobs)
    .where(eq(savedJobs.userId, userId));
  return new Set(rows.map((r) => r.jobId));
}

export async function getSavedJobs(userId: number) {
  const rows = await db
    .select({ jobId: savedJobs.jobId, createdAt: savedJobs.createdAt })
    .from(savedJobs)
    .where(eq(savedJobs.userId, userId))
    .orderBy(desc(savedJobs.createdAt));
  if (!rows.length) return [] as JobRow[];
  const ids = rows.map((r) => r.jobId);
  const raw = await db
    .select(selection)
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(jobCategories, eq(jobs.categoryId, jobCategories.id))
    .where(inArray(jobs.id, ids));
  const decorated = decorate(raw as Array<Record<string, unknown>>);
  const order = new Map(ids.map((id, i) => [id, i]));
  return decorated.sort(
    (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
  );
}

export async function getCategories() {
  const cats = await db.select().from(jobCategories).orderBy(asc(jobCategories.name));
  const pool = await loadJobRows({ status: "published" });
  const counts = new Map<string, number>();
  for (const job of pool) {
    if (!job.categorySlug) continue;
    counts.set(job.categorySlug, (counts.get(job.categorySlug) ?? 0) + 1);
  }
  return cats.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }));
}

export async function getStats() {
  const pool = await loadJobRows({ status: "published" });
  const today = new Date();
  const last7 = new Date(today.getTime() - 7 * 86_400_000);
  return {
    total: pool.length,
    partTime: pool.filter((j) => j.employmentType === "part-time").length,
    remote: pool.filter((j) => j.workMode === "remote").length,
    fresher: pool.filter((j) => ["fresher", "entry", "any"].includes(j.experienceLevel)).length,
    accessible: pool.filter((j) => j.accessibilityFacilities.length > 0).length,
    fresh: pool.filter((j) => j.postedAt && new Date(j.postedAt) >= last7).length,
    districts: new Set(pool.map((j) => j.district).filter(Boolean)).size,
  };
}
