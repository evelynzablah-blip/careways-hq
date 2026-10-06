import { ArrowDown, ArrowUp, CircleAlert, CircleCheck, CircleDashed, CircleX, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_STATUS, HEALTH, MISSION_STATUS, PRIORITY, TASK_STATUS, type Tone } from "@/lib/meta";
import type { ContentStatus, Health, MissionStatus, Priority, TaskStatus } from "@/lib/types";

type StatusProps =
  | { kind: "mission"; status: MissionStatus }
  | { kind: "content"; status: ContentStatus }
  | { kind: "task"; status: TaskStatus };

const STATUS_META = { mission: MISSION_STATUS, content: CONTENT_STATUS, task: TASK_STATUS } as const;

export function TonePill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      data-tone={tone}
      className={cn(
        "inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-full bg-(--tone-bg) px-2 text-xs font-medium whitespace-nowrap text-(--tone-fg)",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Status as a pill with a colored dot + text (never color alone). */
export function StatusPill({ className, ...props }: StatusProps & { className?: string }) {
  const meta = (STATUS_META[props.kind] as Record<string, { label: string; tone: Tone }>)[props.status];
  return (
    <TonePill tone={meta.tone} className={className}>
      <span aria-hidden className="size-1.5 rounded-full bg-(--tone-dot)" />
      {meta.label}
    </TonePill>
  );
}

const PRIORITY_ICON = { high: ArrowUp, medium: Minus, low: ArrowDown } as const;

export function PriorityBadge({ priority, compact, className }: { priority: Priority; compact?: boolean; className?: string }) {
  const meta = PRIORITY[priority];
  const Icon = PRIORITY_ICON[priority];
  return (
    <span
      data-tone={meta.tone}
      title={compact ? `${meta.label} priority` : undefined}
      className={cn(
        "inline-flex h-5.5 shrink-0 items-center gap-1 rounded-md border border-(--tone-border) bg-(--tone-bg) px-1.5 text-xs font-medium text-(--tone-fg)",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {compact ? <span className="sr-only">{meta.label} priority</span> : meta.label}
    </span>
  );
}

const HEALTH_ICON = { "on-track": CircleCheck, "at-risk": CircleAlert, "off-track": CircleX, unscheduled: CircleDashed } as const;

export function HealthIndicator({ health, className }: { health: Health; className?: string }) {
  const meta = HEALTH[health];
  const Icon = HEALTH_ICON[health];
  return (
    <span data-tone={meta.tone} title={meta.hint} className={cn("inline-flex items-center gap-1 text-xs font-medium text-(--tone-fg)", className)}>
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  tone = "green",
  className,
  showValue = true,
}: {
  value: number;
  label: string;
  tone?: Tone;
  className?: string;
  showValue?: boolean;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex items-center gap-2", className)} data-tone={tone}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-(--tone-dot) transition-[width] duration-500" style={{ width: `${v}%` }} />
      </div>
      {showValue && <span className="w-9 text-right text-xs font-medium tabular-nums">{v}%</span>}
    </div>
  );
}
