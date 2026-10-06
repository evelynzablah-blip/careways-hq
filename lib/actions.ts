"use server";

// Write layer (Server Actions). Same contract as queries.ts: swap the store
// calls for a DB / Notion client later; UI code stays the same.
// NOTE: no auth yet — add a session check here before exposing beyond localhost.

import { refresh } from "next/cache";
import { relISO } from "./dates";
import {
  CONTENT_STATUS,
  PLATFORM,
  PRIORITY,
  TASK_STATUS,
} from "./meta";
import { db, nextId } from "./store";
import type {
  AreaId,
  ContentItem,
  ContentStatus,
  ContentType,
  InboxItem,
  Platform,
  Priority,
  Task,
  TaskStatus,
} from "./types";

const AREA_IDS: AreaId[] = ["missions", "programs", "communications", "partners", "fundraising", "operations", "documents", "ideas"];
const isISODate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const clean = (s: unknown, max = 200) => (typeof s === "string" ? s.trim().slice(0, max) : "");

export async function setTaskStatus(id: string, status: TaskStatus) {
  if (!(status in TASK_STATUS)) throw new Error("Invalid status");
  const t = db().tasks.find((x) => x.id === id);
  if (!t) throw new Error("Task not found");
  t.status = status;
  t.completedAt = status === "done" ? relISO(0) : undefined;
  if (status === "waiting" && !t.waitingOn) t.waitingOn = { who: "Someone", since: relISO(0) };
  refresh();
}

export interface NewTask {
  title: string;
  priority?: Priority;
  due?: string;
  missionId?: string;
  areaId?: AreaId;
  status?: TaskStatus;
  /** Who we're waiting on (only for status "waiting"). */
  waitingWho?: string;
}

export async function createTask(input: NewTask): Promise<Task> {
  const title = clean(input.title);
  if (!title) throw new Error("Title is required");
  const store = db();
  const missionId = store.missions.some((m) => m.id === input.missionId) ? input.missionId : undefined;
  const task: Task = {
    id: nextId("t"),
    title,
    status: input.status && input.status in TASK_STATUS ? input.status : "todo",
    priority: input.priority && input.priority in PRIORITY ? input.priority : "medium",
    due: isISODate(input.due) ? input.due : undefined,
    missionId,
    areaId: input.areaId && AREA_IDS.includes(input.areaId) ? input.areaId : missionId ? "missions" : undefined,
    owner: "Evelyn",
  };
  if (task.status === "waiting") task.waitingOn = { who: clean(input.waitingWho, 60) || "Someone", since: relISO(0) };
  store.tasks.push(task);
  refresh();
  return task;
}

export interface NewContent {
  title: string;
  type: ContentType;
  platform?: Platform;
  date?: string;
  status?: ContentStatus;
  missionId?: string;
}

export async function createContent(input: NewContent): Promise<ContentItem> {
  const title = clean(input.title);
  if (!title) throw new Error("Title is required");
  const type: ContentType = input.type === "newsletter" ? "newsletter" : "social-post";
  const store = db();
  const item: ContentItem = {
    id: nextId("c"),
    title,
    type,
    platform: type === "newsletter" ? "email" : input.platform && input.platform in PLATFORM ? input.platform : "instagram",
    publishAt: `${isISODate(input.date) ? input.date : relISO(7)}T09:00`,
    status: input.status && input.status in CONTENT_STATUS ? input.status : "ideation",
    missionId: store.missions.some((m) => m.id === input.missionId) ? input.missionId : undefined,
    owner: "Evelyn",
  };
  store.content.push(item);
  refresh();
  return item;
}

export async function createInboxItem(input: { kind: InboxItem["kind"]; text: string }): Promise<InboxItem> {
  const text = clean(input.text, 500);
  if (!text) throw new Error("Text is required");
  const item: InboxItem = {
    id: nextId("i"),
    kind: input.kind === "contact" ? "contact" : "note",
    text,
    createdAt: new Date().toISOString().slice(0, 16),
  };
  db().inbox.push(item);
  refresh();
  return item;
}
