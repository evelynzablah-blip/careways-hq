// Single source of truth for labels, tones (see [data-tone] in globals.css) and
// ordering of every enum. Components never pick colors themselves.

import type {
  AreaId,
  ContentStatus,
  ContentType,
  CountryCode,
  Health,
  MissionStatus,
  Platform,
  Priority,
  TaskStatus,
} from "./types";

export type Tone =
  | "red"
  | "amber"
  | "gray"
  | "green"
  | "blue"
  | "purple"
  | "yellow"
  | "brown"
  | "pink"
  | "orange"
  | "lilac"
  | "peach"
  | "mint";

interface Meta {
  label: string;
  tone: Tone;
}

export const PRIORITY: Record<Priority, Meta & { rank: number }> = {
  high: { label: "High", tone: "red", rank: 0 },
  medium: { label: "Medium", tone: "amber", rank: 1 },
  low: { label: "Low", tone: "gray", rank: 2 },
};
export const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];

export const MISSION_STATUS: Record<MissionStatus, Meta> = {
  development: { label: "Development", tone: "purple" },
  "early-planning": { label: "Early Planning", tone: "yellow" },
  planning: { label: "Planning", tone: "blue" },
  confirmed: { label: "Confirmed", tone: "green" },
  "in-field": { label: "In Field", tone: "orange" },
  completed: { label: "Completed", tone: "gray" },
};
export const MISSION_STATUS_ORDER = Object.keys(MISSION_STATUS) as MissionStatus[];

export const CONTENT_STATUS: Record<ContentStatus, Meta> = {
  ideation: { label: "Ideation", tone: "gray" },
  writing: { label: "Writing", tone: "yellow" },
  drafting: { label: "Drafting", tone: "blue" },
  review: { label: "Review", tone: "purple" },
  scheduled: { label: "Scheduled", tone: "green" },
  published: { label: "Published", tone: "brown" },
};
export const CONTENT_STATUS_ORDER = Object.keys(CONTENT_STATUS) as ContentStatus[];

export const TASK_STATUS: Record<TaskStatus, Meta> = {
  todo: { label: "To do", tone: "gray" },
  doing: { label: "Doing", tone: "blue" },
  waiting: { label: "Waiting", tone: "orange" },
  done: { label: "Done", tone: "green" },
};
export const TASK_STATUS_ORDER = Object.keys(TASK_STATUS) as TaskStatus[];

export const HEALTH: Record<Health, Meta & { hint: string }> = {
  "on-track": { label: "On track", tone: "green", hint: "Progress is at or ahead of where it should be for the time left." },
  "at-risk": { label: "At risk", tone: "amber", hint: "Progress is 10–25 points behind the expected pace." },
  "off-track": { label: "Off track", tone: "red", hint: "Progress is more than 25 points behind the expected pace." },
  unscheduled: { label: "No date", tone: "gray", hint: "Set mission dates to track health." },
};

export const CONTENT_TYPE: Record<ContentType, { label: string }> = {
  "social-post": { label: "Social Post" },
  newsletter: { label: "Newsletter" },
};

export const PLATFORM: Record<Platform, Meta> = {
  instagram: { label: "Instagram", tone: "pink" },
  linkedin: { label: "LinkedIn", tone: "blue" },
  email: { label: "Email", tone: "gray" },
  facebook: { label: "Facebook", tone: "purple" },
};
export const PLATFORM_ORDER = Object.keys(PLATFORM) as Platform[];

export const AREA_TONE: Record<AreaId, Tone> = {
  missions: "pink",
  programs: "green",
  communications: "orange",
  partners: "blue",
  fundraising: "lilac",
  operations: "peach",
  documents: "gray",
  ideas: "mint",
};

export const COUNTRY: Record<CountryCode, { name: string; flag: string }> = {
  GT: { name: "Guatemala", flag: "🇬🇹" },
  SV: { name: "El Salvador", flag: "🇸🇻" },
  CO: { name: "Colombia", flag: "🇨🇴" },
  EC: { name: "Ecuador", flag: "🇪🇨" },
};
