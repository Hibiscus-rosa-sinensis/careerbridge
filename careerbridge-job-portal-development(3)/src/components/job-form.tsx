"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Loader2, Save, X } from "lucide-react";
import { Button, Checkbox, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import {
  ACCESSIBILITY_FACILITIES,
  DISTRICTS,
  DIVISIONS,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  SALARY_PERIODS,
  UPAZILAS,
  WORK_MODES,
  WORKING_HOURS,
} from "@/lib/constants";


type JobFormValues = {
  title: string;
  category: string;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  applicationInstructions: string;
  benefits: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  educationLevel: string;
  division: string;
  district: string;
  upazila: string;
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: string;
  payRate: string;
  workingHours: string;
  shift: string;
  requiredSkills: string[];
  preferredSkills: string[];
  accessibilityFacilities: string[];
  interviewAccommodations: string;
  flexibleHours: boolean;
  deadline: string;
  status: string;
};

export const blankJob: JobFormValues = {
  title: "",
  category: "",
  summary: "",
  description: "",
  responsibilities: "",
  requirements: "",
  applicationInstructions: "",
  benefits: "",
  employmentType: "part-time",
  workMode: "onsite",
  experienceLevel: "any",
  educationLevel: "",
  division: "",
  district: "",
  upazila: "",
  salaryMin: "",
  salaryMax: "",
  salaryPeriod: "month",
  payRate: "",
  workingHours: "",
  shift: "",
  requiredSkills: [],
  preferredSkills: [],
  accessibilityFacilities: [],
  interviewAccommodations: "",
  flexibleHours: false,
  deadline: "",
  status: "published",
};

function ChipsInput({
  id,
  label,
  hint,
  value,
  onChange,
  suggestions = [],
}: {
  id: string;
  label: string;
  hint?: string;
  value: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <label className="cb-label" htmlFor={id}>
        {label}
      </label>
      {value.length ? (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <li key={v} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 py-1 pl-2.5 pr-1.5 text-[0.78rem] font-semibold text-brand-700">
              {v}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="grid h-4 w-4 place-items-center rounded hover:bg-white">
                <X className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Input
        id={id}
        value={draft}
        placeholder="Type and press Enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const next = draft.trim().replace(/,$/, "");
            if (next && !value.includes(next)) onChange([...value, next]);
            setDraft("");
          }
        }}
      />
      {hint ? <p className="mt-1.5 text-[0.76rem] text-ink-400">{hint}</p> : null}
      {suggestions.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => !value.includes(s) && onChange([...value, s])}
              className="rounded-md border border-line-300 bg-white px-2 py-0.5 text-[0.72rem] font-semibold text-ink-500 hover:border-brand-300 hover:text-brand-600"
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function JobForm({
  categories,
  initial,
  jobId,
  companyName,
}: {
  categories: Array<{ slug: string; name: string }>;
  initial?: Partial<JobFormValues> | null;
  jobId?: number;
  companyName: string | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<JobFormValues>({ ...blankJob, ...(initial ?? {}) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const districts = values.division ? (DISTRICTS[values.division] ?? []) : [];
  const upazilas = values.district ? (UPAZILAS[values.district] ?? []) : [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    setErrors({});

    const local: Record<string, string> = {};
    if (values.title.trim().length < 4) local.title = "Give the vacancy a clear title.";
    if (!values.category) local.category = "Choose a category so the right people find it.";
    if (values.description.trim().length && values.description.trim().length < 40)
      local.description = "Add at least 40 characters, or leave it empty.";
    if (values.salaryMin && values.salaryMax && Number(values.salaryMax) < Number(values.salaryMin))
      local.salaryMax = "Maximum pay must be at least the minimum.";
    if (values.workMode !== "remote" && !values.district && !values.division)
      local.district = "Add a district or division for on-site and hybrid work.";
    setValues((prev) => ({ ...prev, status: "published" }));
    if (Object.keys(local).length) {
      setErrors(local);
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(jobId ? `/api/jobs/${jobId}` : "/api/jobs", {
        method: jobId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, status: values.status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error ?? "Could not save the vacancy.");
        setErrors(data?.fields ?? {});
        return;
      }
      router.push("/employer/dashboard?saved=1");
      router.refresh();
    } catch {
      setFormError("Network error — the vacancy was not saved.");
    } finally {
      setBusy(false);
    }
  }

  function saveDraft() {
    setValues((prev) => ({ ...prev, status: "draft" }));
    setFormError("Draft selected — press Publish vacancy again to save it as a draft.");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError ? <Notice tone="danger">{formError}</Notice> : null}
      {!companyName && !jobId ? (
        <Notice tone="warn" title="Company profile needed">
          Add your company name in the{" "}
          <Link href="/employer/dashboard?tab=company" className="font-semibold underline">
            company profile
          </Link>{" "}
          before publishing — applicants see it on every listing.
        </Notice>
      ) : null}

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[1rem] font-bold text-ink-900">The basics</legend>
        <Field label="Job title" htmlFor="jf-title" required error={errors.title} hint="Front-load the role: “Café Barista (Evening, Part-time)”.">
          <Input id="jf-title" required value={values.title} onChange={(e) => set("title", e.target.value)} aria-invalid={Boolean(errors.title)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="jf-cat" required error={errors.category}>
            <Select id="jf-cat" value={values.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Short summary" htmlFor="jf-sum" hint="One or two lines shown on the job card.">
            <Input id="jf-sum" value={values.summary} onChange={(e) => set("summary", e.target.value)} maxLength={200} />
          </Field>
        </div>
        <Field label="Full description" htmlFor="jf-desc" error={errors.description} hint="One line per paragraph. What the work involves and who it suits.">
          <Textarea id="jf-desc" rows={5} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="What the person will do" htmlFor="jf-resp" hint="One point per line.">
            <Textarea id="jf-resp" rows={4} value={values.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} />
          </Field>
          <Field label="What you are looking for" htmlFor="jf-req" hint="One requirement per line.">
            <Textarea id="jf-req" rows={4} value={values.requirements} onChange={(e) => set("requirements", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="How to apply / what happens next" htmlFor="jf-instr">
            <Textarea id="jf-instr" rows={3} value={values.applicationInstructions} onChange={(e) => set("applicationInstructions", e.target.value)} placeholder="We reply within a week and invite shortlisted candidates for a trial shift." />
          </Field>
          <Field label="Benefits" htmlFor="jf-ben" hint="One benefit per line.">
            <Textarea id="jf-ben" rows={3} value={values.benefits} onChange={(e) => set("benefits", e.target.value)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[1rem] font-bold text-ink-900">Type, pay and location</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Employment type" htmlFor="jf-type" required error={errors.employmentType}>
            <Select id="jf-type" value={values.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Work arrangement" htmlFor="jf-mode" required error={errors.workMode}>
            <Select id="jf-mode" value={values.workMode} onChange={(e) => set("workMode", e.target.value)}>
              {WORK_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Experience level" htmlFor="jf-exp" error={errors.experienceLevel}>
            <Select id="jf-exp" value={values.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Minimum education" htmlFor="jf-edu">
            <Select id="jf-edu" value={values.educationLevel} onChange={(e) => set("educationLevel", e.target.value)}>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Minimum pay (BDT)" htmlFor="jf-min" error={errors.salaryMin}>
            <Input id="jf-min" inputMode="numeric" value={values.salaryMin ?? ""} onChange={(e) => set("salaryMin", e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Maximum pay (BDT)" htmlFor="jf-max" error={errors.salaryMax}>
            <Input id="jf-max" inputMode="numeric" value={values.salaryMax ?? ""} onChange={(e) => set("salaryMax", e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Pay period" htmlFor="jf-period">
            <Select id="jf-period" value={values.salaryPeriod} onChange={(e) => set("salaryPeriod", e.target.value)}>
              {SALARY_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Pay note (optional)" htmlFor="jf-rate" hint="e.g. plus 10% service charge">
            <Input id="jf-rate" value={values.payRate} onChange={(e) => set("payRate", e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Division" htmlFor="jf-division">
            <Select id="jf-division" value={values.division} onChange={(e) => setValues((p) => ({ ...p, division: e.target.value, district: "", upazila: "" }))}>
              <option value="">Not specified</option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="District" htmlFor="jf-district" error={errors.district}>
            <Select
              id="jf-district"
              value={values.district}
              disabled={!districts.length}
              onChange={(e) => setValues((p) => ({ ...p, district: e.target.value, upazila: "" }))}
            >
              <option value="">{districts.length ? "Not specified" : "Pick a division"}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Upazila / thana" htmlFor="jf-upazila">
            <Select id="jf-upazila" value={values.upazila} disabled={!upazilas.length} onChange={(e) => set("upazila", e.target.value)}>
              <option value="">{upazilas.length ? "Not specified" : "Pick a district"}</option>
              {upazilas.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Working hours" htmlFor="jf-hours">
            <Select id="jf-hours" value={values.workingHours} onChange={(e) => set("workingHours", e.target.value)}>
              <option value="">Not specified</option>
              {WORKING_HOURS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
              <option value="custom">Custom…</option>
            </Select>
          </Field>
          <Field label="Shift pattern" htmlFor="jf-shift">
            <Input id="jf-shift" value={values.shift} onChange={(e) => set("shift", e.target.value)} placeholder="e.g. 6 PM – 11 PM" />
          </Field>
          <Field label="Application deadline" htmlFor="jf-deadline" error={errors.deadline} hint="Leave empty for rolling applications.">
            <Input id="jf-deadline" type="date" value={values.deadline ?? ""} onChange={(e) => set("deadline", e.target.value)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[1rem] font-bold text-ink-900">Skills</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChipsInput
            id="jf-required"
            label="Required skills"
            hint="Only what you truly need. Applicants are never auto-rejected for missing one."
            value={values.requiredSkills}
            onChange={(v) => set("requiredSkills", v)}
            suggestions={["Customer service", "Cash handling", "Google Sheets", "Typing (English)", "Communication", "Time management"]}
          />
          <ChipsInput
            id="jf-preferred"
            label="Preferred skills (nice to have)"
            value={values.preferredSkills}
            onChange={(v) => set("preferredSkills", v)}
            suggestions={["POS machine", "Canva", "Basic networking", "Prior internship"]}
          />
        </div>
      </fieldset>

      <fieldset className="cb-panel space-y-3.5 p-5">
        <legend className="px-1 font-display text-[1rem] font-bold text-ink-900">Accessibility &amp; accommodations</legend>
        <p className="text-[0.83rem] leading-relaxed text-ink-500">
          Tick only what your workplace actually provides. CareerBridge never adds facilities automatically, and you
          are not asked for anything about a candidate's disability.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ACCESSIBILITY_FACILITIES.map((f) => (
            <Checkbox
              key={f.value}
              id={`acc-${f.value}`}
              label={f.label}
              checked={values.accessibilityFacilities.includes(f.value)}
              onChange={(e) =>
                set(
                  "accessibilityFacilities",
                  e.target.checked
                    ? [...values.accessibilityFacilities, f.value]
                    : values.accessibilityFacilities.filter((x) => x !== f.value),
                )
              }
            />
          ))}
        </div>
        <Field label="Interview accommodations (optional)" htmlFor="jf-acc" hint="e.g. written interview, extra time, a support companion may attend.">
          <Textarea
            id="jf-acc"
            rows={3}
            value={values.interviewAccommodations}
            onChange={(e) => set("interviewAccommodations", e.target.value)}
          />
        </Field>
        <Checkbox
          id="jf-flex"
          label="Start and finish times can be adjusted around classes or care duties."
          checked={values.flexibleHours}
          onChange={(e) => set("flexibleHours", e.target.checked)}
        />
      </fieldset>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line-200 bg-white/95 p-3.5 shadow-[var(--shadow-soft)] backdrop-blur">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {jobId ? "Save changes" : "Publish vacancy"}
        </Button>
        <Button type="button" variant="outline" onClick={saveDraft} disabled={busy}>
          Save as draft
        </Button>
        <Link href="/employer/dashboard" className="ml-auto text-[0.84rem] font-semibold text-ink-500 hover:text-ink-900">
          Cancel and go back
        </Link>
      </div>

      <p className="flex items-start gap-2 px-1 text-[0.78rem] leading-relaxed text-ink-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Everything you publish here is stored as demonstration data in this project's database and is labelled as such
        on the public listing. Do not post a vacancy that promises a real job offer unless this platform is connected
        to your real organisation.
      </p>
    </form>
  );
}

export function jobToFormValues(job: Record<string, unknown>): Partial<JobFormValues> {
  return {
    title: String(job.title ?? ""),
    summary: String(job.summary ?? ""),
    description: String(job.description ?? ""),
    responsibilities: String(job.responsibilities ?? ""),
    requirements: String(job.requirements ?? ""),
    applicationInstructions: String(job.applicationInstructions ?? ""),
    benefits: String(job.benefits ?? ""),
    employmentType: String(job.employmentType ?? "part-time"),
    workMode: String(job.workMode ?? "onsite"),
    experienceLevel: String(job.experienceLevel ?? "any"),
    educationLevel: String(job.educationLevel ?? ""),
    division: String(job.division ?? ""),
    district: String(job.district ?? ""),
    upazila: String(job.upazila ?? ""),
    salaryMin: job.salaryMin == null ? "" : String(job.salaryMin),
    salaryMax: job.salaryMax == null ? "" : String(job.salaryMax),
    salaryPeriod: String(job.salaryPeriod ?? "month"),
    payRate: String(job.payRate ?? ""),
    workingHours: String(job.workingHours ?? ""),
    shift: String(job.shift ?? ""),
    requiredSkills: (job.requiredSkills as string[]) ?? [],
    preferredSkills: (job.preferredSkills as string[]) ?? [],
    accessibilityFacilities: (job.accessibilityFacilities as string[]) ?? [],
    interviewAccommodations: String(job.interviewAccommodations ?? ""),
    flexibleHours: Boolean(job.flexibleHours),
    deadline: job.deadline ? String(job.deadline).slice(0, 10) : "",
    status: String(job.status ?? "published"),
  };
}
