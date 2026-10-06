import type { Metadata } from "next";
import Link from "next/link";
import { ChartGantt } from "lucide-react";
import { getMissions } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/cw/section-header";
import { MissionCarousel } from "@/components/missions/mission-card";
import { UpcomingMissionsTable } from "@/components/missions/upcoming-table";
import { QuickAddButton } from "@/components/quick-add/quick-add-button";
import { PageBody, PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Missions" };

export default async function MissionsPage() {
  const missions = await getMissions();
  return (
    <>
      <PageHeader
        eyebrow="Project area"
        title="🌍 Missions"
        description="Medical mission trips — planning, logistics, teams and field days."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/timeline">
                <ChartGantt aria-hidden /> Timeline
              </Link>
            </Button>
            <QuickAddButton defaults={{ areaId: "missions" }} />
          </>
        }
      />
      <PageBody>
        <MissionCarousel missions={missions} />
        <section aria-labelledby="all-missions" className="flex flex-col gap-4">
          <SectionHeader id="all-missions" title="All missions" count={missions.length} />
          <UpcomingMissionsTable missions={missions} />
        </section>
      </PageBody>
    </>
  );
}
