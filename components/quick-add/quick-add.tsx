"use client";

// Refs: Todoist "Creating a task" (inline NL parsing + highlighted tokens,
// "Task added — Open" toast), Height (compact popover with property chips).

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { CalendarDays, Check, CircleDot, Flag as FlagIcon, FolderOpen, Megaphone, Plane } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createContent, createInboxItem, createTask } from "@/lib/actions";
import { relISO } from "@/lib/dates";
import { AREA_TONE, CONTENT_STATUS, CONTENT_STATUS_ORDER, COUNTRY, PLATFORM, PLATFORM_ORDER, PRIORITY, PRIORITY_ORDER, type Tone } from "@/lib/meta";
import { QUICK_LINKS, type QuickAddKind } from "@/lib/nav";
import { parseQuickAdd, type TokenKind } from "@/lib/quick-add-parser";
import type { Pickers } from "@/lib/queries";
import type { AreaId, ContentStatus, Platform, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { QuickAddDefaults } from "./quick-add-provider";

const TOKEN_TONE: Record<TokenKind, Tone> = { mission: "pink", area: "mint", priority: "red", due: "green" };

const PLACEHOLDER: Record<QuickAddKind, string> = {
  task: "e.g. Book flights #guatemala !high friday",
  "social-post": "e.g. Volunteer spotlight #salvador oct 22",
  newsletter: "e.g. November update nov 12",
  contact: "Name — organization, email or phone",
  note: "Capture an idea…",
};

const SUBMIT_LABEL: Record<QuickAddKind, string> = {
  task: "Add task",
  "social-post": "Add post",
  newsletter: "Add newsletter",
  contact: "Save contact",
  note: "Save note",
};

interface Option<T extends string> {
  value: T | undefined;
  label: string;
  icon?: React.ReactNode;
  tone?: Tone;
}

function Chip<T extends string>({
  icon,
  placeholder,
  value,
  options,
  onChange,
  parsed,
  extra,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: T | undefined;
  options: Option<T>[];
  onChange: (v: T | undefined) => void;
  parsed?: boolean;
  extra?: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value && value !== undefined);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-tone={current?.tone}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors",
            current
              ? current.tone
                ? "border-(--tone-border) bg-(--tone-bg) text-(--tone-fg)"
                : "border-primary/30 bg-accent text-accent-foreground"
              : "border-dashed text-muted-foreground hover:bg-muted hover:text-foreground",
            parsed && "ring-2 ring-ring/30",
          )}
        >
          {current?.icon ?? icon}
          {current ? current.label : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <ul role="listbox" aria-label={placeholder}>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted"
                >
                  {o.tone ? (
                    <span data-tone={o.tone} className="size-2 rounded-full bg-(--tone-dot)" aria-hidden />
                  ) : (
                    o.icon
                  )}
                  <span className="flex-1">{o.label}</span>
                  {selected && <Check className="size-3.5" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
        {extra?.(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

/** Input with a mirrored layer behind it that highlights parsed tokens inline. */
function HighlightInput({
  value,
  onChange,
  tokens,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  tokens: { kind: TokenKind; start: number; end: number }[];
  placeholder: string;
  onSubmit: () => void;
}) {
  const mirror = useRef<HTMLDivElement>(null);
  const sync = (e: React.SyntheticEvent<HTMLInputElement>) => {
    if (mirror.current) mirror.current.scrollLeft = e.currentTarget.scrollLeft;
  };
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const t of tokens) {
    parts.push(value.slice(cursor, t.start));
    parts.push(
      <mark key={t.start} data-tone={TOKEN_TONE[t.kind]} className="rounded-sm bg-(--tone-bg) text-(--tone-fg)">
        {value.slice(t.start, t.end)}
      </mark>,
    );
    cursor = t.end;
  }
  parts.push(value.slice(cursor));

  const shared = "w-full px-0 py-1 font-sans text-base leading-7 sm:text-lg";
  return (
    <div className="relative">
      <div ref={mirror} aria-hidden className={cn(shared, "pointer-events-none absolute inset-0 overflow-hidden whitespace-pre text-foreground")}>
        {parts}
      </div>
      <input
        autoFocus
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          sync(e);
        }}
        onScroll={sync}
        onKeyUp={sync}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        aria-label="What do you want to add?"
        className={cn(shared, "relative bg-transparent text-transparent caret-foreground outline-none placeholder:text-muted-foreground")}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}

export function QuickAdd({
  open,
  onOpenChange,
  initialKind,
  defaults,
  pickers,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialKind: QuickAddKind;
  defaults: QuickAddDefaults;
  pickers: Pickers;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<QuickAddKind>(initialKind);
  const [text, setText] = useState("");
  const [manual, setManual] = useState<{
    missionId?: string | null;
    areaId?: AreaId | null;
    priority?: Priority | null;
    due?: string | null;
    platform?: Platform;
    status?: ContentStatus;
  }>({});
  const [pending, startTransition] = useTransition();

  const parsed = useMemo(() => parseQuickAdd(text, { missions: pickers.missions }), [text, pickers.missions]);
  const isContent = kind === "social-post" || kind === "newsletter";
  const isInbox = kind === "contact" || kind === "note";
  const tokens = isInbox ? [] : parsed.tokens.filter((t) => isContent ? t.kind === "mission" || t.kind === "due" : true);

  // Manual chip choice > parsed token > provider defaults. `null` means "explicitly cleared".
  function pick<K extends "missionId" | "areaId" | "priority" | "due">(k: K) {
    const m = manual[k];
    if (m === null) return undefined;
    return (m ?? parsed[k] ?? defaults[k]) as NonNullable<(typeof parsed)[K]> | undefined;
  }
  const missionId = pick("missionId");
  const areaId = pick("areaId");
  const priority = pick("priority");
  const due = pick("due");
  const platform: Platform = kind === "newsletter" ? "email" : (manual.platform ?? "instagram");
  const status: ContentStatus = manual.status ?? "ideation";
  const title = isInbox ? text.trim() : parsed.title;
  const mission = pickers.missions.find((m) => m.id === missionId);

  function submit() {
    if (!title || pending) return;
    startTransition(async () => {
      try {
        if (kind === "task") {
          const task = await createTask({ title, missionId, areaId, priority, due, status: defaults.status });
          toast.success(mission ? `Task added to ${mission.name}` : "Task added", {
            description: task.title,
            action: { label: "Open", onClick: () => router.push(mission ? `/missions/${mission.slug}` : "/tasks") },
          });
        } else if (isContent) {
          const item = await createContent({ title, type: kind, platform, date: due, status, missionId });
          toast.success(`${kind === "newsletter" ? "Newsletter" : "Post"} added to the content calendar`, {
            description: item.title,
            action: { label: "Open", onClick: () => router.push("/calendar") },
          });
        } else {
          await createInboxItem({ kind, text: title });
          toast.success(`${kind === "contact" ? "Contact" : "Note"} saved to Ideas / Inbox`, {
            action: { label: "Open", onClick: () => router.push("/ideas") },
          });
        }
        setText("");
        setManual({});
        onOpenChange(false);
      } catch (e) {
        toast.error("Couldn’t save", { description: e instanceof Error ? e.message : undefined });
      }
    });
  }

  const missionOptions: Option<string>[] = [
    { value: undefined, label: "No mission" },
    ...pickers.missions.map((m) => ({ value: m.id, label: m.name, icon: <span aria-hidden>{COUNTRY[m.country as keyof typeof COUNTRY].flag}</span> })),
  ];
  const areaOptions: Option<AreaId>[] = [
    { value: undefined, label: "No area" },
    ...pickers.areas.map((a) => ({ value: a.id, label: a.name, tone: AREA_TONE[a.id] })),
  ];
  const priorityOptions: Option<Priority>[] = PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY[p].label, tone: PRIORITY[p].tone }));
  const dueOptions: Option<string>[] = [
    { value: relISO(0), label: "Today" },
    { value: relISO(1), label: "Tomorrow" },
    { value: relISO(7), label: "In a week" },
    { value: undefined, label: "No date" },
  ];
  if (due && !dueOptions.some((o) => o.value === due)) {
    dueOptions.unshift({ value: due, label: parsed.tokens.find((t) => t.kind === "due")?.label ?? due });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[18%] translate-y-0 gap-0 p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Quick add</DialogTitle>
        <DialogDescription className="sr-only">
          Type a title. Use # for a mission or area, ! for priority, and words like tomorrow or oct 12 for the date.
        </DialogDescription>

        <div className="border-b px-3 pt-3 pb-2">
          <ToggleGroup
            type="single"
            size="sm"
            value={kind}
            onValueChange={(v) => v && setKind(v as QuickAddKind)}
            aria-label="What to add"
            className="no-scrollbar max-w-full overflow-x-auto"
          >
            {QUICK_LINKS.map(({ kind: k, label, icon: Icon }) => (
              <ToggleGroupItem key={k} value={k} className="gap-1.5 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                <Icon aria-hidden /> {k === "task" ? "Task" : label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <form
          className="flex flex-col gap-3 px-4 pt-3 pb-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <HighlightInput value={text} onChange={setText} tokens={tokens} placeholder={PLACEHOLDER[kind]} onSubmit={submit} />

          {!isInbox && (
            <div className="flex flex-wrap gap-1.5">
              {isContent && kind === "social-post" && (
                <Chip<Platform>
                  icon={<Megaphone className="size-3.5" aria-hidden />}
                  placeholder="Platform"
                  value={platform}
                  options={PLATFORM_ORDER.filter((p) => p !== "email").map((p) => ({ value: p, label: PLATFORM[p].label, tone: PLATFORM[p].tone }))}
                  onChange={(v) => setManual((s) => ({ ...s, platform: v }))}
                />
              )}
              <Chip<string>
                icon={<Plane className="size-3.5" aria-hidden />}
                placeholder="Mission"
                value={missionId}
                options={missionOptions}
                parsed={!!parsed.missionId && manual.missionId === undefined}
                onChange={(v) => setManual((s) => ({ ...s, missionId: v ?? null }))}
              />
              {kind === "task" && (
                <>
                  <Chip<AreaId>
                    icon={<FolderOpen className="size-3.5" aria-hidden />}
                    placeholder="Area"
                    value={areaId}
                    options={areaOptions}
                    parsed={!!parsed.areaId && manual.areaId === undefined}
                    onChange={(v) => setManual((s) => ({ ...s, areaId: v ?? null }))}
                  />
                  <Chip<Priority>
                    icon={<FlagIcon className="size-3.5" aria-hidden />}
                    placeholder="Priority"
                    value={priority}
                    options={priorityOptions}
                    parsed={!!parsed.priority && manual.priority === undefined}
                    onChange={(v) => setManual((s) => ({ ...s, priority: v ?? null }))}
                  />
                </>
              )}
              <Chip<string>
                icon={<CalendarDays className="size-3.5" aria-hidden />}
                placeholder={isContent ? "Publish date" : "Due"}
                value={due}
                options={dueOptions}
                parsed={!!parsed.due && manual.due === undefined}
                onChange={(v) => setManual((s) => ({ ...s, due: v ?? null }))}
                extra={(close) => (
                  <label className="mt-1 flex items-center gap-2 border-t px-2 pt-2 pb-1 text-xs text-muted-foreground">
                    Pick a date
                    <input
                      type="date"
                      className="flex-1 rounded-md border bg-background px-2 py-1 text-sm text-foreground"
                      value={due ?? ""}
                      onChange={(e) => {
                        setManual((s) => ({ ...s, due: e.target.value || null }));
                        close();
                      }}
                    />
                  </label>
                )}
              />
              {isContent && (
                <Chip<ContentStatus>
                  icon={<CircleDot className="size-3.5" aria-hidden />}
                  placeholder="Status"
                  value={status}
                  options={CONTENT_STATUS_ORDER.map((s) => ({ value: s, label: CONTENT_STATUS[s].label, tone: CONTENT_STATUS[s].tone }))}
                  onChange={(v) => setManual((s) => ({ ...s, status: v }))}
                />
              )}
            </div>
          )}

          <div className="flex items-center gap-2 border-t pt-3">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {isInbox ? (
                "Saved to Ideas / Inbox to sort later."
              ) : (
                <>
                  <kbd className="font-sans font-semibold">#</kbd> mission/area · <kbd className="font-sans font-semibold">!</kbd> priority · “mañana”, “fri”, “oct 12”
                </>
              )}
            </p>
            <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title || pending}>
              {SUBMIT_LABEL[kind]}
              <kbd className="ml-1 hidden rounded bg-primary-foreground/15 px-1 text-[0.7rem] sm:inline">↵</kbd>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
