import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("jobseeker"), // jobseeker | employer
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    resetToken: text("reset_token"),
    resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
  ],
);

export type User = typeof users.$inferSelect;

/* ------------------------------------------------------------------ */
/* Job seeker profile (drives rule based matching + accessibility)     */
/* ------------------------------------------------------------------ */

export const seekerProfiles = pgTable(
  "seeker_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    headline: varchar("headline", { length: 160 }).default(""),
    bio: text("bio").default(""),
    phone: varchar("phone", { length: 40 }).default(""),
    division: varchar("division", { length: 60 }).default(""),
    district: varchar("district", { length: 60 }).default(""),
    upazila: varchar("upazila", { length: 60 }).default(""),
    educationLevel: varchar("education_level", { length: 40 }).default(""),
    institution: varchar("institution", { length: 160 }).default(""),
    fieldOfStudy: varchar("field_of_study", { length: 120 }).default(""),
    graduationYear: integer("graduation_year"),
    experienceLevel: varchar("experience_level", { length: 40 }).default("fresher"),
    skills: jsonb("skills").$type<string[]>().default([]).notNull(),
    preferredCategories: jsonb("preferred_categories").$type<string[]>().default([]).notNull(),
    preferredLocations: jsonb("preferred_locations").$type<string[]>().default([]).notNull(),
    preferredEmploymentTypes: jsonb("preferred_employment_types").$type<string[]>().default([]).notNull(),
    workMode: varchar("work_mode", { length: 20 }).default("any"), // any | remote | hybrid | onsite
    salaryExpectation: integer("salary_expectation").default(0),
    availability: varchar("availability", { length: 60 }).default(""),
    accessibilityNeeds: jsonb("accessibility_needs").$type<string[]>().default([]).notNull(),
    needsAccommodation: boolean("needs_accommodation").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("seeker_profiles_user_idx").on(t.userId)],
);

export type SeekerProfile = typeof seekerProfiles.$inferSelect;

/* ------------------------------------------------------------------ */
/* Employers / company profiles                                        */
/* ------------------------------------------------------------------ */

export const companies = pgTable(
  "companies",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 160 }),
    industry: varchar("industry", { length: 120 }).default(""),
    size: varchar("size", { length: 60 }).default(""),
    about: text("about").default(""),
    website: varchar("website", { length: 200 }).default(""),
    contactEmail: varchar("contact_email", { length: 200 }).default(""),
    phone: varchar("phone", { length: 40 }).default(""),
    division: varchar("division", { length: 60 }).default(""),
    district: varchar("district", { length: 60 }).default(""),
    address: varchar("address", { length: 240 }).default(""),
    accessibilityInfo: text("accessibility_info").default(""),
    isDemo: boolean("is_demo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("companies_owner_idx").on(t.ownerId)],
);

export type Company = typeof companies.$inferSelect;

/* ------------------------------------------------------------------ */
/* Job categories                                                      */
/* ------------------------------------------------------------------ */

export const jobCategories = pgTable(
  "job_categories",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").default(""),
    icon: varchar("icon", { length: 40 }).default(""),
    group: varchar("group", { length: 40 }).default("general"), // local | remote | fresher | general
    openDemoRoles: integer("open_demo_roles").default(0),
  },
  (t) => [uniqueIndex("job_categories_slug_idx").on(t.slug)],
);

export type JobCategory = typeof jobCategories.$inferSelect;

