"use client";

// Refs: Asana board / Slack Lists — soft colored column headers with counts,
// cards with priority badge. Drag & drop between columns (dnd-kit) plus a
// "Move to…" menu on every card for keyboard and screen-reader users.

import { startTransition, useOptimistic, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Hourglass, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setTaskStatus } from "@/lib/actions";
import { daysBetween, formatDue, todayISO } from "@/lib/dates";
import { TASK_STATUS, TASK_STATUS_ORDER } from "@/lib/meta";
import type { Task, TaskStatus } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Flag } from "@/components/cw/platform-icon";
import { PriorityBadge } from "@/components/cw/pills";
import type { MissionLookup } from "./task-row";

const DONE_LIMIT = 8;

function CardBody({ task, missions, onMove }: { task: Task; missions: MissionLookup; onMove?: (s: TaskStatus) => void }) {
  const today = todayISO();
  const mission = task.missionId ? missions[task.missionId] : undefined;
  const overdue = task.status !== "done" && !!task.due && task.due < today;
  return (
    <>
      <div className="flex items-start gap-2">
        <p className={cn("flex-1 text-sm leading-snug font-medium", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</p>
        {onMove && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="-mt-0.5 -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label={`Move “${task.title}”`}
              // Keep the card's drag listeners from hijacking clicks/Enter meant for the menu.
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              {TASK_STATUS_ORDER.filter((s) => s !== task.status).map((s) => (
                <DropdownMenuItem key={s} onSelect={() => onMove(s)}>
                  <span data-tone={TASK_STATUS[s].tone} className="size-2 rounded-full bg-(--tone-dot)" aria-hidden />
                  {TASK_STATUS[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <PriorityBadge priority={task.priority} />
        {task.status === "waiting" && task.waitingOn ? (
          <span data-tone="orange" className="inline-flex items-center gap-1 font-medium text-(--tone-fg)">
            <Hourglass className="size-3" aria-hidden />
            {task.waitingOn.who} · {Math.max(0, daysBetween(task.waitingOn.since, today))}d
          </span>
        ) : (
          task.due && (
            <span data-tone={overdue ? "red" : undefined} className={cn(overdue && "font-medium text-(--tone-fg)")}>
              {formatDue(task.due, today)}
            </span>
          )
        )}
        {mission && (
          <span className="inline-flex items-center gap-1">
            <Flag country={mission.country} /> {mission.name}
          </span>
        )}
      </div>
    </>
  );
}

function Card({ task, missions, onMove }: { task: Task; missions: MissionLookup; onMove: (s: TaskStatus) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      aria-roledescription="Draggable task"
      className={cn(
        "cursor-grab touch-none rounded-xl border bg-card p-3 shadow-xs transition-shadow hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <CardBody task={task} missions={missions} onMove={onMove} />
    </li>
  );
}

function Column({ status, tasks, missions, onMove }: { status: TaskStatus; tasks: Task[]; missions: MissionLookup; onMove: (id: string, s: TaskStatus) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [showAll, setShowAll] = useState(false);
  const meta = TASK_STATUS[status];
  const visible = status === "done" && !showAll ? tasks.slice(0, DONE_LIMIT) : tasks;
  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`col-${status}`}
      data-tone={meta.tone}
      className={cn(
        "flex w-[82vw] max-w-80 shrink-0 snap-start flex-col rounded-2xl bg-muted/50 p-2 transition-colors sm:w-72 lg:w-auto lg:max-w-none lg:flex-1",
        isOver && "bg-(--tone-bg) ring-2 ring-(--tone-border)",
      )}
    >
      <h2 id={`col-${status}`} className="mb-2 flex items-center gap-2 rounded-lg bg-(--tone-bg) px-2.5 py-2 text-sm font-semibold text-(--tone-fg)">
        <span className="size-2 rounded-full bg-(--tone-dot)" aria-hidden />
        {meta.label}
        <span className="ml-auto rounded-full bg-card/70 px-1.5 text-xs tabular-nums">{tasks.length}</span>
      </h2>
      <ul className="flex min-h-24 flex-col gap-2">
        {visible.map((t) => (
          <Card key={t.id} task={t} missions={missions} onMove={(s) => onMove(t.id, s)} />
        ))}
      </ul>
      {status === "done" && tasks.length > DONE_LIMIT && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-card">
          {showAll ? "Show less" : `Show ${tasks.length - DONE_LIMIT} more`}
        </button>
      )}
    </section>
  );
}

export function TaskBoard({ tasks, missions }: { tasks: Task[]; missions: MissionLookup }) {
  const [optimistic, applyMove] = useOptimistic(tasks, (state, { id, status }: { id: string; status: TaskStatus }) =>
    state.map((t) => (t.id === id ? { ...t, status } : t)),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  function move(id: string, status: TaskStatus) {
    const task = optimistic.find((t) => t.id === id);
    if (!task || task.status === status) return;
    startTransition(async () => {
      applyMove({ id, status });
      await setTaskStatus(id, status);
    });
    toast.success(`Moved to ${TASK_STATUS[status].label}`, {
      description: task.title,
      action: { label: "Undo", onClick: () => startTransition(() => setTaskStatus(id, task.status)) },
    });
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (e.over) move(String(e.active.id), e.over.id as TaskStatus);
  }

  const active = activeId ? optimistic.find((t) => t.id === activeId) : null;
  const title = (id: string | number) => optimistic.find((t) => t.id === id)?.title ?? "task";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Picked up ${title(active.id)}.`,
          onDragOver: ({ active, over }) => (over ? `${title(active.id)} is over ${TASK_STATUS[over.id as TaskStatus].label}.` : `${title(active.id)} is no longer over a column.`),
          onDragEnd: ({ active, over }) => (over ? `${title(active.id)} moved to ${TASK_STATUS[over.id as TaskStatus].label}.` : `${title(active.id)} dropped.`),
          onDragCancel: ({ active }) => `Moving ${title(active.id)} was cancelled.`,
        },
      }}
    >
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
        {TASK_STATUS_ORDER.map((s) => (
          <Column key={s} status={s} tasks={optimistic.filter((t) => t.status === s)} missions={missions} onMove={move} />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <div className="rotate-2 rounded-xl border bg-card p-3 shadow-lg">
            <CardBody task={active} missions={missions} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
