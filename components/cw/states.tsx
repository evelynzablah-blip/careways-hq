"use client";

import { catchError, type ErrorInfo } from "next/error";
import { RotateCw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({ emoji, title, hint, className }: { emoji: string; title: string; hint?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-8 text-center", className)}>
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function WidgetErrorFallback(props: { name: string; className?: string }, { retry }: ErrorInfo) {
  return (
    <div
      role="alert"
      data-tone="red"
      className={cn("flex flex-col items-start gap-2 rounded-xl border border-(--tone-border) bg-(--tone-bg) p-4 text-(--tone-fg)", props.className)}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <TriangleAlert className="size-4" aria-hidden />
        Couldn’t load {props.name}.
      </p>
      <Button size="sm" variant="outline" onClick={() => retry()}>
        <RotateCw aria-hidden /> Try again
      </Button>
    </div>
  );
}

/** Per-widget error boundary: one failing widget never takes the dashboard down. */
export const WidgetBoundary = catchError(WidgetErrorFallback);

export function ListSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-1.5">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 flex-1" style={{ maxWidth: `${85 - ((i * 13) % 35)}%` }} />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      ))}
    </div>
  );
}
