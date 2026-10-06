// Read layer. Components only ever call these async functions, so swapping the
// mock store for a database or the Notion API happens here, not in the UI.

import { connection } from "next/server";
import {
  bucketTasks,
  isOpen,
  summarizeArea,
  summarizeMission,
  upcomingContent,
} from "./derive";
import { db } from "./store";
import type { AreaId, Task, TaskStatus } from "./types";

/** Optional artificial latency to preview loading skeletons: MOCK_LATENCY_MS=800 npm run dev */
async function io() {
  await connection();
  const ms = Number(process.env.MOCK_LATENCY_MS ?? 0);
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
}

export async function getMissions() {
  await io();
  const { missions, tasks } = db();
  return missions.map((m) => summarizeMission(m, tasks));
}

export async function getMission(slug: string) {
  await io();
  const { missions, tasks } = db();
  const m = missions.find((x) => x.slug === slug);
  return m ? summarizeMission(m, tasks) : null;
}

export interface TaskFilter {
  missionId?: string;
  areaId?: AreaId;
  status?: TaskStatus | "open";
}

export async function getTasks(filter: TaskFilter = {}): Promise<Task[]> {
  await io();
  return db().tasks.filter(
    (t) =>
      (!filter.missionId || t.missionId === filter.missionId) &&
      (!filter.areaId || t.areaId === filter.areaId) &&
      (!filter.status || (filter.status === "open" ? isOpen(t) : t.status === filter.status)),
  );
}

export async function getTaskBuckets() {
  await io();
  return bucketTasks(db().tasks);
}

export async function getContent() {
  await io();
  return [...db().content].sort((a, b) => (a.publishAt < b.publishAt ? -1 : 1));
}

export async function getUpcomingContent(limit = 5) {
  await io();
  return upcomingContent(db().content).slice(0, limit);
}

export async function getAreas() {
  await io();
  const { areas, tasks } = db();
  return [...areas].sort((a, b) => a.order - b.order).map((a) => summarizeArea(a, tasks));
}

export async function getArea(id: string) {
  await io();
  const { areas, tasks } = db();
  const a = areas.find((x) => x.id === id);
  return a ? summarizeArea(a, tasks) : null;
}

export async function getInbox() {
  await io();
  return [...db().inbox].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Lightweight lookups for client pickers (Quick Add, filters). */
export async function getPickers() {
  await io();
  const { missions, areas } = db();
  return {
    missions: missions.map(({ id, name, slug, country }) => ({ id, name, slug, country })),
    areas: areas.map(({ id, name, emoji }) => ({ id, name, emoji })),
  };
}
export type Pickers = Awaited<ReturnType<typeof getPickers>>;
