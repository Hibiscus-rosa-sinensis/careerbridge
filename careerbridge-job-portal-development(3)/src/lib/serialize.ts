import type { JobRow } from "@/lib/jobs";

export type JobCardData = {
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
  postedAt: string | null;
  status: string;
  isDemo: boolean;
  companyName: string;
  companyIsDemo: boolean;
  categorySlug: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  employerId: number | null;
};

/** Server components cannot hand Date instances to client components, so we flatten. */
export function toJobCardData(job: JobRow): JobCardData {
  return {
    ...job,
    postedAt: job.postedAt ? new Date(job.postedAt).toISOString() : null,
  };
}
