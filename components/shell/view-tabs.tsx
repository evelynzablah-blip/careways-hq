"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartGantt, Images, LayoutDashboard, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { VIEW_TABS } from "@/lib/nav";

const ICONS = { "/": LayoutDashboard, "/calendar": CalendarDays, "/timeline": ChartGantt, "/tasks": ListChecks, "/gallery": Images } as const;

export function ViewTabs({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Views" className={cn("border-b", className)}>
      <ul className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
        {VIEW_TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = ICONS[tab.href];
          return (
            <li key={tab.href} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-1.5 border-b-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "border-primary font-medium text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