/* ------------------------------------------------------------------ */
/* Job listings                                                        */
/* ------------------------------------------------------------------ */

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 32 }).notNull(),
    employerId: integer("employer_id").references(() => users.id, { onDelete: "cascade" }),
    companyId: integer("company_id").references(() => companies.id, { onDelete: "set null" }),
    categoryId: integer("category_id").references(() => jobCategories.id, { onDelete: "set null" }),
    title: varchar("title", { length: 200 }).notNull(),
    summary: text("summary").default(""),
    description: text("description").default(""),
    responsibilities: text("responsibilities").default(""),
    requirements: text("requirements").default(""),
    applicationInstructions: text("application_instructions").default(""),
    benefits: text("benefits").default(""),
    employmentType: varchar("employment_type", { length: 40 }).notNull().default("part-time"),
    workMode: varchar("work_mode", { length: 20 }).notNull().default("onsite"),
    experienceLevel: varchar("experience_level", { length: 40 }).notNull().default("any"),
    educationLevel: varchar("education_level", { length: 40 }).default(""),
    workingHours: varchar("working_hours", { length: 80 }).default(""),
    shift: varchar("shift", { length: 60 }).default(""),
    division: varchar("division", { length: 60 }).default(""),
    district: varchar("district", { length: 60 }).default(""),
    upazila: varchar("upazila", { length: 60 }).default(""),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryPeriod: varchar("salary_period", { length: 20 }).default("month"),
    payRate: varchar("pay_rate", { length: 60 }).default(""),
    requiredSkills: jsonb("required_skills").$type<string[]>().default([]).notNull(),
    preferredSkills: jsonb("preferred_skills").$type<string[]>().default([]).notNull(),
    accessibilityFacilities: jsonb("accessibility_facilities").$type<string[]>().default([]).notNull(),
    interviewAccommodations: text("interview_accommodations").default(""),
    flexibleHours: boolean("flexible_hours").default(false).notNull(),
    deadline: date("deadline", { mode: "string" }),
    status: varchar("status", { length: 20 }).notNull().default("published"), // draft | published | closed
    isDemo: boolean("is_demo").default(true).notNull(),
    postedAt: timestamp("posted_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("jobs_reference_idx").on(t.reference),
    index("jobs_status_idx").on(t.status),
    index("jobs_category_idx").on(t.categoryId),
    index("jobs_district_idx").on(t.district),
    index("jobs_type_idx").on(t.employmentType),
  ],
);

export type Job = typeof jobs.$inferSelect;

/* ------------------------------------------------------------------ */
/* Saved jobs                                                          */
/* ------------------------------------------------------------------ */

export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("saved_jobs_user_job_idx").on(t.userId, t.jobId)],
);

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    jobId: integer("job_id").references(() => jobs.id, { onDelete: "cascade" }),
    employerId: integer("employer_id").references(() => users.id, { onDelete: "set null" }),
    jobTitle: varchar("job_title", { length: 200 }).notNull(),
    companyName: varchar("company_name", { length: 160 }).default(""),
    jobReference: varchar("job_reference", { length: 32 }).default(""),
    contactName: varchar("contact_name", { length: 120 }).notNull(),
    contactEmail: varchar("contact_email", { length: 200 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 40 }).default(""),
    coverNote: text("cover_note").default(""),
    cvTemplate: varchar("cv_template", { length: 60 }).default(""),
    status: varchar("status", { length: 30 }).notNull().default("applied"),
    privateNotes: text("private_notes").default(""),
    employerNotes: text("employer_notes").default(""),
    interviewAt: timestamp("interview_at", { withTimezone: true }),
    interviewMode: varchar("interview_mode", { length: 40 }).default(""),
    appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("applications_user_job_idx").on(t.userId, t.jobId),
    index("applications_job_idx").on(t.jobId),
    index("applications_employer_idx").on(t.employerId),
    index("applications_status_idx").on(t.status),
  ],
);

export type Application = typeof applications.$inferSelect;

/* ------------------------------------------------------------------ */
/* CV documents (classic editor, no AI generation)                     */
/* ------------------------------------------------------------------ */

export const cvDocuments = pgTable(
  "cv_documents",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).default("My CV"),
    template: varchar("template", { length: 60 }).default("classic"),
    content: jsonb("content").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("cv_documents_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Career guidance resources                                           */
/* ------------------------------------------------------------------ */

export type GuidanceSection = { heading: string; body: string; bullets?: string[] };

export const guidanceResources = pgTable(
  "guidance_resources",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    track: varchar("track", { length: 80 }).default("general"),
    level: varchar("level", { length: 40 }).default("beginner"),
    minutes: integer("minutes").default(6),
    summary: text("summary").default(""),
    roleSkills: jsonb("role_skills").$type<string[]>().default([]).notNull(),
    sections: jsonb("sections").$type<GuidanceSection[]>().default([]).notNull(),
    isDemo: boolean("is_demo").default(true).notNull(),
  },
  (t) => [uniqueIndex("guidance_slug_idx").on(t.slug)],
);

export type GuidanceResource = typeof guidanceResources.$inferSelect;
