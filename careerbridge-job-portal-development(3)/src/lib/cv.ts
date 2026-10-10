import type { CvTemplateSlug } from "@/lib/constants";

/**
 * CV data model for the classic (non-AI) editor. Everything is plain text the
 * user typed themselves; it is stored as JSON so a template change never loses content.
 */

export type CvSectionKey =
  | "objective"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "training"
  | "references";

export const SECTION_LABELS: Record<CvSectionKey, string> = {
  objective: "Career objective",
  education: "Education",
  experience: "Work experience",
  skills: "Skills",
  projects: "Projects",
  training: "Training & certificates",
  references: "References",
};

export const DEFAULT_SECTION_ORDER: CvSectionKey[] = [
  "objective",
  "education",
  "experience",
  "skills",
  "projects",
  "training",
  "references",
];

export type Personal = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  linkedin: string;
};

export type EducationItem = {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  result: string;
  details: string;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string;
};

export type SkillItem = { id: string; name: string; level: "" | "Beginner" | "Intermediate" | "Advanced" };
export type ProjectItem = { id: string; name: string; link: string; tech: string; description: string };
export type TrainingItem = { id: string; title: string; institute: string; year: string };
export type ReferenceItem = { id: string; name: string; position: string; organization: string; contact: string };

export type CvContent = {
  personal: Personal;
  objective: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  training: TrainingItem[];
  references: ReferenceItem[];
  layout: {
    template: CvTemplateSlug;
    density: "compact" | "regular" | "relaxed";
    accent: string;
    uppercaseHeadings: boolean;
    sectionOrder: CvSectionKey[];
    hidden: CvSectionKey[];
  };
};

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export const emptyPersonal: Personal = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  linkedin: "",
};

export function emptyCv(): CvContent {
  return {
    personal: { ...emptyPersonal },
    objective: "",
    education: [],
    experience: [],
    skills: [],
    projects: [],
    training: [],
    references: [],
    layout: {
      template: "classic",
      density: "regular",
      accent: "#14202b",
      uppercaseHeadings: true,
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      hidden: [],
    },
  };
}

/** Merge stored JSON with defaults so older documents never break the editor. */
export function normalizeCv(input: unknown): CvContent {
  const base = emptyCv();
  if (!input || typeof input !== "object") return base;
  const raw = input as Partial<CvContent>;
  const order = Array.isArray(raw.layout?.sectionOrder)
    ? DEFAULT_SECTION_ORDER.filter((k) => (raw.layout!.sectionOrder as string[]).includes(k))
    : [...base.layout.sectionOrder];
  for (const key of DEFAULT_SECTION_ORDER) if (!order.includes(key)) order.push(key);
  return {
    personal: { ...base.personal, ...(raw.personal ?? {}) },
    objective: typeof raw.objective === "string" ? raw.objective : "",
    education: Array.isArray(raw.education) ? raw.education : [],
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    training: Array.isArray(raw.training) ? raw.training : [],
    references: Array.isArray(raw.references) ? raw.references : [],
    layout: {
      template: (raw.layout?.template ?? "classic") as CvTemplateSlug,
      density: raw.layout?.density ?? "regular",
      accent: raw.layout?.accent ?? "#14202b",
      uppercaseHeadings: raw.layout?.uppercaseHeadings ?? true,
      sectionOrder: order,
      hidden: Array.isArray(raw.layout?.hidden) ? (raw.layout!.hidden as CvSectionKey[]) : [],
    },
  };
}

export const fresherExample: CvContent = {
  ...emptyCv(),
  personal: {
    fullName: "Sample Name",
    jobTitle: "BBA graduate · Part-time availability",
    email: "sample.name@gmail.com",
    phone: "+880 1XXX-XXXXXX",
    address: "Dhanmondi, Dhaka",
    website: "",
    linkedin: "linkedin.com/in/sample-name",
  },
  objective:
    "Recent BBA graduate from the University of Dhaka looking for a part-time customer support or retail role in the Dhanmondi area. Reliable, comfortable with Excel and Google Sheets, available 20 hours a week including weekends.",
  education: [
    {
      id: uid(),
      degree: "BBA in Management",
      institution: "University of Dhaka",
      location: "Dhaka",
      year: "2022 – 2026",
      result: "CGPA 3.42 / 4.00",
      details: "Coursework: organisational behaviour, financial accounting, business statistics.",
    },
    {
      id: uid(),
      degree: "Higher Secondary Certificate (Business Studies)",
      institution: "Dhaka City College",
      location: "Dhaka",
      year: "2020",
      result: "GPA 5.00",
      details: "",
    },
  ],
  experience: [
    {
      id: uid(),
      role: "Volunteer Coordinator",
      company: "DU Social Welfare Club",
      location: "Dhaka",
      period: "Jan 2025 – Present",
      bullets:
        "Organised 6 campus events with 120+ participants each\nHandled registration desks and answered visitor questions politely\nKept a shared spreadsheet of donations and donor contacts",
    },
  ],
  skills: [
    { id: uid(), name: "Microsoft Excel", level: "Intermediate" },
    { id: uid(), name: "Google Sheets", level: "Advanced" },
    { id: uid(), name: "Customer handling", level: "Intermediate" },
    { id: uid(), name: "Bangla & English writing", level: "Advanced" },
  ],
  projects: [
    {
      id: uid(),
      name: "Small shop sales record (honours thesis)",
      link: "",
      tech: "Excel, SurveyToStar",
      description: "Collected 3 months of sales data from 4 local shops in Mirpur and summarised weekly trends.",
    },
  ],
  training: [
    { id: uid(), title: "Basic Office & Internet Skills", institute: "a2i Digital Centre", year: "2024" },
  ],
  references: [
    {
      id: uid(),
      name: "Faculty name (add yours)",
      position: "Assistant Professor",
      organization: "Department of Management, University of Dhaka",
      contact: "Available on request",
    },
  ],
};

