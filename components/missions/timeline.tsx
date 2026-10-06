"use client";

// Refs: Airtable timeline (thumbnail + "Status · %" inside the bar, today line),
// Plane (zoom toggle + Today button).

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addMonths, differenceInCalendarDays, format, parseISO, startOfMonth } from "date-fns";
import { CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/dates";
import { MISSION_STATUS } from "@/lib/meta";
import type { MissionSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Flag } from "@/components/cw/platform-icon";
import { HealthIndicator, StatusPill } from "@/components/cw/pills";

const ZOOM = { month: 7, quarter: 2.6, year: 1.15 } as const; // px per day
type Zoom = keyof typeof ZOOM;
const LABEL_W = 220;
const ROW_H = 64;

export function Timeline({ missions }: { missions: MissionSummary[] }) {
  const [zoom, setZoom] = useState<Zoom>("quarter");
  const scroller = useRef<HTMLDivElement>(null);
  const today = parseISO(todayISO());

  const dated = missions.filter((m) => m.dates).sort((a, b) => (a.dates!.start < b.dates!.start ? -1 : 1));
  const undated = missions.filter((m) => !m.dates);

  const first = [...dated.map((m) => parseISO(m.planningStart)), today].reduce((a, b) => (a < b ? a : b));
  const last = [...dated.map((m) => parseISO(m.dates!.end)), today].reduce((a, b) => (a > b ? a : b));
  const start = startOfMonth(addMonths(first, -1));
  const end = startOfMonth(addMonths(last, 2));
  const ppd = ZOOM[zoom];
  const x = (d: Date) => differenceInCalendarDays(d, start) * ppd;
  const width = x(end);

  const months: Date[] = [];
  for (let d = start; d < end; d = addMonths(d, 1)) months.push(d);

  function scrollToToday(behavior: ScrollBehavior = "smooth") {
    const el = scroller.current;
    if (el) el.scrollTo({ left: Math.max(0, x(today) - (el.clientWidth - LABEL_W) / 3), behavior });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- re-center when zoom changes
  useEffect(() => scrollToToday("instant"), [zoom]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" variant="outline" size="sm" value={zoom} onValueChange={(v) => v && setZoom(v as Zoom)} aria-label="Zoom">
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="quarter">Quarter</ToggleGroupItem>
          <ToggleGroupItem value="year">Year</ToggleGroupItem>
        </ToggleGroup>
        <Button variant="outline" size="sm" onClick={() => scrollToToday()}>
          Today
        </Button>
        <p className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-sm bg-muted ring-1 ring-border" aria-hidden /> Planning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-sm bg-primary" aria-hidden /> In the field
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-sm border border-dashed border-primary" aria-hidden /> Approx. dates
          </span>
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <div ref={scroller} className="relative overflow-x-auto">
          <div className="relative" style={{ width: LABEL_W + width }}>
            {/* Month header */}
            <div className="sticky top-0 z-10 flex border-b bg-card text-xs text-muted-foreground">
              <div className="sticky left-0 z-20 shrink-0 border-r bg-card px-4 py-2 font-medium" style={{ width: LABEL_W }}>
                Mission
              </div>
              <div className="relative h-9 shrink-0" style={{ width }}>
                <span className="absolute top-1.5 z-[1] -translate-x-1/2 rounded bg-earth px-1.5 py-0.5 text-[0.65rem] font-semibold text-white" style={{ left: x(today) }}>
                  Today
                </span>
                {months.map((m) => (
                  <div key={m.toISOString()} className="absolute inset-y-0 border-l px-1.5 py-2 whitespace-nowrap" style={{ left: x(m) }}>
                    {zoom === "year" ? format(m, "MMM") : format(m, "MMM yyyy")}
                    {zoom === "year" && m.getMonth() === 0 && <span className="ml-1 font-semibold text-foreground">{format(m, "yyyy")}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <ul>
              {dated.map((m) => {
                const s = parseISO(m.dates!.start);
                const e = parseISO(m.dates!.end);
                const p = parseISO(m.planningStart);
                const tone = MISSION_STATUS[m.status].tone;
                const barLeft = x(p);
                const barW = Math.max(x(e) - x(p) + ppd, 24);
                const fieldLeft = x(s) - barLeft;
                const fieldW = Math.max((differenceInCalendarDays(e, s) + 1) * ppd, 6);
                return (
                  <li key={m.id} className="flex border-b last:border-b-0" style={{ height: ROW_H }}>
                    <div className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r bg-card px-4" style={{ width: LABEL_W }}>
                      <Flag country={m.country} className="text-lg" />
                      <div className="min-w-0">
                        <Link href={`/missions/${m.slug}`} className="block truncate text-sm font-medium hover:underline">
                          {m.name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{m.dateLabel}</p>
                      </div>
                    </div>
                    <div className="relative shrink-0" style={{ width }}>
                      {months.map((mo) => (
                        <span key={mo.toISOString()} className="absolute inset-y-0 border-l border-border/50" style={{ left: x(mo) }} aria-hidden />
                      ))}
                      <Link
                        href={`/missions/${m.slug}`}
                        data-tone={tone}
                        className="group absolute top-1/2 z-[2] flex h-10 -translate-y-1/2 items-center rounded-lg border border-(--tone-border) bg-(--tone-bg) text-(--tone-fg) shadow-xs transition hover:shadow-md"
                        style={{ left: barLeft, width: barW }}
                        aria-label={`${m.name}: ${MISSION_STATUS[m.status].label}, ${m.progress}% — ${m.dateLabel}`}
                      >
                        <span
                          className={cn(
                            "absolute inset-y-0 rounded-md bg-(--tone-dot)",
                            m.dates!.precision === "month" && "border-2 border-dashed border-(--tone-fg) bg-(--tone-dot)/60",
                          )}
                          style={{ left: fieldLeft, width: fieldW }}
                          aria-hidden
                        />
                        <span className="sticky flex min-w-0 items-center gap-2 px-1.5" style={{ left: LABEL_W + 6 }}>
                          <Image src={m.coverImage} alt="" width={28} height={28} className="size-7 shrink-0 rounded-md object-cover" />
                          <span className="truncate text-xs font-semibold whitespace-nowrap">
                            {m.name} · {MISSION_STATUS[m.status].label} · {m.progress}%
                          </span>
                        </span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Today line */}
            <div className="pointer-events-none absolute top-9 bottom-0 z-[1] w-0.5 bg-earth" style={{ left: LABEL_W + x(today) }} aria-hidden />
          </div>
        </div>
      </div>

      {undated.length > 0 && (
        <section aria-labelledby="undated-h" className="rounded-2xl border border-dashed bg-card/60 p-4">
          <h2 id="undated-h" className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CalendarX className="size-4 text-muted-foreground" aria-hidden /> Unscheduled
            <span className="rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">{undated.length}</span>
          </h2>
          <ul className="flex flex-wrap gap-3">
            {undated.map((m) => (
              <li key={m.id}>
                <Link href={`/missions/${m.slug}`} className="flex items-center gap-3 rounded-xl border bg-card p-2 pr-4 transition hover:shadow-md">
                  <Image src={m.coverImage} alt="" width={44} height={44} className="size-11 rounded-lg object-cover" />
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <Flag country={m.country} /> {m.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusPill kind="mission" status={m.status} />
                      <span className="text-xs text-muted-foreground tabular-nums">{m.progress}%</span>
                      <HealthIndicator health={m.health} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
