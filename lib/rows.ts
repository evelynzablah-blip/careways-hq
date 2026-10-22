// Maps snake_case DB rows to the camelCase domain types in lib/types.ts.
// Enum columns are guarded by check constraints, so the casts are safe.

import "server-only";
import { format } from "date-fns";
import type { Tables } from "./database.types";
import type {
  AreaId,
  ContentItem,
  ContentStatus,
  ContentType,
  CountryCode,
  InboxItem,
  Mission,
  MissionStatus,
  Platform,
  Priority,
  ProjectArea,
  Task,
  TaskStatus,
} from "./types";

export const MISSION_COLS =
  "id, slug, name, country, status, date_start, date_end, date_precision, date_label, planning_start, progress, next_step, cover_image, city, lead, partners";
export const TASK_COLS =
  "id, title, status, priority, due, mission_id, area_id, owner, completed_at, waiting_who, waiting_since, notes";
export const CONTENT_COLS = "id, title, type, platform, publish_at, status, mission_id, owner";
export const AREA_COLS = "id, name, description, emoji, sort_order";
export const INBOX_COLS = "id, kind, text, created_at";

const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

export function toMission(r: Pick<Tables<"missions">, "id" | "slug" | "name" | "country" | "status" | "date_start" | "date_end" | "date_precision" | "date_label" | "planning_start" | "progress" | "next_step" | "cover_image" | "city" | "lead" | "partners">): Mission {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    country: r.country as CountryCode,
    status: r.status as MissionStatus,
    dates:
      r.date_start && r.date_end && r.date_precision
        ? { start: r.date_start, end: r.date_end, precision: r.date_precision as "day" | "month" }
        : null,
    dateLabel: r.date_label,
    planningStart: r.planning_start,
    progress: r.progress,
    nextStep: r.next_step,
    coverImage: r.cover_image,
    city: r.city,
    lead: r.lead,
    partners: r.partners,
  };
}

export function toTask(r: Pick<Tables<"tasks">, "id" | "title" | "status" | "priority" | "due" | "mission_id" | "area_id" | "owner" | "completed_at" | "waiting_who" | "waiting_since" | "notes">): Task {
  const t: Task = {
    id: r.id,
    title: r.title,
    status: r.status as TaskStatus,
    priority: r.priority as Priority,
    due: opt(r.due),
    missionId: opt(r.mission_id),
    areaId: opt(r.area_id) as AreaId | undefined,
    owner: opt(r.owner),
    completedAt: opt(r.completed_at),
    notes: opt(r.notes),
  };
  if (r.waiting_who && r.waiting_since) t.waitingOn = { who: r.waiting_who, since: r.waiting_since };
  return t;
}

export function toContent(r: Pick<Tables<"content">, "id" | "title" | "type" | "platform" | "publish_at" | "status" | "mission_id" | "owner">): ContentItem {
  return {
    id: r.id,
    title: r.title,
    type: r.type as ContentType,
    platform: r.platform as Platform,
    // `timestamp` (no tz) comes back as `YYYY-MM-DDTHH:mm:ss`.
    publishAt: r.publish_at.slice(0, 16),
    status: r.status as ContentStatus,
    missionId: opt(r.mission_id),
    owner: opt(r.owner),
  };
}

export function toArea(r: Pick<Tables<"areas">, "id" | "name" | "description" | "emoji" | "sort_order">): ProjectArea {
  return { id: r.id as AreaId, name: r.name, description: r.description, emoji: r.emoji, order: r.sort_order };
}

export function toInbox(r: Pick<Tables<"inbox_items">, "id" | "kind" | "text" | "created_at">): InboxItem {
  return {
    id: r.id,
    kind: r.kind as InboxItem["kind"],
    text: r.text,
    // timestamptz → local wall-clock `YYYY-MM-DDTHH:mm` (same clock as lib/dates.ts).
    createdAt: format(new Date(r.created_at), "yyyy-MM-dd'T'HH:mm"),
  };
}
