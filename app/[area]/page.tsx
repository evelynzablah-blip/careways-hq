import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StickyNote, UserPlus } from "lucide-react";
import { formatShort } from "@/lib/dates";
import { isOpen, sortTasks } from "@/lib/derive";
import { AREA_TONE } from "@/lib/meta";
import { AREA_ROUTES } from "@/lib/nav";
import { getArea, getInbox, getTasks, getUpcomingContent } from "@/lib/queries";
import type { AreaId } from "@/lib/types";
import { ContentList } from "@/components/content/content-list";
import { SectionHeader } from "@/components/cw/section-header";
import { EmptyState } from "@/components/cw/states";
import { QuickAddButton } from "@/components/quick-add/quick-add-button";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { missionLookup } from "@/components/dashboard/sections";

type Route = (typeof AREA_ROUTES)[number];
const isRoute = (s: string): s is Route => (AREA_ROUTES as readonly string[]).includes(s);

export async function generateMetadata({ params }: PageProps<"/[area]">): Promise<Metadata> {
  const { area } = await params;
  if (area === "archive") return { title: "Archive" };
  return { title: (await getArea(area))?.name ?? "Not found" };
}

export default async function AreaPage({ params }: PageProps<"/[area]">) {
  const { area: slug } = await params;
  if (!isRoute(slug)) notFound();
  if (slug === "archive") return <ArchivePage />;

  const [area, tasks, missions] = await Promise.all([getArea(slug), getTasks({ areaId: slug as AreaId }), missionLookup()]);
  if (!area) notFound();
  const open = tasks.filter(isOpen).sort(sortTasks);

  return (
    <>
      <PageHeader
        eyebrow="Project area"
        title={`${area.emoji} ${area.name}`}
        description={area.description}
        actions={
          slug === "ideas" ? (
            <>
              <QuickAddButton kind="note" variant="outline">Note</QuickAddButton>
              <QuickAddButton kind="contact" variant="outline">Contact</QuickAddButton>
            </>
          ) : (
            <QuickAddButton defaults={{ areaId: area.id }} />
          )
        }
      >
        <div data-tone={AREA_TONE[area.id]} className="mt-4 h-1.5 w-24 rounded-full bg-(--tone-dot)" aria-hidden />
      </PageHeader>
      <PageBody>
        {slug === "ideas" && <InboxSection />}
        {slug === "communications" && <CommsSection />}
        <section aria-labelledby="area-tasks" className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
          <SectionHeader id="area-tasks" title="Open tasks" count={open.length} action={{ href: `/tasks?area=${area.id}`, label: "All Tasks" }} />
          <TaskList
            tasks={open}
            missions={missions}
            limit={100}
            addDefaults={{ areaId: area.id }}
            addPlaceholder={`Add a task to ${area.name}`}
            empty={{ emoji: "🌿", title: "Nothing open here" }}
          />
        </section>
      </PageBody>
    </>
  );
}

async function InboxSection() {
  const items = await getInbox();
  return (
    <section aria-labelledby="inbox" className="flex flex-col gap-3">
      <SectionHeader id="inbox" title="Inbox" count={items.length} />
      {items.length === 0 ? (
        <EmptyState emoji="📭" title="Inbox zero" hint="Capture notes and contacts from Quick links." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => {
            const Icon = i.kind === "contact" ? UserPlus : StickyNote;
            return (
              <li key={i.id} data-tone={i.kind === "contact" ? "blue" : "mint"} className="flex gap-3 rounded-2xl border border-(--tone-border) bg-(--tone-bg) p-4">
                <Icon className="mt-0.5 size-4 shrink-0 text-(--tone-fg)" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm">{i.text}</p>
                  <p className="mt-1 text-xs text-(--tone-fg)">
                    {i.kind === "contact" ? "Contact" : "Note"} · {formatShort(i.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

async function CommsSection() {
  const items = await getUpcomingContent(8);
  return (
    <section aria-labelledby="comms" className="flex flex-col gap-3">
      <SectionHeader id="comms" title="Coming up" count={items.length} action={{ href: "/calendar", label: "Content Calendar" }} />
      <ContentList items={items} />
    </section>
  );
}

async function ArchivePage() {
  const [done, missions] = await Promise.all([getTasks({ status: "done" }), missionLookup()]);
  const sorted = [...done].sort((a, b) => ((a.completedAt ?? "") < (b.completedAt ?? "") ? 1 : -1));
  return (
    <>
      <PageHeader eyebrow="CareWays HQ" title="🗄️ Archive" description="Completed tasks. Uncheck one to bring it back." />
      <PageBody>
        <section aria-labelledby="done" className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
          <SectionHeader id="done" title="Completed" count={sorted.length} />
          <TaskList tasks={sorted} missions={missions} limit={200} empty={{ emoji: "🗄️", title: "Nothing archived yet" }} />
        </section>
      </PageBody>
    </>
  );
}
