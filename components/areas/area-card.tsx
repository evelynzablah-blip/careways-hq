import Link from "next/link";
import { cn } from "@/lib/utils";
import { AREA_TONE } from "@/lib/meta";
import type { AreaSummary } from "@/lib/types";

export function areaHref(id: AreaSummary["id"]) {
  return id === "missions" ? "/missions" : `/${id}`;
}

export function AreaCard({ area, className }: { area: AreaSummary; className?: string }) {
  return (
    <Link
      href={areaHref(area.id)}
      data-tone={AREA_TONE[area.id]}
      className={cn(
        "group flex flex-col gap-2 rounded-2xl border border-(--tone-border) bg-(--tone-bg) p-4 text-(--tone-fg) transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden>
          {area.emoji}
        </span>
        <span className="rounded-full bg-card/70 px-2 py-0.5 text-xs font-semibold tabular-nums">
          {area.openTasks} open
        </span>
      </div>
      <h3 className="font-heading text-lg leading-tight font-semibold">{area.name}</h3>
      <p className="text-sm leading-snug opacity-90">{area.description}</p>
    </Link>
  );
}

export function AreaGrid({ areas }: { areas: AreaSummary[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {areas.map((a) => (
        <li key={a.id} className="flex">
          <AreaCard area={a} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
