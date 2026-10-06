import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Title + count + optional action link — used by every widget. */
export function SectionHeader({
  id,
  title,
  icon,
  count,
  countTone,
  action,
  as: As = "h2",
  className,
  children,
}: {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  count?: number;
  countTone?: "default" | "red";
  action?: { href: string; label: string };
  as?: "h2" | "h3";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <As id={id} className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
        {icon}
        {title}
        {count !== undefined && (
          <span
            data-tone={countTone === "red" ? "red" : undefined}
            className={cn(
              "rounded-full px-1.5 py-0.5 font-sans text-xs leading-none font-semibold tabular-nums",
              countTone === "red" ? "bg-(--tone-bg) text-(--tone-fg)" : "bg-muted text-muted-foreground",
            )}
          >
            <span className="sr-only">(</span>
            {count}
            <span className="sr-only"> items)</span>
          </span>
        )}
      </As>
      {children}
      {action && (
        <Link
          href={action.href}
          className="ml-auto inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {action.label}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
