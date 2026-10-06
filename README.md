# CareWays HQ — Director Dashboard

Web app version of the CareWays Collaborative HQ (originally in Notion), with UX patterns taken from Asana, Todoist, ClickUp, Airtable, Buffer and others (references below).

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · lucide-react · dnd-kit · date-fns.

## Running it

```bash
source ~/.profile        # loads Node 22 (installed with fnm)
npm run dev              # http://localhost:3000
```

Useful flags for previewing widget states:

```bash
MOCK_LATENCY_MS=1500 npm run dev          # loading skeletons
MOCK_FAIL=missions,content npm run dev    # per-widget error state
```

Data lives in memory: anything you create, complete or move is lost when the server restarts. That's on purpose until a real backend is connected (see "Pending").

## Structure

```
app/
  page.tsx                 Director Dashboard
  calendar/ timeline/ tasks/ gallery/      the 5 view tabs
  missions/ missions/[slug]/                mission list and detail
  [area]/                  programs, communications, partners, fundraising,
                           operations, documents, ideas, archive
  loading.tsx error.tsx not-found.tsx      global states (+ loading.tsx per view)
components/
  cw/          primitives: StatusPill, PriorityBadge, HealthIndicator, ProgressBar,
               SectionHeader, FilterMenu, PlatformIcon/Flag, EmptyState, WidgetBoundary
  dashboard/   Hero, Greeting, Customize, server widgets
  missions/    MissionCard/Carousel, UpcomingMissionsTable, Timeline
  tasks/       TaskRow, TaskList, TaskBoard (dnd), AllTasks
  content/     ContentList, ContentCalendar
  areas/       AreaCard/AreaGrid
  quick-add/   QuickAdd (⌘K), provider, QuickAddButton
  shell/       Sidebar (collapsible + mobile drawer), ViewTabs, PageHeader
lib/
  types.ts     domain types (mirror the Notion databases)
  meta.ts      the ONE semantic system: labels + colors for status/priority/areas
  data.ts      mock data (brief figures; tasks dated relative to "today")
  store.ts     in-memory store            ← replace when connecting a DB/Notion
  queries.ts   reads (async)              ← the only layer the UI reads from
  actions.ts   writes (Server Actions)    ← the only layer the UI writes through
  derive.ts    Notion formulas: buckets, progress, health
  quick-add-parser.ts   natural-language parsing (EN/ES)
```

**Health** (`lib/derive.ts`): expected progress = share of the 9-month window before the start date that has already passed. If actual progress is ≤10 points behind → *On track*, ≤25 → *At risk*, more → *Off track*; no dates → *No date*.

**Quick Add** (⌘K or "New"): `#guatemala` / `#salvador` / `#co` / `#ec` → mission · `#fundraising` / `@ops` → area · `!high` / `!alta` / `p1` → priority · `hoy`, `mañana`, `viernes`, `next week`, `oct 12`, `12 de octubre`, `en 3 días` → date.

## UX improvements applied (with references)

