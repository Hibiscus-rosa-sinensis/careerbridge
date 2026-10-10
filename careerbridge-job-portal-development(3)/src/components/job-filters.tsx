"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import {
  DIVISIONS,
  DISTRICTS,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  UPAZILAS,
  WORK_MODES,
} from "@/lib/constants";
import { Button, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

export type FilterState = {
  q: string;
  division: string;
  district: string;
  upazila: string;
  category: string;
  types: string[];
  modes: string[];
  experience: string[];
  education: string[];
  salary: number;
  entry: boolean;
  accessible: boolean;
  flexible: boolean;
  sort: string;
};

export const emptyFilters: FilterState = {
  q: "",
  division: "",
  district: "",
  upazila: "",
  category: "",
  types: [],
  modes: [],
  experience: [],
  education: [],
  salary: 0,
  entry: false,
  accessible: false,
  flexible: false,
  sort: "recent",
};

export function filtersFromParams(sp: Record<string, string | string[] | undefined>): FilterState {
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const list = (k: string) => (get(k) ? get(k).split(",").filter(Boolean) : []);
  return {
    q: get("q"),
    division: get("division"),
    district: get("district"),
    upazila: get("upazila"),
    category: get("cat"),
    types: list("type"),
    modes: list("mode"),
    experience: list("exp"),
    education: list("edu"),
    salary: Number(get("salary") || 0),
    entry: get("entry") === "1",
    accessible: get("access") === "1",
    flexible: get("flex") === "1",
    sort: get("sort") || "recent",
  };
}

export function filtersToQuery(f: FilterState, page = 1) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.division) p.set("division", f.division);
  if (f.district) p.set("district", f.district);
  if (f.upazila) p.set("upazila", f.upazila);
  if (f.category) p.set("cat", f.category);
  if (f.types.length) p.set("type", f.types.join(","));
  if (f.modes.length) p.set("mode", f.modes.join(","));
  if (f.experience.length) p.set("exp", f.experience.join(","));
  if (f.education.length) p.set("edu", f.education.join(","));
  if (f.salary) p.set("salary", String(f.salary));
  if (f.entry) p.set("entry", "1");
  if (f.accessible) p.set("access", "1");
  if (f.flexible) p.set("flex", "1");
  if (f.sort && f.sort !== "recent") p.set("sort", f.sort);
  if (page > 1) p.set("page", String(page));
  return p.toString();
}

function ChipToggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.8rem] font-semibold transition-colors",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1",
          checked
            ? "border-brand-400 bg-brand-50 text-brand-700"
            : "border-line-300 bg-white text-ink-600 hover:border-ink-200 hover:bg-canvas",
        )}
      >
        {children}
      </span>
    </label>
  );
}

