import Link from "next/link";
import { MISSION_STATUS } from "@/lib/meta";
import type { MissionSummary } from "@/lib/types";
import { Flag } from "@/components/cw/platform-icon";
import { HealthIndicator, ProgressBar, StatusPill } from "@/components/cw/pills";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function UpcomingMissionsTable({ missions }: { missions: MissionSummary[] }) {
  const sorted = [...missions].sort((a, b) => ((a.dates?.start ?? "9999") < (b.dates?.start ?? "9999") ? -1 : 1));
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-xs">
      <Table className="min-w-[30rem]">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Mission</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[28%]">Progress</TableHead>
            <TableHead className="pr-4">Health</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((m) => (
            <TableRow key={m.id} className="relative">
              <TableCell className="py-2.5 pl-4">
                <Link href={`/missions/${m.slug}`} className="flex items-center gap-2 font-medium after:absolute after:inset-0 hover:underline">
                  <Flag country={m.country} className="text-lg" />
                  <span>
                    {m.name}
                    <span className="block text-xs font-normal text-muted-foreground">{m.dateLabel}</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <StatusPill kind="mission" status={m.status} />
              </TableCell>
              <TableCell>
                <ProgressBar value={m.progress} label={`${m.name} progress`} tone={MISSION_STATUS[m.status].tone} />
              </TableCell>
              <TableCell className="pr-4">
                <HealthIndicator health={m.health} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