| # | Improvement | Mobbin reference |
|---|---|---|
| 1 | Hero with date, greeting, chips (`5 tasks today` · `2 overdue` → filters · `8 waiting`), Customize (show/hide sections) and a red overdue-tasks banner with "Review" | [Asana Home](https://mobbin.com/screens/5204e5db-46a1-4733-93ec-a094aeb61570), [Deel Home](https://mobbin.com/screens/6bd4989c-7a50-413e-be7e-e955b2394a29) |
| 2 | Mission cards with **Health** (icon + text) separate from **Progress**, countdown, next step, hover lift + photo zoom, snap carousel on mobile | [Todoist Projects](https://mobbin.com/screens/866c59ab-6ea2-4bee-bdea-ad3efdff8507) |
| 3 | Today / This Week / Waiting: count in each header, collapsible red Overdue subgroup, animated check + strikethrough + **Undo**, "Hospital · 6d", max 5 + "View all (12)", inline "+ Add task" (`@Who` in Waiting), friendly empty states | [ClickUp My Work](https://mobbin.com/screens/f602ab77-1370-4a6d-9d41-0ac7a7cf75f2), [Wrike](https://mobbin.com/screens/d750f820-568f-4a4f-8540-1692449871de), [Todoist board](https://mobbin.com/screens/866c59ab-6ea2-4bee-bdea-ad3efdff8507) |
| 4 | Quick Add with inline-highlighted parsing, chips (Mission/Area/Priority/Due; Platform/Status for content), type switcher; Quick Links open it preset; "Task added to X — Open" toast | [Todoist — Creating a task](https://mobbin.com/flows/b6bea42f-cfe5-4774-b28b-43fa0aa57dbb), [Height](https://mobbin.com/flows/db860423-264b-4761-a143-1b6172525c66) |
| 5 | Timeline: planning bar + field window (dashed if the date is approximate), photo + "Status · %" inside the bar, Today line, Month/Quarter/Year zoom + Today button, "Unscheduled" row | [Airtable timeline](https://mobbin.com/screens/508b5288-9eee-43db-bf2a-7164a55a7ef4), [Plane](https://mobbin.com/screens/c85c4907-458a-4288-8701-678e74cb529e) |
| 6 | Content Calendar: List ⇄ Calendar, month grid with chips (platform icon + time + status color), agenda view on mobile, Type/Platform/Status filters with colored dots, "+" per day | [Buffer](https://mobbin.com/screens/5b4d52d4-a061-40a6-af6b-63032eaeba3e), [Adobe Express](https://mobbin.com/screens/f90999e7-48e7-4ef5-ad34-c028e0d6c551), [Aboard](https://mobbin.com/screens/8e755cb6-6831-470e-b9a7-3f4397b5e0fa) |
| 7 | All Tasks: List (grouped by status) ⇄ Board with drag & drop, colored headers with counts, priority badge, "Move to…" menu (keyboard), filters in the URL | [Asana board](https://mobbin.com/screens/0a9f2bf5-409a-4af8-9493-531dd6868124), [Slack Lists](https://mobbin.com/screens/fd9a81ad-6a72-4916-8eed-5092bd02ad17) |

Quality checks performed: responsive 3→2→1 columns; sidebar collapses to a rail and becomes a drawer on mobile; no horizontal scroll at 375 px on any route; axe-core WCAG 2.1 AA with 0 violations; visible focus, skip link, full keyboard support (⌘K, checkboxes, menus, dnd-kit KeyboardSensor); `prefers-reduced-motion`; per-widget skeletons and error states; `next/image` with `sizes`; server components by default.

## Pending to connect real data

1. **Source of truth.** Decide between (a) Notion as the backend via its API, or (b) your own DB (Postgres/Supabase) synced with Notion. Types already mirror the Notion databases: All Tasks (`a673b79d…`), Missions DB (`df3e30de…`), Content (`80b89d64…`), Project Areas (`f816bf2d…`).
2. Rewrite only `lib/queries.ts` and `lib/actions.ts` (and delete `lib/store.ts` / `lib/data.ts`). Notion mapping: `"🔴 High"` → `high`, `"To do"` → `todo`, `Dates.start/end` → `dates`, `Waiting On` (text) → `waitingOn.who` (**missing**: a "waiting since" field to compute the "6d"), `Progress %` → `progress`.
3. **Authentication** (e.g. Google with the careways.world account) and a session check in each Server Action (see the note in `actions.ts`).
4. Caching/revalidation: with a real API, use `"use cache"` + `cacheTag` and `updateTag()` in the actions.
5. Contacts/notes live in an in-memory "Inbox"; they should be connected to the Partners & People database and the notes page.
6. Mission photos: replace the Unsplash images (`public/missions`, credits in `public/CREDITS.md`) with your own field photos.
7. **Brand:** the brief asks for forest green + serif; the official guide (2022) uses navy `#204071`, cyan `#3796d8`, aqua `#85f0d4`, yellow `#ffe362` and Neue Haas Grotesk. Everything is in tokens in `app/globals.css` (`:root` and `[data-tone]`) if you want to switch it.
