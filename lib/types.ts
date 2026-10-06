// Domain types. Field names mirror the Notion databases (All Tasks, Missions DB,
// Content, Project Areas) so lib/queries.ts can later map Notion rows 1:1.

export type Priority = "high" | "medium" | "low";

export type TaskStatus = "todo" | "doing" | "waiting" | "done";

export type MissionStatus =
  | "development"
  | "early-planning"
  | "planning"
  | "confirmed"
  | "in-field"
  | "completed";

export type ContentStatus =
  | "ideation"
  | "writing"
  | "drafting"
  | "review"
  | "scheduled"
  | "published";

export type ContentType = "social-post" | "newsletter";

export type Platform = "instagram" | "linkedin" | "email" | "facebook";

export type AreaId =
  | "missions"
  | "programs"
  | "communications"
  | "partners"
  | "fundraising"
  | "operations"
  | "documents"
  | "ideas";

export type CountryCode = "GT" | "SV" | "CO" | "EC";

/** ISO date `YYYY-MM-DD` (no time zone). */
export type ISODate = string;

export interface MissionDates {
  start: ISODate;
  end: ISODate;
  /** "month" when only the month is known (e.g. "June") — drawn as approximate. */
  precision: "day" | "month";
}

export interface Mission {
  id: string;
  slug: string;
  name: string;
  country: CountryCode;
  status: MissionStatus;
  /** null = TBD */
  dates: MissionDates | null;
  /** Human label shown on cards, e.g. "Jan 30 – Feb 6". */
  dateLabel: string;
  /** When planning started — left edge of the timeline bar. */
  planningStart: ISODate;
  /** Notion "Progress %" formula output (0–100). */
  progress: number;
  nextStep: string;
  coverImage: string;
  city: string;
  lead: string;
  partners: string[];
}

export interface WaitingOn {
  who: string;
  since: ISODate;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  due?: ISODate;
  missionId?: string;
  areaId?: AreaId;
  owner?: string;
  waitingOn?: WaitingOn;
  completedAt?: ISODate;
}

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  platform: Platform;
  /** ISO datetime `YYYY-MM-DDTHH:mm` (local). */
  publishAt: string;
  status: ContentStatus;
  missionId?: string;
  owner?: string;
}

export interface ProjectArea {
  id: AreaId;
  name: string;
  description: string;
  emoji: string;
  order: number;
}

export interface InboxItem {
  id: string;
  kind: "note" | "contact";
  text: string;
  createdAt: string;
}

// ---- Derived (computed in lib/derive.ts, never stored) ----

export type Health = "on-track" | "at-risk" | "off-track" | "unscheduled";

export interface MissionSummary extends Mission {
  tasksDone: number;
  tasksTotal: number;
  daysToStart: number | null;
  health: Health;
}

export interface AreaSummary extends ProjectArea {
  openTasks: number;
  doneTasks: number;
}

export type TaskBucket = "overdue" | "today" | "week" | "waiting";
