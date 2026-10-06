"use client";

// Ref: Adobe Express — filter popover with colored status dots.

import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  tone?: Tone;
  icon?: React.ReactNode;
}

export function FilterMenu<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: FilterOption<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  const active = selected.length > 0;
  const summary = active
    ? selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label
      : `${selected.length} selected`
    : null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("rounded-full", active && "border-primary/40 bg-accent text-accent-foreground")}>
          {label}
          {summary && <span className="font-normal">: {summary}</span>}
          <ChevronDown aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <ul className="flex flex-col">
          {options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <li key={o.value}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => onChange(v === true ? [...selected, o.value] : selected.filter((s) => s !== o.value))}
                  />
                  {o.tone && <span data-tone={o.tone} className="size-2 rounded-full bg-(--tone-dot)" aria-hidden />}
                  {o.icon}
                  <span className="flex-1">{o.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
        {active && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-1 flex w-full items-center gap-1.5 rounded-md border-t px-2 pt-2 pb-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" aria-hidden /> Clear {label.toLowerCase()}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
