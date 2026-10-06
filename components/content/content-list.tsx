import { Mail, SquarePen } from "lucide-react";
import { formatShort, formatTime } from "@/lib/dates";
import { CONTENT_TYPE } from "@/lib/meta";
import type { ContentItem } from "@/lib/types";
import { PlatformIcon } from "@/components/cw/platform-icon";
import { StatusPill } from "@/components/cw/pills";
import { EmptyState } from "@/components/cw/states";

// Refs: Aboard (clean list, status as pill), Buffer (platform icon + time per entry).
export function ContentList({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return <EmptyState emoji="📣" title="Nothing scheduled" hint="Add a social post or newsletter from Quick links." />;
  }
  return (
    <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-xs">
      {items.map((c) => {
        const TypeIcon = c.type === "newsletter" ? Mail : SquarePen;
        return (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            <span
              title={CONTENT_TYPE[c.type].label}
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
            >
              <TypeIcon className="size-4" aria-hidden />
              <span className="sr-only">{CONTENT_TYPE[c.type].label}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <PlatformIcon platform={c.platform} withLabel className="size-3" />
                <span aria-hidden>·</span>
                <time dateTime={c.publishAt} className="tabular-nums">
                  {formatShort(c.publishAt)}, {formatTime(c.publishAt)}
                </time>
              </p>
            </div>
            <StatusPill kind="content" status={c.status} />
          </li>
        );
      })}
    </ul>
  );
}