export function JobFilters({
  initial,
  basePath,
  total,
  show = {},
  categories = [],
}: {
  initial: FilterState;
  basePath: string;
  total: number;
  show?: {
    modes?: boolean;
    experience?: boolean;
    education?: boolean;
    location?: boolean;
    types?: boolean;
    entry?: boolean;
    accessible?: boolean;
    flexible?: boolean;
    category?: boolean;
  };
  categories?: Array<{ slug: string; name: string; count?: number }>;
}) {
  const router = useRouter();
  const [state, setState] = useState<FilterState>(initial);
  const [open, setOpen] = useState(false);

  const activeCount = useMemo(() => {
    return (
      (state.types.length ? 1 : 0) +
      (state.modes.length ? 1 : 0) +
      (state.experience.length ? 1 : 0) +
      (state.education.length ? 1 : 0) +
      (state.salary ? 1 : 0) +
      (state.entry ? 1 : 0) +
      (state.accessible ? 1 : 0) +
      (state.flexible ? 1 : 0) +
      (state.division ? 1 : 0) +
      (state.district ? 1 : 0) +
      (state.upazila ? 1 : 0) +
      (state.category ? 1 : 0)
    );
  }, [state]);

  function commit(next: FilterState) {
    setState(next);
    const qs = filtersToQuery(next);
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }

  const districts = state.division ? (DISTRICTS[state.division] ?? []) : [];
  const upazilas = state.district ? (UPAZILAS[state.district] ?? []) : [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit(state);
      }}
      className="cb-panel overflow-hidden p-0"
      role="search"
      aria-label="Job search filters"
    >
      <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
        <div>
          <label className="cb-label" htmlFor="f-q">
            Job title, keyword or skill
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
            <input
              id="f-q"
              value={state.q}
              onChange={(e) => setState({ ...state, q: e.target.value })}
              placeholder="e.g. barista, React, data entry, tutor"
              className="cb-input pl-9"
            />
          </div>
        </div>

        {show.location ? (
          <>
            <div>
              <label className="cb-label" htmlFor="f-division">
                Division
              </label>
              <select
                id="f-division"
                className="cb-input"
                value={state.division}
                onChange={(e) => {
                  const division = e.target.value;
                  const next = { ...state, division, district: "", upazila: "" };
                  commit(next);
                }}
              >
                <option value="">All divisions</option>
                {DIVISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="cb-label" htmlFor="f-district">
                District / area
              </label>
              <select
                id="f-district"
                className="cb-input"
                value={state.district}
                disabled={!districts.length}
                onChange={(e) => {
                  const district = e.target.value;
                  commit({ ...state, district, upazila: "" });
                }}
              >
                <option value="">{districts.length ? "All districts" : "Select a division first"}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="lg:col-span-2">
            <label className="cb-label" htmlFor="f-loc">
              Location keyword (optional)
            </label>
            <input
              id="f-loc"
              className="cb-input"
              placeholder="Area, district or city — e.g. Mirpur, Cumilla"
              value={state.q && !state.district ? "" : state.district}
              onChange={(e) => setState({ ...state, district: e.target.value })}
            />
          </div>
        )}

        <div className="flex items-end">
          <Button type="submit" size="md" className="w-full lg:w-auto">
            <Search className="h-4 w-4" aria-hidden="true" />
            Find Jobs
          </Button>
        </div>
      </div>

      {show.location && upazilas.length ? (
        <div className="border-t border-line-100 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.78rem] font-semibold text-ink-500">Upazila / thana:</span>
            <ChipToggle
              checked={!state.upazila}
              onChange={() => commit({ ...state, upazila: "" })}
            >
              Any
            </ChipToggle>
            {upazilas.map((u) => (
              <ChipToggle
                key={u}
                checked={state.upazila === u}
                onChange={() => commit({ ...state, upazila: state.upazila === u ? "" : u })}
              >
                {u}
              </ChipToggle>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-100 bg-canvas px-4 py-2.5 sm:px-5">
        <p className="text-[0.8rem] font-medium text-ink-500" role="status" aria-live="polite">
          <span className="font-bold text-ink-900">{total}</span> matching{" "}
          {total === 1 ? "vacancy" : "vacancies"}
          {activeCount ? <span className="text-ink-300"> · {activeCount} filter{activeCount > 1 ? "s" : ""} applied</span> : null}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.8rem] font-semibold text-ink-600 hover:bg-white hover:text-ink-900"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {open ? "Hide filters" : "More filters"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
          </button>
          {activeCount || state.q ? (
            <button
              type="button"
              onClick={() => commit(emptyFilters)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.8rem] font-semibold text-brand-600 hover:bg-brand-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="grid gap-5 border-t border-line-100 px-4 py-5 sm:px-5 md:grid-cols-2 xl:grid-cols-3">
          {show.types ? (
            <fieldset>
              <legend className="cb-label">Employment type</legend>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map((t) => (
                  <ChipToggle
                    key={t.value}
                    checked={state.types.includes(t.value)}
                    onChange={(v) =>
                      commit({
                        ...state,
                        types: v ? [...state.types, t.value] : state.types.filter((x) => x !== t.value),
                      })
                    }
                  >
                    {t.label}
                  </ChipToggle>
                ))}
              </div>
            </fieldset>
          ) : null}

          {show.modes ? (
            <fieldset>
              <legend className="cb-label">Work arrangement</legend>
              <div className="flex flex-wrap gap-2">
                {WORK_MODES.map((m) => (
                  <ChipToggle
                    key={m.value}
                    checked={state.modes.includes(m.value)}
                    onChange={(v) =>
                      commit({
                        ...state,
                        modes: v ? [...state.modes, m.value] : state.modes.filter((x) => x !== m.value),
                      })
                    }
                  >
                    {m.label}
                  </ChipToggle>
                ))}
              </div>
            </fieldset>
          ) : null}

          {show.experience ? (
            <fieldset>
              <legend className="cb-label">Experience level</legend>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.filter((e) => e.value !== "any").map((e) => (
                  <ChipToggle
                    key={e.value}
                    checked={state.experience.includes(e.value)}
                    onChange={(v) =>
                      commit({
                        ...state,
                        experience: v
                          ? [...state.experience, e.value]
                          : state.experience.filter((x) => x !== e.value),
                      })
                    }
                  >
                    {e.label}
                  </ChipToggle>
                ))}
              </div>
            </fieldset>
          ) : null}

          {show.education ? (
            <fieldset>
              <legend className="cb-label">Education required</legend>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map((e) => (
                  <ChipToggle
                    key={e.value}
                    checked={state.education.includes(e.value)}
                    onChange={(v) =>
                      commit({
                        ...state,
                        education: v
                          ? [...state.education, e.value]
                          : state.education.filter((x) => x !== e.value),
                      })
                    }
                  >
                    {e.label}
                  </ChipToggle>
                ))}
              </div>
            </fieldset>
          ) : null}

          {show.category && categories.length ? (
            <div>
              <label className="cb-label" htmlFor="f-cat">
                Category
              </label>
              <select
                id="f-cat"
                className="cb-input"
                value={state.category}
                onChange={(e) => commit({ ...state, category: e.target.value })}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                    {typeof c.count === "number" ? ` (${c.count})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="cb-label" htmlFor="f-salary">
              Minimum monthly pay
            </label>
            <select
              id="f-salary"
              className="cb-input"
              value={String(state.salary)}
              onChange={(e) => commit({ ...state, salary: Number(e.target.value) })}
            >
              <option value="0">Any salary</option>
              <option value="5000">Tk 5,000+</option>
              <option value="8000">Tk 8,000+</option>
              <option value="12000">Tk 12,000+</option>
              <option value="20000">Tk 20,000+</option>
              <option value="35000">Tk 35,000+</option>
            </select>
          </div>

          <div>
            <label className="cb-label" htmlFor="f-sort">
              Sort results
            </label>
            <select
              id="f-sort"
              className="cb-input"
              value={state.sort}
              onChange={(e) => commit({ ...state, sort: e.target.value })}
            >
              <option value="recent">Newest first</option>
              <option value="salary">Highest pay</option>
            </select>
          </div>

          <div className="space-y-2.5">
            <span className="cb-label">Quick switches</span>
            <div className="flex flex-wrap gap-2">
              {show.entry !== false ? (
                <ChipToggle checked={state.entry} onChange={(v) => commit({ ...state, entry: v })}>
                  Fresher friendly
                </ChipToggle>
              ) : null}
              {show.flexible !== false ? (
                <ChipToggle checked={state.flexible} onChange={(v) => commit({ ...state, flexible: v })}>
                  Flexible hours
                </ChipToggle>
              ) : null}
              {show.accessible !== false ? (
                <ChipToggle checked={state.accessible} onChange={(v) => commit({ ...state, accessible: v })}>
                  Accessibility info
                </ChipToggle>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function pageHref(basePath: string, filters: FilterState, page: number) {
  const qs = filtersToQuery(filters, page);
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  page,
  pages,
  basePath,
  filters,
  total,
  perPage,
}: {
  page: number;
  pages: number;
  basePath: string;
  filters: FilterState;
  total: number;
  perPage: number;
}) {
  if (pages <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  return (
    <nav aria-label="Job results pages" className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-[0.8rem] text-ink-400">
        Showing <span className="font-semibold text-ink-700">{from}–{to}</span> of{" "}
        <span className="font-semibold text-ink-700">{total}</span> vacancies
      </p>
      <ul className="flex items-center gap-1.5">
        {page > 1 ? (
          <li>
            <Link
              href={pageHref(basePath, filters, page - 1)}
              className={buttonClass({ variant: "outline", size: "sm" })}
            >
              Previous
            </Link>
          </li>
        ) : null}
        {nums.map((n, i) => (
          <li key={n} className="flex items-center">
            {i > 0 && n - nums[i - 1] > 1 ? <span className="px-1 text-ink-300">…</span> : null}
            <Link
              href={pageHref(basePath, filters, n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                buttonClass({ variant: n === page ? "primary" : "outline", size: "sm", className: "w-9 px-0" }),
              )}
            >
              {n}
            </Link>
          </li>
        ))}
        {page < pages ? (
          <li>
            <Link
              href={pageHref(basePath, filters, page + 1)}
              className={buttonClass({ variant: "outline", size: "sm" })}
            >
              Next
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
