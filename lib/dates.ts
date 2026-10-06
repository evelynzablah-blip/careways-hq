import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { ISODate } from "./types";

export function toISODate(d: Date): ISODate {
  return format(d, "yyyy-MM-dd");
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

/** Today shifted by `days` (negative = past). Used to seed mock data relative to now. */
export function relISO(days: number, now: Date = new Date()): ISODate {
  return toISODate(addDays(now, days));
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from));
}

export function formatDue(due: ISODate, today: ISODate = todayISO()): string {
  const diff = daysBetween(today, due);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff < 7) return format(parseISO(due), "EEEE");
  return format(parseISO(due), "MMM d");
}

export function formatShort(date: ISODate | string): string {
  return format(parseISO(date), "MMM d");
}

export function formatTime(datetime: string): string {
  return format(parseISO(datetime), "h:mm a");
}

export function formatLongDate(now: Date = new Date()): string {
  return format(now, "EEEE, MMMM d, yyyy");
}
