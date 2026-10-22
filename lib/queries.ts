// Read layer. Components only ever call these async functions; all data comes
// from Supabase (server-only client, see lib/supabase.ts).

import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import {
  bucketTasks,
  summarizeArea,
  summarizeMission,
  upcomingContent,
} from "./derive";
import { todayISO } from "./dates";
import {
  AREA_COLS,
  CONTENT_COLS,
  INBOX_COLS,
  MISSION_COLS,
  TASK_COLS,
  toArea,
  toContent,
  toInbox,
  toMission,
  toTask,
} from "./rows";
import { must, supabase } from "./supabase";
import type { AreaId, CountryCode, Task, TaskStatus } from "./types";

/**
 * Marks the page dynamic and simulates I/O to preview widget states:
 *   MOCK_LATENCY_MS=800 npm run dev        → loading skeletons
 *   MOCK_FAIL=missions,content npm run dev → per-widget error boundaries
 */
async function io(name: string) {
  await connection();
  const ms = Number(process.env.MOCK_LATENCY_MS ?? 0);
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  if (process.env.MOCK_FAIL?.split(",").includes(name)) throw new Error(`Simulated failure: ${name}`);
}

/** Every task, in insertion order. cache(): missions, areas and buckets share one read per request. */
const allTasks = cache(async () => {
  const rows = must(await supabase().from("tasks").select(TASK_COLS).order("seq"), "tasks");
  return rows.map(toTask);
});

export const getMissions = cache(async () => {
  await io("missions");
  const [rows, tasks] = await Promise.all([
    supabase().from("missions").select(MISSION_COLS).order("seq"),
    allTasks(),
  ]);
  return must(rows, "missions").map((r) => summarizeMission(toMission(r), tasks));
});

export async function getMission(slug: string) {
  await io("missions");
  const [res, tasks] = await Promise.all([
    supabase().from("missions").select(MISSION_COLS).eq("slug", slug).maybeSingle(),
    allTasks(),
  ]);
  if (res.error) throw new Error(`Supabase mission: ${res.error.message}`);
  return res.data ? summarizeMission(toMission(res.data), tasks) : null;
}

export interface TaskFilter {
  missionId?: string;
  areaId?: AreaId;
  status?: TaskStatus | "open";
}

export async function getTasks(filter: TaskFilter = {}): Promise<Task[]> {
  await io("tasks");
  let q = supabase().from("tasks").select(TASK_COLS);
  if (filter.missionId) q = q.eq("mission_id", filter.missionId);
  if (filter.areaId) q = q.eq("area_id", filter.areaId);
  if (filter.status) q = filter.status === "open" ? q.neq("status", "done") : q.eq("status", filter.status);
  return must(await q.order("seq"), "tasks").map(toTask);
}

/** cache(): the hero chips, overdue banner and task columns share one read per request. */
export const getTaskBuckets = cache(async () => {
  await io("tasks");
  return bucketTasks(await allTasks());
});

export async function getContent() {
  await io("content");
  const rows = must(
    await supabase().from("content").select(CONTENT_COLS).order("publish_at").order("seq"),
    "content",
  );
  return rows.map(toContent);
}

export async function getUpcomingContent(limit = 5) {
  await io("content");
  const rows = must(
    await supabase()
      .from("content")
      .select(CONTENT_COLS)
      .gte("publish_at", todayISO())
      .neq("status", "published")
      .order("publish_at")
      .order("seq"),
    "content",
  );
  return upcomingContent(rows.map(toContent)).slice(0, limit);
}

export async function getAreas() {
  await io("areas");
  const [rows, tasks] = await Promise.all([
    supabase().from("areas").select(AREA_COLS).order("sort_order"),
    allTasks(),
  ]);
  return must(rows, "areas").map((r) => summarizeArea(toArea(r), tasks));
}

export async function getArea(id: string) {
  await io("areas");
  const [res, tasks] = await Promise.all([
    supabase().from("areas").select(AREA_COLS).eq("id", id).maybeSingle(),
    allTasks(),
  ]);
  if (res.error) throw new Error(`Supabase area: ${res.error.message}`);
  return res.data ? summarizeArea(toArea(res.data), tasks) : null;
}

export async function getInbox() {
  await io("inbox");
  const rows = must(
    await supabase().from("inbox_items").select(INBOX_COLS).order("created_at", { ascending: false }),
    "inbox",
  );
  return rows.map(toInbox);
}

/** Lightweight lookups for client pickers (Quick Add, filters). */
export const getPickers = cache(async () => {
  await io("pickers");
  const [missions, areas] = await Promise.all([
    supabase().from("missions").select("id, name, slug, country").order("seq"),
    supabase().from("areas").select("id, name, emoji").order("sort_order"),
  ]);
  return {
    missions: must(missions, "missions").map((m) => ({ ...m, country: m.country as CountryCode })),
    areas: must(areas, "areas").map((a) => ({ ...a, id: a.id as AreaId })),
  };
});
export type Pickers = Awaited<ReturnType<typeof getPickers>>;
