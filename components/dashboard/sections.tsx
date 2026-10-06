import { CalendarDays, CircleCheck, Hourglass } from "lucide-react";
import { relISO } from "@/lib/dates";
import { getAreas, getMissions, getPickers, getTaskBuckets, getUpcomingContent } from "@/lib/queries";
import { AreaGrid } from "@/components/areas/area-card";
import { ContentList } from "@/components/content/content-list";
import { SectionHeader } from "@/components/cw/section-header";
import { MissionCarousel } from "@/components/missions/mission-card";
import { UpcomingMissionsTable } from "@/components/missions/upcoming-table";
import { TaskList } from "@/components/tasks/task-list";
import type { MissionLookup } from "@/components/tasks/task-row";

export async function missionLookup(): Promise<MissionLookup> {
  const { missions } = await getPickers();
  return Object.fromEntries(missions.map((m) => [m.id, m]));
}

export async function UpcomingMissionsWidget() {
  return <UpcomingMissionsTable missions={await getMissions()} />;
}

export async function ContentWidget() {
  return <ContentList items={await getUpcomingContent(5)} />;
}

export async function AreasWidget() {
  return <AreaGrid areas={await getAreas()} />;
}

export async function MissionsWidget() {
  const missions = await getMissions();
  return <MissionCarousel missions={missions} />;
}

const COLUMN = "flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs";

export async function TaskColumns() {
  const [b, missions] = await Promise.all([getTaskBuckets(), missionLookup()]);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <section aria-labelledby="today" className={COLUMN}>
        <SectionHeader id="today" as="h3" title="Today" count={b.today.length} icon={<CircleCheck className="size-4.5 text-primary" aria-hidden />} />
        <TaskList
          tasks={b.today}
          overdue={b.overdue}
          missions={missions}
          viewAll="/tasks?due=today"
          addDefaults={{ due: relISO(0) }}
          addPlaceholder="Add a task for today"
          empty={{ emoji: "🎉", title: "Nothing for today", hint: "Enjoy the calm — or pull something from This Week." }}
        />
      </section>
      <section aria-labelledby="week" className={COLUMN}>
        <SectionHeader id="week" as="h3" title="This Week" count={b.week.length} icon={<CalendarDays className="size-4.5 text-primary" aria-hidden />} />
        <TaskList
          tasks={b.week}
          missions={missions}
          viewAll="/tasks?due=week"
          addDefaults={{ due: relISO(1) }}
          addPlaceholder="Add a task for this week"
          empty={{ emoji: "🌿", title: "A calm week ahead" }}
        />
      </section>
      <section aria-labelledby="waiting" className={`${COLUMN} md:col-span-2 xl:col-span-1`}>
        <SectionHeader id="waiting" as="h3" title="Waiting on Someone" count={b.waiting.length} icon={<Hourglass className="size-4.5 text-earth" aria-hidden />} />
        <TaskList
          tasks={b.waiting}
          missions={missions}
          variant="waiting"
          viewAll="/tasks?status=waiting"
          addDefaults={{ status: "waiting" }}
          addPlaceholder="What are you waiting for? @Who"
          empty={{ emoji: "🙌", title: "Nobody is blocking you" }}
        />
      </section>
    </div>
  );
}
