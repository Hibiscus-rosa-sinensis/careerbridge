"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Printer,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { CvPreview } from "@/components/cv-preview";
import { Badge, Button, Checkbox, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { CV_TEMPLATES } from "@/lib/constants";
import {
  CV_WRITING_TIPS,
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  emptyCv,
  uid,
  type CvContent,
  type CvSectionKey,
  normalizeCv,
} from "@/lib/cv";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "careerbridge:cv-draft";

type AnyItem = { id: string } & Record<string, string>;

type FieldDef = { key: string; label: string; type?: "text" | "textarea" | "level"; placeholder?: string; half?: boolean };

const SECTION_META: Record<Exclude<CvSectionKey, "objective">, { fields: FieldDef[]; blank: Record<string, string>; single?: boolean }> = {
  education: {
    fields: [
      { key: "degree", label: "Degree or qualification", placeholder: "BBA in Management", half: true },
      { key: "institution", label: "Institution", placeholder: "Dhaka College", half: true },
      { key: "location", label: "Location", placeholder: "Dhaka", half: true },
      { key: "year", label: "Year or period", placeholder: "2022 – 2026", half: true },
      { key: "result", label: "Result", placeholder: "CGPA 3.31 / 4.00", half: true },
      { key: "details", label: "Extra detail (optional)", type: "textarea", placeholder: "Relevant coursework, thesis topic…" },
    ],
    blank: { degree: "", institution: "", location: "", year: "", result: "", details: "" },
  },
  experience: {
    fields: [
      { key: "role", label: "Role", placeholder: "Counter assistant", half: true },
      { key: "company", label: "Employer / organisation", placeholder: "Mirpur Fresh Mart", half: true },
      { key: "location", label: "Location", placeholder: "Mirpur, Dhaka", half: true },
      { key: "period", label: "Period", placeholder: "Nov 2024 – Present", half: true },
      {
        key: "bullets",
        label: "What you did (one line per point)",
        type: "textarea",
        placeholder: "Handled the cash counter for 40+ customers daily\nCounted weekly stock and reported shortages",
      },
    ],
    blank: { role: "", company: "", location: "", period: "", bullets: "" },
  },
  skills: {
    fields: [
      { key: "name", label: "Skill", placeholder: "Google Sheets", half: true },
      { key: "level", label: "Level", type: "level", half: true },
    ],
    blank: { name: "", level: "" },
  },
  projects: {
    fields: [
      { key: "name", label: "Project name", placeholder: "Shop sales record (course project)", half: true },
      { key: "tech", label: "Tools used", placeholder: "Excel, Google Forms", half: true },
      { key: "link", label: "Link (optional)", placeholder: "github.com/you/project", half: true },
      { key: "description", label: "What it does and what you built", type: "textarea" },
    ],
    blank: { name: "", tech: "", link: "", description: "" },
  },
  training: {
    fields: [
      { key: "title", label: "Course or certificate", placeholder: "Basic Office & Internet Skills", half: true },
      { key: "institute", label: "Institute", placeholder: "a2i Digital Centre", half: true },
      { key: "year", label: "Year", placeholder: "2024", half: true },
    ],
    blank: { title: "", institute: "", year: "" },
  },
  references: {
    fields: [
      { key: "name", label: "Name", placeholder: "Available on request", half: true },
      { key: "position", label: "Position", placeholder: "Assistant Professor", half: true },
      { key: "organization", label: "Organisation", half: true },
      { key: "contact", label: "Contact", placeholder: "Only share with permission", half: true },
    ],
    blank: { name: "", position: "", organization: "", contact: "" },
  },
};

const PERSONAL_FIELDS: FieldDef[] = [
  { key: "fullName", label: "Full name", placeholder: "Rifat Chowdhury", half: true },
  { key: "jobTitle", label: "Line under your name", placeholder: "BBA student · part-time availability", half: true },
  { key: "email", label: "Email", placeholder: "you@example.com", half: true },
  { key: "phone", label: "Phone", placeholder: "+880 1711 234567", half: true },
  { key: "address", label: "Address", placeholder: "Section 10, Mirpur, Dhaka", half: true },
  { key: "website", label: "Website / GitHub (optional)", half: true },
  { key: "linkedin", label: "LinkedIn (optional)", half: true },
];

export function CvEditor({
  signedIn,
  savedDocument,
}: {
  signedIn: boolean;
  savedDocument: { title?: string | null; template?: string | null; content: unknown } | null;
}) {
  const [cv, setCv] = useState<CvContent>(() => normalizeCv(savedDocument?.content ?? null));
  const [title, setTitle] = useState(savedDocument?.title ?? "My CV");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<CvSectionKey | "personal">("personal");
  const fileRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(Boolean(savedDocument));

  // Load a local draft when there is no account copy (or the account copy is empty).
  useEffect(() => {
    if (loaded.current) return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setCv(normalizeCv(JSON.parse(raw)));
        setMessage("Loaded the draft saved in this browser.");
      }
    } catch {
      /* ignore malformed drafts */
    }
    loaded.current = true;
  }, []);

  // Keep a browser draft so nothing is lost on refresh.
  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(cv));
    } catch {
      /* storage full or blocked */
    }
  }, [cv]);

  const update = useCallback((patch: Partial<CvContent> | ((prev: CvContent) => CvContent)) => {
    setDirty(true);
    setCv((prev) => (typeof patch === "function" ? patch(prev) : { ...prev, ...patch }));
  }, []);

  const patchPersonal = (key: string, value: string) =>
    update((prev) => ({ ...prev, personal: { ...prev.personal, [key]: value } as CvContent["personal"] }));

  const itemsOf = (key: Exclude<CvSectionKey, "objective">): AnyItem[] =>
    (cv[key] as unknown as AnyItem[]) ?? [];

  const setItems = (key: Exclude<CvSectionKey, "objective">, items: AnyItem[]) =>
    update((prev) => ({ ...prev, [key]: items }) as CvContent);

  const addItem = (key: Exclude<CvSectionKey, "objective">) => {
    const blank = { id: uid(), ...SECTION_META[key].blank };
    setItems(key, [...itemsOf(key), blank]);
  };

  const patchItem = (key: Exclude<CvSectionKey, "objective">, id: string, field: string, value: string) =>
    setItems(
      key,
      itemsOf(key).map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    );

  const removeItem = (key: Exclude<CvSectionKey, "objective">, id: string) =>
    setItems(key, itemsOf(key).filter((it) => it.id !== id));

  const moveItem = (key: Exclude<CvSectionKey, "objective">, index: number, dir: -1 | 1) => {
    const items = [...itemsOf(key)];
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    setItems(key, items);
  };

  const moveSection = (key: CvSectionKey, dir: -1 | 1) => {
    const order = [...cv.layout.sectionOrder];
    const i = order.indexOf(key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    update((prev) => ({ ...prev, layout: { ...prev.layout, sectionOrder: order } }));
  };

  const toggleHidden = (key: CvSectionKey) =>
    update((prev) => {
      const hidden = prev.layout.hidden.includes(key)
        ? prev.layout.hidden.filter((k) => k !== key)
        : [...prev.layout.hidden, key];
      return { ...prev, layout: { ...prev.layout, hidden } };
    });

  const completeness = useMemo(() => {
    const checks = [
      Boolean(cv.personal.fullName && cv.personal.email && cv.personal.phone),
      cv.objective.trim().length > 40,
      cv.education.length > 0,
      cv.experience.length > 0 || cv.projects.length > 0,
      cv.skills.length >= 3,
      cv.references.length > 0 || cv.training.length > 0,
      !cv.layout.hidden.includes("education"),
      cv.personal.address.length > 4,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [cv]);

  async function saveToAccount() {
    if (!signedIn) {
      setError("Sign in to store this CV on your account. Your browser draft is still saved.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, template: cv.layout.template, content: cv }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not save the CV.");
        return;
      }
      setDirty(false);
      setMessage(data.message ?? "CV saved to your account.");
    } catch {
      setError("Network error — the CV was not saved to your account.");
    } finally {
      setBusy(false);
    }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "careerbridge-cv").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setCv(normalizeCv(JSON.parse(String(reader.result))));
        setDirty(true);
        setMessage("CV data imported. Check every section before exporting.");
      } catch {
        setError("That file could not be read as CV JSON.");
      }
    };
    reader.readAsText(file);
  }

  function fillFromProfile() {
    // Copy obvious details from the profile form fields the user already typed in this browser? Not available.
    setMessage("Tip: your saved profile and this CV are separate — CareerBridge does not invent text for you.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
      {/* ------------------------------- editor ------------------------------- */}
      <div className="space-y-4">
        <div className="cb-panel p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-[12rem] flex-1">
              <Field label="Document name" htmlFor="cv-title" hint="Only used for the file name when you export.">
                <Input id="cv-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {dirty ? <Badge tone="warn">Unsaved changes</Badge> : <Badge tone="success">Saved</Badge>}
              <Button type="button" onClick={saveToAccount} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                Save to account
              </Button>
              <Button type="button" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print / Save as PDF
              </Button>
            </div>
          </div>

          {message ? (
            <Notice tone="success" className="mt-4">
              {message}
            </Notice>
          ) : null}
          {error ? (
            <Notice tone="danger" className="mt-4">
              {error}
            </Notice>
          ) : null}

          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-line-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[0.78rem] font-bold text-ink-600" role="status" aria-live="polite">
              {completeness}% complete
            </p>
          </div>
        </div>

        {/* template picker */}
        <div className="cb-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[1rem] font-bold text-ink-900">Template</h2>
            <p className="text-[0.76rem] text-ink-400">Changing template never clears your text.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CV_TEMPLATES.map((t) => {
              const active = cv.layout.template === t.slug;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => update((prev) => ({ ...prev, layout: { ...prev.layout, template: t.slug, accent: t.accent } }))}
                  aria-pressed={active}
                  className={cn(
                    "group rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-brand-400 bg-brand-50/70 ring-2 ring-brand-200"
                      : "border-line-200 bg-white hover:border-ink-200",
                  )}
                >
                  <span className="block h-20 overflow-hidden rounded-lg border border-line-200 bg-white p-2">
                    <span className="block h-2 w-2/3 rounded" style={{ background: t.accent }} />
                    <span className="mt-1.5 block h-1 w-1/2 rounded bg-line-300" />
                    <span className="mt-2 block space-y-1">
                      {[90, 75, 85, 60].map((w, i) => (
                        <span key={i} className="block h-[3px] rounded bg-line-200" style={{ width: `${w}%` }} />
                      ))}
                    </span>
                  </span>
                  <span className="mt-2 block text-[0.84rem] font-bold text-ink-900">{t.name}</span>
                  <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-500">{t.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Line spacing" htmlFor="cv-density">
              <Select
                id="cv-density"
                value={cv.layout.density}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    layout: { ...prev.layout, density: e.target.value as CvContent["layout"]["density"] },
                  }))
                }
              >
                <option value="compact">Compact — fits more</option>
                <option value="regular">Regular — recommended</option>
                <option value="relaxed">Relaxed — easier to read</option>
              </Select>
            </Field>
            <Field label="Heading style" htmlFor="cv-case">
              <Select
                id="cv-case"
                value={cv.layout.uppercaseHeadings ? "upper" : "title"}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    layout: { ...prev.layout, uppercaseHeadings: e.target.value === "upper" },
                  }))
                }
              >
                <option value="upper">UPSECTION HEADINGS</option>
                <option value="title">Section headings</option>
              </Select>
            </Field>
            <Field label="Accent colour" htmlFor="cv-accent">
              <div className="flex items-center gap-2">
                <input
                  id="cv-accent"
                  type="color"
                  value={cv.layout.accent}
                  onChange={(e) => update((prev) => ({ ...prev, layout: { ...prev.layout, accent: e.target.value } }))}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-line-300 bg-white p-1"
                />
                <span className="font-mono text-[0.78rem] text-ink-500">{cv.layout.accent}</span>
              </div>
            </Field>
          </div>
        </div>

        {/* section nav + forms */}
        <div className="cb-panel overflow-hidden p-0">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line-100 bg-canvas px-4 py-3">
            {(["personal", ...DEFAULT_SECTION_ORDER] as Array<"personal" | CvSectionKey>).map((key) => {
              const label = key === "personal" ? "Personal details" : SECTION_LABELS[key];
              const active = openSection === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOpenSection(key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.78rem] font-bold transition-colors",
                    active ? "bg-white text-brand-700 ring-1 ring-brand-200" : "text-ink-500 hover:bg-white/70 hover:text-ink-800",
                  )}
                >
                  {label}
                  {key !== "personal" && key !== "objective" ? (
                    <span className={cn("rounded px-1 text-[0.68rem]", active ? "bg-brand-50 text-brand-600" : "bg-line-100 text-ink-400")}>
                      {(cv[key as keyof CvContent] as unknown[] | undefined)?.length ?? 0}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="space-y-4 p-5">
            {openSection === "personal" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {PERSONAL_FIELDS.map((f) => (
                    <div key={f.key} className={f.half ? "" : "sm:col-span-2"}>
                      <Field label={f.label} htmlFor={`cv-p-${f.key}`} required={["fullName", "email", "phone"].includes(f.key)}>
                        <Input
                          id={`cv-p-${f.key}`}
                          value={(cv.personal as unknown as Record<string, string>)[f.key] ?? ""}
                          placeholder={f.placeholder}
                          onChange={(e) => patchPersonal(f.key, e.target.value)}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
                <Notice tone="info" title="What not to put on a CV in Bangladesh">
                  Skip your national ID number, religion, marital status, a photograph and your full home address —
                  a thana or area line is enough. Employers do not need medical information.
                </Notice>
              </>
            ) : openSection === "objective" ? (
              <>
                <Field
                  label="Career objective or professional summary"
                  htmlFor="cv-objective"
                  required
                  hint="Two to four sentences. Name the job you want, your real availability and one concrete strength."
                >
                  <Textarea
                    id="cv-objective"
                    rows={7}
                    value={cv.objective}
                    onChange={(e) => update({ objective: e.target.value })}
                    placeholder="Recent BBA graduate looking for a part-time evening role in Mirpur…"
                  />
                </Field>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.76rem] font-semibold text-ink-400">
                    {cv.objective.trim().length} characters
                  </span>
                  <button
                    type="button"
                    onClick={fillFromProfile}
                    className="text-[0.78rem] font-bold text-brand-600 hover:underline"
                  >
                    Why we do not write this for you
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-[1rem] font-bold text-ink-900">
                    {SECTION_LABELS[openSection]}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleHidden(openSection)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line-300 px-2.5 py-1.5 text-[0.76rem] font-semibold text-ink-600 hover:border-ink-300"
                    >
                      {cv.layout.hidden.includes(openSection) ? (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {cv.layout.hidden.includes(openSection) ? "Show in CV" : "Hide from CV"}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(openSection, -1)}
                        aria-label={`Move ${SECTION_LABELS[openSection]} earlier`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line-300 text-ink-500 hover:border-ink-300"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(openSection, 1)}
                        aria-label={`Move ${SECTION_LABELS[openSection]} later`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line-300 text-ink-500 hover:border-ink-300"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {itemsOf(openSection).length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line-300 bg-canvas px-4 py-6 text-center text-[0.85rem] text-ink-500">
                    Nothing here yet. {openSection === "experience" ? "Volunteering, club work and family business help all count." : "Add your first entry below."}
                  </p>
                ) : null}

                {itemsOf(openSection).map((item, i) => (
                  <div key={item.id} className="rounded-xl border border-line-200 bg-canvas/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[0.76rem] font-bold uppercase tracking-wide text-ink-400">Entry {i + 1}</p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveItem(openSection, i, -1)}
                          disabled={i === 0}
                          aria-label="Move entry up"
                          className="grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-white disabled:opacity-40"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(openSection, i, 1)}
                          disabled={i === itemsOf(openSection).length - 1}
                          aria-label="Move entry down"
                          className="grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-white disabled:opacity-40"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(openSection, item.id)}
                          className="grid h-7 w-7 place-items-center rounded-md text-red-700/80 hover:bg-white hover:text-red-700"
                          aria-label={`Remove entry ${i + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {SECTION_META[openSection].fields.map((f) => (
                        <div key={f.key} className={f.half ? "" : "sm:col-span-2"}>
                          <Field label={f.label} htmlFor={`${item.id}-${f.key}`}>
                            {f.type === "textarea" ? (
                              <Textarea
                                id={`${item.id}-${f.key}`}
                                rows={4}
                                value={item[f.key] ?? ""}
                                placeholder={f.placeholder}
                                onChange={(e) => patchItem(openSection, item.id, f.key, e.target.value)}
                              />
                            ) : f.type === "level" ? (
                              <Select
                                id={`${item.id}-${f.key}`}
                                value={item[f.key] ?? ""}
                                onChange={(e) => patchItem(openSection, item.id, f.key, e.target.value)}
                              >
                                <option value="">Not stated</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                              </Select>
                            ) : (
                              <Input
                                id={`${item.id}-${f.key}`}
                                value={item[f.key] ?? ""}
                                placeholder={f.placeholder}
                                onChange={(e) => patchItem(openSection, item.id, f.key, e.target.value)}
                              />
                            )}
                          </Field>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={() => addItem(openSection)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add {SECTION_LABELS[openSection].toLowerCase()} entry
                </Button>
              </>
            )}
          </div>
        </div>

        {/* backup / restore */}
        <div className="cb-panel flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Keep a copy</h2>
            <p className="mt-1 text-[0.82rem] text-ink-500">
              Your CV is stored in this browser and, when you are signed in, on your account. You can also download a
              JSON copy and re-import it on another device.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={downloadJson}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download copy
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import copy
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importJson(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm("Clear every field and start a blank CV? Your saved account copy is not deleted.")) {
                  setCv(emptyCv());
                  setDirty(true);
                  setMessage("Started a blank CV.");
                }
              }}
            >
              Start blank
            </Button>
          </div>
        </div>

        {/* tips */}
        <div className="cb-panel p-5">
          <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Beginner-friendly CV instructions</h2>
          <ol className="mt-3 space-y-2.5">
            {CV_WRITING_TIPS.map((t, i) => (
              <li key={t.title} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-50 text-[0.68rem] font-bold text-brand-600">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[0.85rem] font-bold text-ink-900">{t.title}</span>
                  <span className="block text-[0.83rem] leading-relaxed text-ink-500">{t.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/career-tools/cv/examples"
              className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-2 text-[0.8rem] font-bold text-ink-700 hover:text-brand-600"
            >
              See two example CVs
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/guidance/cv-writing-tips-freshers"
              className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-2 text-[0.8rem] font-bold text-ink-700 hover:text-brand-600"
            >
              Full CV guide for freshers
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------- preview ------------------------------ */}
      <div className="xl:sticky xl:top-24 xl:self-start">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[0.95rem] font-bold text-ink-900">Live preview</h2>
          <p className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink-400">
            <Check className="h-3.5 w-3.5 text-green-700" aria-hidden="true" />
            A4 · updates as you type
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line-200 bg-canvas-deep p-4">
          <div id="cv-print" className="mx-auto origin-top rounded-lg bg-white p-6 shadow-[var(--shadow-soft)]">
            <CvPreview content={cv} />
          </div>
        </div>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-400">
          “Print / Save as PDF” opens your browser print dialog — choose <span className="font-semibold">Save as PDF</span>{" "}
          as the destination, keep margins at “Default” and turn off headers and footers. This produces a real,
          text-based PDF that recruiters can open and search.
        </p>
      </div>
    </div>
  );
}
