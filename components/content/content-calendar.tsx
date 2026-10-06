"use client";

// Refs: Buffer (List ⇄ Calendar toggle, channel filter, platform icon + time on
// every entry), Adobe Express (status filter with colored dots).

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime, todayISO, toISODate } from "@/lib/dates";
import { CONTENT_STATUS, CONTENT_STATUS_ORDER, CONTENT_TYPE, PLATFORM, PLATFORM_ORDER } from "@/lib/meta";
import type { ContentItem, ContentStatus, ContentType, Platform } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FilterMenu } from "@/components/cw/filter-menu";
import { PlatformIcon } from "@/components/cw/platform-icon";
import { EmptyState } from "@/components/cw/states";
import { useQuickAdd } from "@/components/quick-add/quick-add-provider";
import { ContentList } from "./content-list";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Chip({ item }: { item: ContentItem }) {
  const status = CONTENT_STATUS[item.status];
  return (
    <li
      data-tone={status.tone}
      title={`${item.title} · ${PLATFORM[item.platform].label} · ${status.label}`}
      className="flex items-center gap-1 rounded-md border border-(--tone-border) bg-(--tone-bg) px-1.5 py-1 text-[0.7rem] leading-tight text-(--tone-fg)"
    >
      <PlatformIcon platform={item.platform} className="size-3" />
      <span className="shrink-0 font-semibold tabular-nums">{formatTime(item.publishAt).replace(":00", "")}</span>
      <span className="min-w-0 truncate text-foreground/85">{item.title}</span>
      <span className="sr-only">, {status.label}</span>
    </li>
  );
}

export function ContentCalendar({ items, initialView = "calendar" }: { items: ContentItem[]; initialView?: "calendar" | "list" }) {
  const { open } = useQuickAdd();
  const today = todayISO();
  const [view, setView] = useState<"calendar" | "list">(initialView);
  const [month, setMonth] = useState(() => startOfMonth(parseISO(today)));
  const [types, setTypes] = useState<ContentType[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [statuses, setStatuses] = useState<ContentStatus[]>([]);

  const filtered = useMemo(
    () =>
      items.filter(
        (c) =>
          (!types.length || types.includes(c.type)) &&
          (!platforms.length || platforms.includes(c.platform)) &&
          (!statuses.length || statuses.includes(c.status)),
      ),
    [items, types, platforms, statuses],
  );

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const byDay = new Map<string, ContentItem[]>();
  for (const c of filtered) {
    const key = c.publishAt.slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), c]);
  }
  const inMonth = filtered.filter((c) => isSameMonth(parseISO(c.publishAt), month));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v as typeof view)} aria-label="View">
          <ToggleGroupItem value="calendar" aria-label="Calendar view">
            <CalendarDays aria-hidden /> Calendar
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List aria-hidden /> List
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
        <FilterMenu label="Type" options={(Object.keys(CONTENT_TYPE) as ContentType[]).map((t) => ({ value: t, label: CONTENT_TYPE[t].label }))} selected={types} onChange={setTypes} />
        <FilterMenu
          label="Platform"
          options={PLATFORM_ORDER.map((p) => ({ value: p, label: PLATFORM[p].label, icon: <PlatformIcon platform={p} /> }))}
          selected={platforms}
          onChange={setPlatforms}
        />
        <FilterMenu label="Status" options={CONTENT_STATUS_ORDER.map((s) => ({ value: s, label: CONTENT_STATUS[s].label, tone: CONTENT_STATUS[s].tone }))} selected={statuses} onChange={setStatuses} />
        <Button size="sm" className="ml-auto" onClick={() => open("social-post")}>
          <Plus aria-hidden /> New post
        </Button>
      </div>

      {view === "list" ? (
        <ContentList items={filtered} />
      ) : (
        <section aria-label={`Content calendar, ${format(month, "MMMM yyyy")}`} className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <h2 className="font-heading text-xl font-semibold" aria-live="polite">
              {format(month, "MMMM yyyy")}
            </h2>
            <span className="text-sm text-muted-foreground">· {inMonth.length} pieces</span>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month">
                <ChevronLeft aria-hidden />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(parseISO(today)))}>
                Today
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month">
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </div>

          {/* Desktop/tablet: month grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-7 border-b bg-muted/40 text-xs font-medium text-muted-foreground">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-2 py-1.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((d) => {
                const key = toISODate(d);
                const list = byDay.get(key) ?? [];
                const isToday = key === today;
                const outside = !isSameMonth(d, month);
                return (
                  <div
                    key={key}
                    className={cn("group relative min-h-28 border-r border-b p-1.5 [&:nth-child(7n)]:border-r-0", outside && "bg-muted/30")}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full text-xs tabular-nums",
                          outside && "text-muted-foreground/60",
                          isToday && "bg-primary font-semibold text-primary-foreground",
                        )}
                        aria-current={isToday ? "date" : undefined}
                      >
                        {format(d, "d")}
                      </span>
                      <button
                        type="button"
                        onClick={() => open("social-post", { due: key })}
                        className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted focus-visible:opacity-100"
                        aria-label={`Add post on ${format(d, "MMMM d")}`}
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    {list.length > 0 && (
                      <ul className="flex flex-col gap-1">
                        {list.map((c) => (
                          <Chip key={c.id} item={c} />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: agenda for the month */}
          <div className="md:hidden">
            {inMonth.length === 0 ? (
              <EmptyState emoji="🗓️" title="Nothing this month" className="m-4" />
            ) : (
              <ol className="divide-y">
                {[...new Set(inMonth.map((c) => c.publishAt.slice(0, 10)))].map((day) => (
                  <li key={day} className="flex gap-3 px-4 py-3">
                    <div className={cn("w-10 shrink-0 text-center", day === today && "text-primary")}>
                      <p className="text-[0.7rem] font-medium uppercase">{format(parseISO(day), "EEE")}</p>
                      <p className="font-heading text-xl font-semibold">{format(parseISO(day), "d")}</p>
                    </div>
                    <ul className="flex min-w-0 flex-1 flex-col gap-1">
                      {byDay.get(day)!.map((c) => (
                        <Chip key={c.id} item={c} />
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
