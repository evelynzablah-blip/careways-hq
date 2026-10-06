"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { Hourglass } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setTaskStatus } from "@/lib/actions";
import { daysBetween, formatDue, todayISO } from "@/lib/dates";
import type { Pickers } from "@/lib/queries";
import type { Task } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Flag } from "@/components/cw/platform-icon";
import { PriorityBadge } from "@/components/cw/pills";

export type MissionLookup = Record<string, Pickers["missions"][number]>;

/** Completes a task with a short strike-through, then offers Undo in a toast. */
export function useCompleteTask(task: Task) {
  const [completing, setCompleting] = useState(task.status === "done");

  // Global startTransition (not useTransition): Undo runs after this row has unmounted.
  function toggle(checked: boolean) {
    const prev = task.status;
    setCompleting(checked);
    if (!checked) {
      startTransition(() => setTaskStatus(task.id, "todo"));
      return;
    }
    // Let the check + strike-through animation play before the row leaves the list.
    setTimeout(() => {
      toast.success("Task completed", {
        description: task.title,
        duration: 6000,
        action: {
          label: "Undo",
          onClick: () => startTransition(() => setTaskStatus(task.id, prev === "done" ? "todo" : prev)),
        },
      });
      startTransition(() => setTaskStatus(task.id, "done"));
    }, 450);
  }

  return { completing, toggle };
}

export function TaskRow({
  task,
  missions,
  variant = "default",
  className,
}: {
  task: Task;
  missions: MissionLookup;
  variant?: "default" | "waiting";
  className?: string;
}) {
  const { completing, toggle } = useCompleteTask(task);
  const today = todayISO();
  const mission = task.missionId ? missions[task.missionId] : undefined;
  const overdue = !!task.due && task.due < today && task.status !== "done";
  const waitedDays = task.waitingOn ? Math.max(0, daysBetween(task.waitingOn.since, today)) : null;
  const id = `task-${task.id}`;

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-lg px-2 py-2 transition-[opacity,background-color] duration-300 hover:bg-muted/60",
        completing && "opacity-60",
        className,
      )}
    >
      <Checkbox
        checked={completing}
        onCheckedChange={(v) => toggle(v === true)}
        aria-labelledby={id}
        className="mt-0.5 size-4.5 rounded-full transition-transform data-[state=checked]:scale-110 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
      <div className="min-w-0 flex-1">
        <p
          id={id}
          className={cn(
            "text-sm leading-snug decoration-muted-foreground/70 decoration-2 transition-all duration-300",
            completing && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
          {(variant === "waiting" || task.status === "waiting") && task.waitingOn ? (
            <span
              data-tone={waitedDays !== null && waitedDays >= 7 ? "red" : "orange"}
              className="inline-flex items-center gap-1 font-medium text-(--tone-fg)"
              title={`Waiting on ${task.waitingOn.who} for ${waitedDays} days`}
            >
              <Hourglass className="size-3" aria-hidden />
              {task.waitingOn.who} · {waitedDays}d
            </span>
          ) : (
            task.due && (
              <span data-tone={overdue ? "red" : undefined} className={cn(overdue && "font-medium text-(--tone-fg)")}>
                {overdue ? `Overdue · ${formatDue(task.due, today)}` : formatDue(task.due, today)}
              </span>
            )
          )}
          {mission && (
            <Link href={`/missions/${mission.slug}`} className="relative inline-flex items-center gap-1 hover:text-foreground hover:underline">
              <Flag country={mission.country} />
              {mission.name}
            </Link>
          )}
        </div>
      </div>
      <PriorityBadge priority={task.priority} compact />
    </li>
  );
}
