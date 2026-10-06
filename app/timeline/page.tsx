import type { Metadata } from "next";
import { getMissions } from "@/lib/queries";
import { Timeline } from "@/components/missions/timeline";
import { PageBody, PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const missions = await getMissions();
  return (
    <>
      <PageHeader eyebrow="Missions" title="Timeline" description="From first planning call to the last day in the field." tabs />
      <PageBody>
        <Timeline missions={missions} />
      </PageBody>
    </>
  );
}
