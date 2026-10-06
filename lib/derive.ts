// Pure functions that replicate the Notion formulas (Bucket, Is Today, Progress,
// Risk…). No I/O — safe to use on server or client.

import { daysBetween, todayISO } from "./dates";
import { PRIORITY } from "./meta";
import type {
  AreaSummary,
  ContentItem,
  Health,
  Mission,
  MissionSummary,
  ProjectArea,
  Task,
  TaskBucket,
} from "./types";

/** Planning window used to compute the expected pace (≈ 9 months). */
export const PLANNING_WINDOW_DAYS = 270;

export function isOpen(t: Task) {
  return t.status !== "done";
}

export function bucketOf(t: Task, today = todayISO()): TaskBucket | null {
  if (!isOpen(t)) return null;
  if (t.status === "waiting") return "waiting";
  if (!t.due) return null;
  const d = daysBetween(today, t.due);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d <= 7) return "week";
  return null;
}

/** Done tasks: most recently completed first. Open tasks: by due date, then priority. */
export function sortTasks(a: Task, b: Task) {
  if (a.status === "done" && b.status === "done") return (a.completedAt ?? "") < (b.completedAt ?? "") ? 1 : -1;
  const pa = PRIORITY[a.priority].rank;
  const pb = PRIORITY[b.priority].rank;
  if ((a.due ?? "9999") !== (b.due ?? "9999")) return (a.due ?? "9999") < (b.due ?? "9999") ? -1 : 1;
  return pa - pb;
}

export function sortWaiting(a: Task, b: Task) {
  // Longest-waiting first.
  return (a.waitingOn?.since ?? "") < (b.waitingOn?.since ?? "") ? -1 : 1;
}

export function bucketTasks(tasks: Task[], today = todayISO()) {
  const out: Record<TaskBucket, Task[]> = { overdue: [], today: [], week: [], waiting: [] };
  for (const t of tasks) {
    const b = bucketOf(t, today);
    if (b) out[b].push(t);
  }
  out.overdue.sort(sortTasks);
  out.today.sort(sortTasks);
  out.week.sort(sortTasks);
  out.waiting.sort(sortWaiting);
  return out;
}

export function waitingDays(t: Task, today = todayISO()): number | null {
  return t.waitingOn ? Math.max(0, daysBetween(t.waitingOn.since, today)) : null;
}

/**
 * Health = actual progress vs. expected pace.
 * expected = share of the planning window (PLANNING_WINDOW_DAYS before start) already elapsed.
 * gap ≤ 10 → on track · ≤ 25 → at risk · > 25 → off track · no date → unscheduled.
 */
export function healthOf(m: Mission, today = todayISO()): { health: Health; daysToStart: number | null; expected: number | null } {
  if (!m.dates) return { health: "unscheduled", daysToStart: null, expected: null };
  const daysToStart = daysBetween(today, m.dates.start);
  if (m.status === "completed" || m.status === "in-field") {
    return { health: "on-track", daysToStart, expected: 100 };
  }
  const elapsed = PLANNING_WINDOW_DAYS - daysToStart;
  const expected = Math.round(Math.min(100, Math.max(0, (elapsed / PLANNING_WINDOW_DAYS) * 100)));
  const gap = expected - m.progress;
  const health: Health = gap <= 10 ? "on-track" : gap <= 25 ? "at-risk" : "off-track";
  return { health, daysToStart, expected };
}

export function summarizeMission(m: Mission, tasks: Task[], today = todayISO()): MissionSummary {
  const mine = tasks.filter((t) => t.missionId === m.id);
  const { health, daysToStart } = healthOf(m, today);
  return {
    ...m,
    tasksTotal: mine.length,
    tasksDone: mine.filter((t) => t.status === "done").length,
    daysToStart,
    health,
  };
}

export function summarizeArea(a: ProjectArea, tasks: Task[]): AreaSummary {
  const mine = tasks.filter((t) => t.areaId === a.id);
  return {
    ...a,
    openTasks: mine.filter(isOpen).length,
    doneTasks: mine.length - mine.filter(isOpen).length,
  };
}

export function upcomingContent(items: ContentItem[], today = todayISO()) {
  return items
    .filter((c) => c.publishAt.slice(0, 10) >= today && c.status !== "published")
    .sort((a, b) => (a.publishAt < b.publishAt ? -1 : 1));
}
