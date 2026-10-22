"use server";

// Write layer (Server Actions) on Supabase. Same contract as before; UI code
// stays the same. Every action checks the session (lib/auth.ts) first.

import { revalidatePath } from "next/cache";
import { requireSession } from "./auth";
import { relISO } from "./dates";
import {
  CONTENT_STATUS,
  PLATFORM,
  PRIORITY,
  TASK_STATUS,
} from "./meta";
import { CONTENT_COLS, INBOX_COLS, TASK_COLS, toContent, toInbox, toTask } from "./rows";
import { must, supabase } from "./supabase";
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

/** Returns `id` if that mission exists, else undefined. */
async function existingMission(id: unknown): Promise<string | undefined> {
  if (typeof id !== "string" || !id) return undefined;
  const res = await supabase().from("missions").select("id").eq("id", id).maybeSingle();
  if (res.error) throw new Error(`Supabase missions: ${res.error.message}`);
  return res.data?.id;
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  await requireSession();
  if (!(status in TASK_STATUS)) throw new Error("Invalid status");
  const db = supabase();
  const updated = must(
    await db
      .from("tasks")
      .update({ status, completed_at: status === "done" ? relISO(0) : null })
      .eq("id", id)
      .select("id"),
    "update task",
  );
  if (updated.length === 0) throw new Error("Task not found");
  if (status === "waiting") {
    // Only when nobody is set yet, like before (keeps an existing waitingOn).
    const res = await db
      .from("tasks")
      .update({ waiting_who: "Someone", waiting_since: relISO(0) })
      .eq("id", id)
      .is("waiting_who", null);
    if (res.error) throw new Error(`Supabase update task: ${res.error.message}`);
  }
  revalidatePath("/", "layout");
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
  await requireSession();
  const title = clean(input.title);
  if (!title) throw new Error("Title is required");
  const missionId = await existingMission(input.missionId);
  const status: TaskStatus = input.status && input.status in TASK_STATUS ? input.status : "todo";
  const row = must(
    await supabase()
      .from("tasks")
      .insert({
        title,
        status,
        priority: input.priority && input.priority in PRIORITY ? input.priority : "medium",
        due: isISODate(input.due) ? input.due : null,
        mission_id: missionId ?? null,
        area_id: input.areaId && AREA_IDS.includes(input.areaId) ? input.areaId : missionId ? "missions" : null,
        owner: "Evelyn",
        ...(status === "waiting" ? { waiting_who: clean(input.waitingWho, 60) || "Someone", waiting_since: relISO(0) } : {}),
      })
      .select(TASK_COLS)
      .single(),
    "create task",
  );
  revalidatePath("/", "layout");
  return toTask(row);
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
  await requireSession();
  const title = clean(input.title);
  if (!title) throw new Error("Title is required");
  const type: ContentType = input.type === "newsletter" ? "newsletter" : "social-post";
  const row = must(
    await supabase()
      .from("content")
      .insert({
        title,
        type,
        platform: type === "newsletter" ? "email" : input.platform && input.platform in PLATFORM ? input.platform : "instagram",
        publish_at: `${isISODate(input.date) ? input.date : relISO(7)}T09:00`,
        status: input.status && input.status in CONTENT_STATUS ? input.status : "ideation",
        mission_id: (await existingMission(input.missionId)) ?? null,
        owner: "Evelyn",
      })
      .select(CONTENT_COLS)
      .single(),
    "create content",
  );
  revalidatePath("/", "layout");
  return toContent(row);
}

export async function createInboxItem(input: { kind: InboxItem["kind"]; text: string }): Promise<InboxItem> {
  await requireSession();
  const text = clean(input.text, 500);
  if (!text) throw new Error("Text is required");
  const row = must(
    await supabase()
      .from("inbox_items")
      .insert({ kind: input.kind === "contact" ? "contact" : "note", text })
      .select(INBOX_COLS)
      .single(),
    "create inbox item",
  );
  revalidatePath("/", "layout");
  return toInbox(row);
}
