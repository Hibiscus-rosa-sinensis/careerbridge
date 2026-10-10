import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";

/* --------------------------------- buttons --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white border border-transparent hover:bg-brand-600 shadow-[0_10px_24px_-14px_rgba(234,106,21,0.9)]",
  secondary: "bg-ink-900 text-white border border-transparent hover:bg-ink-800",
  outline: "bg-white text-ink-800 border border-line-300 hover:border-ink-300 hover:bg-canvas",
  ghost: "bg-transparent text-ink-700 border border-transparent hover:bg-canvas",
  danger: "bg-red-700 text-white border border-transparent hover:brightness-95",
  subtle: "bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[0.8rem] gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-[10px]",
  lg: "h-[3.25rem] px-6 text-[0.95rem] gap-2 rounded-xl",
};

export function buttonClass(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center font-semibold transition-colors duration-150 select-none",
    "disabled:opacity-55 disabled:pointer-events-none",
    variants[opts.variant ?? "primary"],
    sizes[opts.size ?? "md"],
    opts.className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  href: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children">) {
  return (
    <Link href={href} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}

/* ---------------------------------- cards ---------------------------------- */

export function Panel({
  className,
  children,
  padded = true,
}: {
  className?: string;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <div className={cn("cb-panel", padded && "p-5 sm:p-6", className)}>{children}</div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <div className="mb-2 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-600">
            <span className="h-px w-6 bg-brand-300" aria-hidden="true" />
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-2xl font-bold text-ink-900 sm:text-[1.75rem]">{title}</h2>
        {description ? (
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------- badges --------------------------------- */

export type Tone = "neutral" | "accent" | "success" | "warn" | "danger" | "info" | "muted";

const toneClass: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-600 border-line-200",
  accent: "bg-brand-50 text-brand-700 border-brand-100",
  success: "bg-green-700/8 text-green-700 border-green-700/20",
  warn: "bg-amber-600/10 text-amber-600 border-amber-600/25",
  danger: "bg-red-700/8 text-red-700 border-red-700/20",
  info: "bg-blue-700/8 text-blue-700 border-blue-700/20",
  muted: "bg-line-100 text-ink-400 border-line-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.72rem] font-semibold",
        toneClass[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full bg-ink-200", className)} />;
}

/* ---------------------------------- forms ---------------------------------- */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required: isRequired,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <label className="cb-label" htmlFor={htmlFor}>
        {label}
        {isRequired ? <span className="ml-1 text-brand-600">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-[0.76rem] leading-relaxed text-ink-400">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 flex items-start gap-1 text-[0.76rem] font-medium text-red-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("cb-input", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("cb-input resize-y", props.className)} />;
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn("cb-input appearance-none pr-8", props.className)}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 text-[0.85rem] leading-snug text-ink-700",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-line-400 text-brand-500 accent-brand-500"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function SearchTextField({
  icon = <MapPin className="h-4 w-4 text-ink-300" aria-hidden="true" />,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
      <input {...props} className={cn("cb-input pl-9", props.className)} />
    </div>
  );
}

/* -------------------------------- feedback -------------------------------- */

export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "success" | "warn" | "danger";
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const map = {
    info: { cls: "border-blue-700/25 bg-blue-700/6 text-ink-700", Icon: Info },
    success: { cls: "border-green-700/25 bg-green-700/6 text-ink-700", Icon: CheckCircle2 },
    warn: { cls: "border-amber-600/30 bg-amber-600/8 text-ink-700", Icon: AlertTriangle },
    danger: { cls: "border-red-700/25 bg-red-700/6 text-ink-700", Icon: XCircle },
  } as const;
  const { cls, Icon } = map[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3 text-[0.85rem]", cls, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="leading-relaxed text-ink-600">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-300 bg-canvas px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-200 bg-white text-ink-400">
        {icon ?? <Info className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-bold text-ink-800">{title}</h3>
      {description ? (
        <p className="max-w-md text-[0.875rem] leading-relaxed text-ink-500">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-400">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

/* --------------------------------- misc bits -------------------------------- */

export function Stat({
  value,
  label,
  hint,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line-200 bg-white p-4">
      <div className="font-display text-2xl font-bold text-ink-900">{value}</div>
      <div className="mt-0.5 text-[0.78rem] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </div>
      {hint ? <p className="mt-1 text-[0.78rem] text-ink-400">{hint}</p> : null}
    </div>
  );
}

export function LinkList({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.href + item.label}>
          <Link
            href={item.href}
            className="text-sm text-ink-400 transition-colors hover:text-brand-600 hover:underline"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
