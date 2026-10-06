"use client";

import { useMemo, useState } from "react";
import { List, SquareKanban, X } from "lucide-react";
import { bucketOf, sortTasks } from "@/lib/derive";
import { todayISO } from "@/lib/dates";
import { AREA_TONE, PRIORITY, PRIORITY_ORDER, TASK_STATUS, TASK_STATUS_ORDER } from "@/lib/meta";
import type { Pickers } from "@/lib/queries";
import type { AreaId, Priority, Task, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FilterMenu } from "@/components/cw/filter-menu";
import { Flag } from "@/components/cw/platform-icon";
import { EmptyState } from "@/components/cw/states";
import { useQuickAdd } from "@/components/quick-add/quick-add-provider";
import { TaskBoard } from "./task-board";
import { TaskRow, type MissionLookup } from "./task-row";

export type DueFilter = "overdue" | "today" | "week";
const DUE_LABEL: Record<DueFilter, string> = { overdue: "Overdue", today: "Due today", week: "This week" };

/** Keeps filters in the URL so views are shareable and survive refresh. */
function syncUrl(params: Record<string, string | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const val = Array.isArray(v) ? v.join(",") : v;
    if (val) sp.set(k, val);
  }
  const qs = sp.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

export function AllTasks({
  tasks,
  pickers,
  initial,
}: {
  tasks: Task[];
  pickers: Pickers;
  initial: { view: "list" | "board"; due?: DueFilter; status?: TaskStatus; mission: string[]; area: AreaId[]; priority: Priority[] };
}) {
  const { open } = useQuickAdd();
  const [view, setView] = useState(initial.view);
  const [due, setDue] = useState(initial.due);
  const [status, setStatus] = useState(initial.status);
  const [mission, setMission] = useState(initial.mission);
  const [area, setArea] = useState(initial.area);
  const [priority, setPriority] = useState(initial.priority);

  const missions: MissionLookup = useMemo(() => Object.fromEntries(pickers.missions.map((m) => [m.id, m])), [pickers.missions]);

  function update(next: Partial<{ view: typeof view; due: DueFilter | undefined; status: TaskStatus | undefined; mission: string[]; area: AreaId[]; priority: Priority[] }>) {
    const s = { view, due, status, mission, area, priority, ...next };
    if ("view" in next) setView(s.view);
    if ("due" in next) setDue(s.due);
    if ("status" in next) setStatus(s.status);
    if ("mission" in next) setMission(s.mission);
    if ("area" in next) setArea(s.area);
    if ("priority" in next) setPriority(s.priority);
    syncUrl({ view: s.view === "board" ? "board" : undefined, due: s.due, status: s.status, mission: s.mission, area: s.area, priority: s.priority });
  }

  const today = todayISO();
  const filtered = tasks
    .filter(
      (t) =>
        (!mission.length || (t.missionId && mission.includes(t.missionId))) &&
        (!area.length || (t.areaId && area.includes(t.areaId))) &&
        (!priority.length || priority.includes(t.priority)) &&
        (!status || t.status === status) &&
        (!due || bucketOf(t, today) === due),
    )
    .sort(sortTasks);
  const activeCount = mission.length + area.length + priority.length + (due ? 1 : 0) + (status ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && update({ view: v as typeof view })} aria-label="Layout">
          <ToggleGroupItem value="list">
            <List aria-hidden /> List
          </ToggleGroupItem>
          <ToggleGroupItem value="board">
            <SquareKanban aria-hidden /> Board
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
        <FilterMenu
          label="Mission"
          options={pickers.missions.map((m) => ({ value: m.id, label: m.name, icon: <Flag country={m.country} /> }))}
          selected={mission}
          onChange={(v) => update({ mission: v })}
        />
        <FilterMenu label="Area" options={pickers.areas.map((a) => ({ value: a.id, label: a.name, tone: AREA_TONE[a.id] }))} selected={area} onChange={(v) => update({ area: v })} />
        <FilterMenu label="Priority" options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY[p].label, tone: PRIORITY[p].tone }))} selected={priority} onChange={(v) => update({ priority: v })} />
        {due && (
          <Button variant="outline" size="sm" data-tone={due === "overdue" ? "red" : undefined} className="rounded-full border-(--tone-border) bg-(--tone-bg) text-(--tone-fg)" onClick={() => update({ due: undefined })}>
            {DUE_LABEL[due]} <X aria-label="Remove filter" />
          </Button>
        )}
        {status && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => update({ status: undefined })}>
            {TASK_STATUS[status].label} <X aria-label="Remove filter" />
          </Button>
        )}
        {activeCount > 1 && (
          <Button variant="ghost" size="sm" onClick={() => update({ due: undefined, status: undefined, mission: [], area: [], priority: [] })}>
            Clear all
          </Button>
        )}
        <p className="ml-auto text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {filtered.length} tasks
        </p>
      </div>

      {view === "board" ? (
        <TaskBoard tasks={filtered} missions={missions} />
      ) : filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="No tasks match these filters" hint="Try removing a filter." />
      ) : (
        <div className="flex flex-col gap-6">
          {TASK_STATUS_ORDER.map((s) => {
            const group = filtered.filter((t) => t.status === s);
            if (!group.length) return null;
            return (
              <section key={s} aria-labelledby={`grp-${s}`} className="rounded-2xl border bg-card p-3 shadow-xs">
                <h2 id={`grp-${s}`} data-tone={TASK_STATUS[s].tone} className="mb-1 flex items-center gap-2 px-2 py-1 text-sm font-semibold">
                  <span className="size-2 rounded-full bg-(--tone-dot)" aria-hidden />
                  {TASK_STATUS[s].label}
                  <span className="rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">{group.length}</span>
                </h2>
                <ul className="flex flex-col">
                  {group.map((t) => (
                    <TaskRow key={t.id} task={t} missions={missions} variant={t.status === "waiting" ? "waiting" : "default"} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      <Button variant="outline" className="self-start" onClick={() => open("task", { missionId: mission[0], areaId: area[0], priority: priority[0] })}>
        + Add task
      </Button>
    </div>
  );
}