export const experiencedExample: CvContent = {
  ...emptyCv(),
  personal: {
    fullName: "Sample Name",
    jobTitle: "Frontend Developer · 3 years experience",
    email: "sample.dev@gmail.com",
    phone: "+880 1XXX-XXXXXX",
    address: "Rajshahi (open to remote work)",
    website: "github.com/sample-dev",
    linkedin: "linkedin.com/in/sample-dev",
  },
  objective:
    "Frontend developer with 3 years of production React experience. I build accessible, fast interfaces for small teams and I am looking for a remote role where I can own a product area end to end.",
  education: [
    {
      id: uid(),
      degree: "BSc in CSE",
      institution: "University of Rajshahi",
      location: "Rajshahi",
      year: "2018 – 2022",
      result: "CGPA 3.60 / 4.00",
      details: "",
    },
  ],
  experience: [
    {
      id: uid(),
      role: "Frontend Developer",
      company: "Sample Software Ltd.",
      location: "Remote",
      period: "Mar 2023 – Present",
      bullets:
        "Rebuilt the customer dashboard in React + TypeScript, cutting first load from 4.1s to 1.6s\nIntroduced keyboard-accessible component library used by 4 teams\nWrote unit tests covering the checkout flow (78% coverage)",
    },
    {
      id: uid(),
      role: "Junior Web Developer",
      company: "Sample Digital Agency",
      location: "Dhaka",
      period: "Jul 2022 – Feb 2023",
      bullets:
        "Delivered 11 marketing sites with responsive Tailwind layouts\nConverted Figma files into pixel-accurate, semantic HTML",
    },
  ],
  skills: [
    { id: uid(), name: "React & TypeScript", level: "Advanced" },
    { id: uid(), name: "Tailwind CSS", level: "Advanced" },
    { id: uid(), name: "Accessibility (WCAG basics)", level: "Intermediate" },
    { id: uid(), name: "Node.js & Express", level: "Intermediate" },
    { id: uid(), name: "Git & code review", level: "Advanced" },
  ],
  projects: [
    {
      id: uid(),
      name: "Rail schedule viewer",
      link: "github.com/sample-dev/rail-viewer",
      tech: "Next.js, Drizzle, PostgreSQL",
      description: "Open-data Bangladesh rail schedule app with offline caching; 2k monthly users.",
    },
  ],
  training: [
    { id: uid(), title: "Responsive Web Design", institute: "freeCodeCamp", year: "2021" },
    { id: uid(), title: "GDG Dhaka — Web Accessibility workshop", institute: "Google Developer Group", year: "2024" },
  ],
  references: [
    { id: uid(), name: "Available on request", position: "", organization: "", contact: "" },
  ],
};

export const CV_WRITING_TIPS = [
  {
    title: "Keep it to one page as a fresher",
    body: "Recruiters in Bangladesh typically spend under a minute on a first pass. Two pages are only useful once you have several years of work history.",
  },
  {
    title: "Write an objective that names the job",
    body: "Replace “seeking a challenging role” with what you want and when you can work: “Part-time evening shift at a café in Uttara, available from 28 May.”",
  },
  {
    title: "Use numbers wherever you can",
    body: "“Handled 40+ customer calls daily” says far more than “responsible for customer service”.",
  },
  {
    title: "Start bullets with an action verb",
    body: "Organised, Prepared, Repaired, Assisted, Recorded, Tested. Avoid long sentences and full stops inside bullet points.",
  },
  {
    title: "Match the skills list to the vacancy",
    body: "If the job asks for Google Sheets and cash counter handling, both should appear in your skills section with your honest level.",
  },
  {
    title: "Never invent experience",
    body: "List club work, volunteering, class projects and family business help instead. They count — but a claimed job that never existed will end your application.",
  },
  {
    title: "Save and export as PDF",
    body: "Always send a PDF, never a photo of a printed page or an editable DOCX, and name the file clearly.",
  },
];

export const CV_FILE_NAMING = ["Firstname_Lastname_CV.pdf", "Rahima_Khatun_CV_2026.pdf", "Imran_Hossain_Frontend_Dev.pdf"];
