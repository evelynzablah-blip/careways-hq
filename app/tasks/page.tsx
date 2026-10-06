import type { Metadata } from "next";
import { getPickers, getTasks } from "@/lib/queries";
import { TASK_STATUS } from "@/lib/meta";
import type { AreaId, Priority, TaskStatus } from "@/lib/types";
import { AllTasks, type DueFilter } from "@/components/tasks/all-tasks";
import { PageBody, PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "All Tasks" };

const list = (v: string | string[] | undefined) => (typeof v === "string" && v ? v.split(",") : []);

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const [sp, tasks, pickers] = await Promise.all([searchParams, getTasks(), getPickers()]);
  const due = ["overdue", "today", "week"].includes(String(sp.due)) ? (sp.due as DueFilter) : undefined;
  const status = String(sp.status) in TASK_STATUS ? (sp.status as TaskStatus) : undefined;
  const areaIds = pickers.areas.map((a) => a.id as string);

  return (
    <>
      <PageHeader eyebrow="CareWays HQ" title="All Tasks" description="One task list for every mission and area. Change it once, it moves everywhere." tabs />
      <PageBody>
        <AllTasks
          tasks={tasks}
          pickers={pickers}
          initial={{
            view: sp.view === "board" ? "board" : "list",
            due,
            status,
            mission: list(sp.mission).filter((id) => pickers.missions.some((m) => m.id === id)),
            area: list(sp.area).filter((id) => areaIds.includes(id)) as AreaId[],
            priority: list(sp.priority).filter((p) => ["high", "medium", "low"].includes(p)) as Priority[],
          }}
        />
      </PageBody>
    </>
  );
}
