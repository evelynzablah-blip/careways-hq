// In-memory store seeded from lib/data.ts. Lives on globalThis so it survives
// hot reloads in dev. Resets when the server restarts. Replace this file (and
// nothing else) when wiring a real database or the Notion API.

import { areas, missions, seedContent, seedInbox, seedTasks } from "./data";
import type { ContentItem, InboxItem, Mission, ProjectArea, Task } from "./types";

interface Store {
  missions: Mission[];
  areas: ProjectArea[];
  tasks: Task[];
  content: ContentItem[];
  inbox: InboxItem[];
  seq: number;
}

const g = globalThis as unknown as { __carewaysStore?: Store };

export function db(): Store {
  if (!g.__carewaysStore) {
    g.__carewaysStore = {
      missions,
      areas,
      tasks: seedTasks(),
      content: seedContent(),
      inbox: seedInbox(),
      seq: 1000,
    };
  }
  return g.__carewaysStore;
}

export function nextId(prefix: string) {
  return `${prefix}-${++db().seq}`;
}
