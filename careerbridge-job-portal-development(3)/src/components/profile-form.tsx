"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Button, Checkbox, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import {
  ACCESSIBILITY_FACILITIES,
  DISTRICTS,
  DIVISIONS,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  UPAZILAS,
  WORK_MODES,
} from "@/lib/constants";
import type { SeekerProfile } from "@/db/schema";

export function ProfileForm({
  userId,
  profile,
  userName,
  userEmail,
  categories,
  focusAccessibility = false,
}: {
  userId: number;
  profile: SeekerProfile | null;
  userName: string;
  userEmail: string;
  categories: Array<{ slug: string; name: string }>;
  focusAccessibility?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    phone: profile?.phone ?? "",
    division: profile?.division ?? "",
    district: profile?.district ?? "",
    upazila: profile?.upazila ?? "",
    educationLevel: profile?.educationLevel ?? "",
    institution: profile?.institution ?? "",
    fieldOfStudy: profile?.fieldOfStudy ?? "",
    graduationYear: profile?.graduationYear ? String(profile.graduationYear) : "",
    experienceLevel: profile?.experienceLevel ?? "fresher",
    availability: profile?.availability ?? "",
    workMode: profile?.workMode ?? "any",
    salaryExpectation: profile?.salaryExpectation ? String(profile.salaryExpectation) : "",
    needsAccommodation: Boolean(profile?.needsAccommodation),
  });
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [categoriesSel, setCategoriesSel] = useState<string[]>(profile?.preferredCategories ?? []);
  const [locations, setLocations] = useState<string[]>(profile?.preferredLocations ?? []);
  const [types, setTypes] = useState<string[]>(profile?.preferredEmploymentTypes ?? []);
  const [access, setAccess] = useState<string[]>(profile?.accessibilityNeeds ?? []);
  const [status, setStatus] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof values>(k: K, v: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }
  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          graduationYear: values.graduationYear ? Number(values.graduationYear) : null,
          salaryExpectation: values.salaryExpectation ? Number(values.salaryExpectation) : 0,
          skills,
          preferredCategories: categoriesSel,
          preferredLocations: locations,
          preferredEmploymentTypes: types,
          accessibilityNeeds: access,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ tone: "danger", text: data?.error ?? "Could not save your profile." });
        return;
      }
      setStatus({ tone: "success", text: data.message ?? "Profile saved." });
      router.refresh();
    } catch {
      setStatus({ tone: "danger", text: "Network error — your profile was not saved." });
    } finally {
      setBusy(false);
    }
  }

  const districts = values.division ? (DISTRICTS[values.division] ?? []) : [];
  const upazilas = values.district ? (UPAZILAS[values.district] ?? []) : [];

  const skillSuggestions = [
    "Customer service",
    "Cash handling",
    "Google Sheets",
    "Microsoft Excel",
    "Inventory counting",
    "Communication",
    "Typing (English)",
    "Typing (Bangla)",
    "HTML & CSS",
    "React",
    "Figma",
    "Social media",
  ].filter((s) => !skills.includes(s));

  return (
    <div className="space-y-5">
      {status ? (
        <Notice tone={status.tone === "success" ? "success" : "danger"}>
          {status.text}
        </Notice>
      ) : null}

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[0.98rem] font-bold text-ink-900">Basic information</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name (account)" htmlFor="pf-name" hint="Change this in account settings.">
            <Input id="pf-name" value={userName} readOnly className="bg-canvas text-ink-500" />
          </Field>
          <Field label="Email (account)" htmlFor="pf-email">
            <Input id="pf-email" value={userEmail} readOnly className="bg-canvas text-ink-500" />
          </Field>
          <Field label="Headline" htmlFor="pf-headline" hint="One line: what you are and what you want to work as.">
            <Input
              id="pf-headline"
              value={values.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="BBA graduate · part-time evening availability"
            />
          </Field>
          <Field label="Phone" htmlFor="pf-phone" hint="Shared with an employer only when you apply.">
            <Input id="pf-phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+880 1711 234567" />
          </Field>
        </div>
        <Field label="Short about you" htmlFor="pf-bio" hint="Three sentences is plenty. Do not paste your whole CV here.">
          <Textarea id="pf-bio" rows={4} value={values.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
      </fieldset>

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[0.98rem] font-bold text-ink-900">Where you can work</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Division" htmlFor="pf-division">
            <Select
              id="pf-division"
              value={values.division}
              onChange={(e) => setValues((p) => ({ ...p, division: e.target.value, district: "", upazila: "" }))}
            >
              <option value="">Not set</option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="District" htmlFor="pf-district">
            <Select
              id="pf-district"
              value={values.district}
              disabled={!districts.length}
              onChange={(e) => setValues((p) => ({ ...p, district: e.target.value, upazila: "" }))}
            >
              <option value="">{districts.length ? "Not set" : "Pick a division"}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Upazila / thana" htmlFor="pf-upazila">
            <Select
              id="pf-upazila"
              value={values.upazila}
              disabled={!upazilas.length}
              onChange={(e) => set("upazila", e.target.value)}
            >
              <option value="">{upazilas.length ? "Not set" : "Pick a district"}</option>
              {upazilas.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div>
          <span className="cb-label">Locations I am willing to work in (used for matching)</span>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([...DIVISIONS, ...(districts.length ? districts : [])])).map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => toggle(locations, setLocations, place)}
                aria-pressed={locations.includes(place)}
                className={`rounded-lg border px-2.5 py-1.5 text-[0.78rem] font-semibold transition-colors ${
                  locations.includes(place)
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-line-300 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                {place}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[0.76rem] text-ink-400">
            Nothing selected? Matching treats every location as acceptable instead of guessing.
          </p>
        </div>
        <Field label="Availability" htmlFor="pf-availability" hint="e.g. Evenings after 4 PM, full weekends, available from 12 June.">
          <Input id="pf-availability" value={values.availability} onChange={(e) => set("availability", e.target.value)} />
        </Field>
      </fieldset>

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[0.98rem] font-bold text-ink-900">Education &amp; experience</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Highest education level" htmlFor="pf-edu">
            <Select id="pf-edu" value={values.educationLevel} onChange={(e) => set("educationLevel", e.target.value)}>
              <option value="">Not set</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Institution" htmlFor="pf-inst">
            <Input id="pf-inst" value={values.institution} onChange={(e) => set("institution", e.target.value)} />
          </Field>
          <Field label="Field of study" htmlFor="pf-field">
            <Input id="pf-field" value={values.fieldOfStudy} onChange={(e) => set("fieldOfStudy", e.target.value)} />
          </Field>
          <Field label="Graduation year" htmlFor="pf-year" hint="Use the expected year if you are still studying.">
            <Input
              id="pf-year"
              inputMode="numeric"
              value={values.graduationYear}
              onChange={(e) => set("graduationYear", e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </Field>
        </div>
        <Field label="Experience level" htmlFor="pf-exp">
          <Select id="pf-exp" value={values.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
            {EXPERIENCE_LEVELS.filter((l) => l.value !== "any").map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </Select>
        </Field>
      </fieldset>

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[0.98rem] font-bold text-ink-900">Skills</legend>
        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-[0.84rem] text-ink-400">No skills added yet. Add at least three — they matter most for matching.</p>
          ) : null}
          {skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 py-1 pl-2.5 pr-1.5 text-[0.8rem] font-semibold text-brand-700">
              {s}
              <button
                type="button"
                onClick={() => setSkills(skills.filter((x) => x !== s))}
                aria-label={`Remove ${s}`}
                className="grid h-5 w-5 place-items-center rounded hover:bg-white"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const v = skillDraft.trim().replace(/,$/, "");
                if (v && !skills.includes(v)) setSkills([...skills, v]);
                setSkillDraft("");
              }
            }}
            placeholder="Type a skill and press Enter"
            className="max-w-xs"
            aria-label="Add a skill"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const v = skillDraft.trim();
              if (v && !skills.includes(v)) setSkills([...skills, v]);
              setSkillDraft("");
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
        {skillSuggestions.length ? (
          <div>
            <p className="cb-label">Quick add</p>
            <div className="flex flex-wrap gap-1.5">
              {skillSuggestions.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkills([...skills, s])}
                  className="rounded-lg border border-line-300 bg-white px-2.5 py-1 text-[0.76rem] font-semibold text-ink-600 hover:border-brand-300 hover:text-brand-600"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="cb-panel space-y-4 p-5">
        <legend className="px-1 font-display text-[0.98rem] font-bold text-ink-900">What you are looking for</legend>
        <div>
          <span className="cb-label">Preferred job categories</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(categoriesSel, setCategoriesSel, c.slug)}
                aria-pressed={categoriesSel.includes(c.slug)}
                className={`rounded-lg border px-2.5 py-1.5 text-[0.78rem] font-semibold transition-colors ${
                  categoriesSel.includes(c.slug)
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-line-300 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <span className="cb-label">Employment type</span>
            <div className="space-y-1.5">
              {EMPLOYMENT_TYPES.map((t) => (
                <Checkbox
                  key={t.value}
                  id={`type-${t.value}`}
                  label={t.label}
                  checked={types.includes(t.value)}
                  onChange={(e) => toggle(types, setTypes, t.value)}
                />
              ))}
            </div>
          </div>
          <Field label="Work arrangement" htmlFor="pf-mode">
            <Select id="pf-mode" value={values.workMode} onChange={(e) => set("workMode", e.target.value)}>
              <option value="any">No preference</option>
              {WORK_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Expected monthly pay (BDT)" htmlFor="pf-salary" hint="Optional. Leave blank if you would rather discuss pay at interview.">
            <Input
              id="pf-salary"
              inputMode="numeric"
              value={values.salaryExpectation}
              onChange={(e) => set("salaryExpectation", e.target.value.replace(/\D/g, "").slice(0, 7))}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset id="accessibility" className="cb-panel space-y-4 p-5" data-autofocus={focusAccessibility ? "true" : undefined}>
        <legend className="px-1 font-display text-[0.98rem] font-bold text-ink-900">Accessibility preferences (optional)</legend>
        <Notice tone="info">
          These answers are used only to filter and highlight listings for you. They are never used to judge your
          ability, and CareerBridge does not ask for medical information, diagnosis or disability documentation.
        </Notice>
        <Checkbox
          id="pf-needs"
          label="Show me jobs with accessibility information and flexible arrangements first."
          checked={values.needsAccommodation}
          onChange={(e) => set("needsAccommodation", e.target.checked)}
        />
        <div>
          <span className="cb-label">What would help you at work?</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {ACCESSIBILITY_FACILITIES.map((f) => (
              <Checkbox
                key={f.value}
                id={`acc-${f.value}`}
                label={f.label}
                checked={access.includes(f.value)}
                onChange={(e) => toggle(access, setAccess, f.value)}
              />
            ))}
          </div>
        </div>
      </fieldset>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line-200 bg-white/95 p-3 shadow-[var(--shadow-soft)] backdrop-blur">
        <Button type="button" onClick={save} disabled={busy} size="md">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {busy ? "Saving…" : "Save profile"}
        </Button>
        <p className="text-[0.8rem] text-ink-400">
          Saved to your account.{" "}
          <button type="button" onClick={save} className="font-semibold text-brand-600 hover:underline">
            Refresh my recommendations
          </button>{" "}
          uses the same save action.
        </p>
      </div>
    </div>
  );
}
