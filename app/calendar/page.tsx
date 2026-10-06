import type { Metadata } from "next";
import { getContent } from "@/lib/queries";
import { ContentCalendar } from "@/components/content/content-calendar";
import { PageBody, PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Content Calendar" };

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const [{ view }, items] = await Promise.all([searchParams, getContent()]);
  return (
    <>
      <PageHeader eyebrow="Communications" title="Content Calendar" description="Social posts and newsletters across every platform." tabs />
      <PageBody>
        <ContentCalendar items={items} initialView={view === "list" ? "list" : "calendar"} />
      </PageBody>
    </>
  );
}
