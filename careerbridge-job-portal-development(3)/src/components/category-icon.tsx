import {
  BookOpen,
  Building2,
  Code2,
  Coffee,
  Headset,
  Laptop,
  Megaphone,
  Palette,
  ShoppingCart,
  Store,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAP: Record<string, LucideIcon> = {
  Store,
  Coffee,
  BookOpen,
  ShoppingCart,
  UtensilsCrossed,
  Laptop,
  Code2,
  Palette,
  Megaphone,
  Headset,
  Truck,
  Building2,
};

export function CategoryIcon({
  name,
  className,
  tone = "brand",
}: {
  name?: string | null;
  className?: string;
  tone?: "brand" | "ink";
}) {
  const Icon = (name && MAP[name]) || BriefcaseFallback;
  return (
    <span
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
        tone === "brand"
          ? "border-brand-100 bg-brand-50 text-brand-600"
          : "border-line-200 bg-canvas text-ink-600",
        className,
      )}
      aria-hidden="true"
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} />
    </span>
  );
}

function BriefcaseFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="7" width="19" height="13" rx="2.5" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M2.5 12.5h19" />
    </svg>
  );
}
