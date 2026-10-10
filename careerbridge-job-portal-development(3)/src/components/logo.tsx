import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ size = "md" as "sm" | "md", className }: { size?: "sm" | "md"; className?: string }) {
  const box = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const text = size === "sm" ? "text-[1.02rem]" : "text-[1.15rem]";
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="CareerBridge home"
    >
      <span
        className={cn(
          "grid place-items-center rounded-[11px] bg-brand-500 text-white shadow-[0_8px_20px_-10px_rgba(234,106,21,0.95)] transition-transform group-hover:-translate-y-0.5",
          box,
        )}
        aria-hidden="true"
      >
        {/* two interlocking links: connection between talent and opportunity */}
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
          <path d="M9.5 14.5 14.5 9.5" />
          <path d="M11.9 7.1 13.6 5.4a3.8 3.8 0 0 1 5.4 5.4l-1.7 1.7" />
          <path d="M12.1 16.9 10.4 18.6a3.8 3.8 0 0 1-5.4-5.4l1.7-1.7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn("font-display font-extrabold tracking-tight text-ink-900", text)}>
          Career<span className="text-brand-600">Bridge</span>
        </span>
        <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-300">
          Jobs across Bangladesh
        </span>
      </span>
    </Link>
  );
}
