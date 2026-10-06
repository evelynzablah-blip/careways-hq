"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const DASHBOARD_SECTIONS = [
  { id: "missions", label: "Missions" },
  { id: "tasks", label: "Today · This Week · Waiting" },
  { id: "upcoming", label: "Upcoming Missions" },
  { id: "content", label: "Content Calendar" },
  { id: "areas", label: "Project Areas" },
] as const;

const KEY = "cw_dashboard_hidden";

/** Show/hide dashboard sections (per viewer, stored in this browser). */
export function CustomizeDashboard() {
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from browser storage once
      if (Array.isArray(saved)) setHidden(saved);
    } catch {}
  }, []);

  function toggle(id: string, show: boolean) {
    const next = show ? hidden.filter((h) => h !== id) : [...hidden, id];
    setHidden(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  return (
    <>
      {hidden.length > 0 && <style>{hidden.map((id) => `[data-section="${id}"]{display:none}`).join("")}</style>}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            <SlidersHorizontal aria-hidden /> Customize
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <p className="mb-2 text-sm font-medium">Show on dashboard</p>
          <ul className="flex flex-col gap-2">
            {DASHBOARD_SECTIONS.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={!hidden.includes(s.id)} onCheckedChange={(v) => toggle(s.id, v === true)} />
                  {s.label}
                </label>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </>
  );
}
