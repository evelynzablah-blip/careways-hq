import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { MISSION_STATUS } from "@/lib/meta";
import type { MissionSummary } from "@/lib/types";
import { Flag } from "@/components/cw/platform-icon";
import { HealthIndicator, ProgressBar, StatusPill } from "@/components/cw/pills";

// Refs: Todoist Projects (separate Health + Progress), hover lift + photo zoom.
export function MissionCard({ mission: m, className, priority }: { mission: MissionSummary; className?: string; priority?: boolean }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <Image
          src={m.coverImage}
          alt={`${m.city}, ${m.name.split(" ")[0]}`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 85vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
        <StatusPill kind="mission" status={m.status} className="absolute top-2.5 left-2.5 shadow-sm" />
        <span className="absolute right-2.5 bottom-2 flex items-center gap-1 text-xs font-medium text-white">
          <CalendarDays className="size-3.5" aria-hidden />
          {m.dateLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="flex items-center gap-2 font-heading text-lg leading-tight font-semibold">
          <Flag country={m.country} className="text-xl" />
          <Link href={`/missions/${m.slug}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {m.name}
          </Link>
        </h3>

        <div className="flex flex-col gap-1.5">
          <ProgressBar value={m.progress} label={`${m.name} progress`} tone={MISSION_STATUS[m.status].tone} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {m.tasksDone}/{m.tasksTotal} tasks
            </span>
            <span>{m.daysToStart !== null ? `${m.daysToStart} days to go` : "Dates TBD"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <span className="text-xs text-muted-foreground">Health</span>
          <HealthIndicator health={m.health} />
        </div>

        <p className="mt-auto flex items-start gap-1.5 rounded-lg bg-muted/70 px-2.5 py-2 text-xs leading-snug">
          <ArrowRight className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            <span className="font-semibold">Next:</span> {m.nextStep}
          </span>
        </p>
      </div>
    </article>
  );
}

/** Grid on desktop, horizontal snap carousel on mobile. */
export function MissionCarousel({ missions }: { missions: MissionSummary[] }) {
  return (
    <ul
      aria-label="Missions"
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4"
    >
      {missions.map((m, i) => (
        <li key={m.id} className="flex w-[82%] shrink-0 snap-start sm:w-[60%] md:w-auto">
          <MissionCard mission={m} priority={i < 2} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

export function MissionCarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-2 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="w-[82%] shrink-0 overflow-hidden rounded-2xl border bg-card md:w-auto">
          <div className="aspect-[16/9] animate-pulse bg-muted" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-1.5 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-9 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
