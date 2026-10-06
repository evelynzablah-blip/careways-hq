"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ArrowRight, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createTask, type NewTask } from "@/lib/actions";
import type { Task } from "@/lib/types";
import { EmptyState } from "@/components/cw/states";
import { TaskRow, type MissionLookup } from "./task-row";

// Refs: ClickUp My Work (collapsible groups with counts), Wrike widgets
// (count in header), Todoist board ("+ Add task" inline at the end).

function Group({
  label,
  tasks,
  missions,
  tone,
  variant,
  limit,
}: {
  label?: string;
  tasks: Task[];
  missions: MissionLookup;
  tone?: "red";
  variant?: "default" | "waiting";
  limit: number;
}) {
  const [open, setOpen] = useState(true);
  const visible = tasks.slice(0, limit);
  const list = (
    <ul className="flex flex-col">
      {visible.map((t) => (
        <TaskRow key={t.id} task={t} missions={missions} variant={variant} />
      ))}
    </ul>
  );
  if (!label) return list;
  return (
    <div data-tone={tone} className={cn(tone && "rounded-xl bg-(--tone-bg)/60 p-1")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold tracking-wide uppercase",
          tone ? "text-(--tone-fg)" : "text-muted-foreground",
        )}
      >
        <ChevronDown className={cn("size-3.5 transition-transform", !open && "-rotate-90")} aria-hidden />
        {label}
        <span className="tabular-nums">{tasks.length}</span>
      </button>
      {open && list}
    </div>
  );
}

function InlineAdd({ defaults, placeholder }: { defaults: Omit<NewTask, "title">; placeholder: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const raw = value.trim();
    if (!raw) return setEditing(false);
    // In the Waiting list, "Title @Who" sets who we're waiting on.
    const m = defaults.status === "waiting" ? raw.match(/^(.*?)\s+@(.+)$/) : null;
    const input: NewTask = { ...defaults, title: m ? m[1] : raw, waitingWho: m?.[2] };
    startTransition(async () => {
      const task = await createTask(input);
      toast.success("Task added", { description: task.title });
      setValue("");
      inputRef.current?.focus();
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Plus className="size-4" aria-hidden /> Add task
      </button>
    );
  }
  return (
    <form
      className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        autoFocus
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setValue("");
            setEditing(false);
          }
        }}
        onBlur={() => !value && setEditing(false)}
        placeholder={placeholder}
        aria-label="New task title"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <kbd className="hidden text-[0.7rem] text-muted-foreground sm:block">Enter ↵</kbd>
    </form>
  );
}

export function TaskList({
  tasks,
  overdue = [],
  missions,
  variant = "default",
  limit = 5,
  viewAll,
  addDefaults,
  addPlaceholder = "Task name",
  empty,
}: {
  tasks: Task[];
  overdue?: Task[];
  missions: MissionLookup;
  variant?: "default" | "waiting";
  limit?: number;
  viewAll?: string;
  addDefaults?: Omit<NewTask, "title">;
  addPlaceholder?: string;
  empty: { emoji: string; title: string; hint?: string };
}) {
  const total = tasks.length;
  return (
    <div className="flex flex-col gap-2">
      {overdue.length > 0 && <Group label="Overdue" tone="red" tasks={overdue} missions={missions} limit={limit} />}
      {total === 0 && overdue.length === 0 ? (
        <EmptyState {...empty} />
      ) : total > 0 ? (
        <Group tasks={tasks} missions={missions} variant={variant} limit={limit} />
      ) : null}
      {total > limit && viewAll && (
        <Link href={viewAll} className="inline-flex items-center gap-1 self-start rounded-md px-2 text-sm font-medium text-primary hover:underline">
          View all ({total}) <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
      {addDefaults && <InlineAdd defaults={addDefaults} placeholder={addPlaceholder} />}
    </div>
  );
}
