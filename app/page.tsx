import { Suspense } from "react";
import { Hero } from "@/components/dashboard/hero";
import { AreasWidget, ContentWidget, MissionsWidget, TaskColumns, UpcomingMissionsWidget } from "@/components/dashboard/sections";
import { SectionHeader } from "@/components/cw/section-header";
import { ListSkeleton, WidgetBoundary } from "@/components/cw/states";
import { MissionCarouselSkeleton } from "@/components/missions/mission-card";
import { ViewTabs } from "@/components/shell/view-tabs";

function BlockSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <ListSkeleton rows={5} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="pb-16">
      <Hero />
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <ViewTabs className="mt-6" />

        <section data-section="missions" aria-labelledby="missions-h" className="flex flex-col gap-4">
          <SectionHeader id="missions-h" title="Missions" action={{ href: "/missions", label: "View all" }} />
          <WidgetBoundary name="missions">
            <Suspense fallback={<MissionCarouselSkeleton />}>
              <MissionsWidget />
            </Suspense>
          </WidgetBoundary>
        </section>

        <section data-section="tasks" aria-label="Tasks">
          <WidgetBoundary name="tasks">
            <Suspense
              fallback={
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-2xl border bg-card p-4">
                      <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
                      <ListSkeleton />
                    </div>
                  ))}
                </div>
              }
            >
              <TaskColumns />
            </Suspense>
          </WidgetBoundary>
        </section>

        <div className="grid gap-10 xl:grid-cols-2 xl:gap-6">
          <section data-section="upcoming" aria-labelledby="upcoming-h" className="flex min-w-0 flex-col gap-4">
            <SectionHeader id="upcoming-h" title="Upcoming Missions" action={{ href: "/timeline", label: "Timeline" }} />
            <WidgetBoundary name="upcoming missions">
              <Suspense fallback={<BlockSkeleton />}>
                <UpcomingMissionsWidget />
              </Suspense>
            </WidgetBoundary>
          </section>
          <section data-section="content" aria-labelledby="content-h" className="flex min-w-0 flex-col gap-4">
            <SectionHeader id="content-h" title="Content Calendar" action={{ href: "/calendar", label: "Calendar" }} />
            <WidgetBoundary name="content">
              <Suspense fallback={<BlockSkeleton />}>
                <ContentWidget />
              </Suspense>
            </WidgetBoundary>
          </section>
        </div>

        <section data-section="areas" aria-labelledby="areas-h" className="flex flex-col gap-4">
          <SectionHeader id="areas-h" title="Project Areas" />
          <WidgetBoundary name="project areas">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
                  ))}
                </div>
              }
            >
              <AreasWidget />
            </Suspense>
          </WidgetBoundary>
        </section>
      </div>
    </div>
  );
}
