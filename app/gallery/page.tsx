import type { Metadata } from "next";
import { getMissions } from "@/lib/queries";
import { MissionCard } from "@/components/missions/mission-card";
import { PageBody, PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const missions = await getMissions();
  return (
    <>
      <PageHeader eyebrow="Missions" title="Gallery" description="Every destination at a glance." tabs />
      <PageBody>
        <ul className="grid gap-6 sm:grid-cols-2">
          {missions.map((m, i) => (
            <li key={m.id} className="flex">
              <MissionCard mission={m} priority={i < 2} className="w-full" />
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
