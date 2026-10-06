// Natural-language parsing for Quick Add (Todoist-style). Pure & dependency-free.
// Understands English and Spanish:
//   #guatemala #gt #salvador … → mission      #fundraising @ops … → area
//   !high !alta !p1 p1 · !medium !media p2 · !low !baja p3 → priority
//   today/hoy · tomorrow/mañana · friday/viernes · next week/próxima semana
//   oct 12 · 12 oct · 12 de octubre · in 3 days/en 3 días → due date

import type { AreaId, Priority } from "./types";

export type TokenKind = "mission" | "area" | "priority" | "due";

export interface ParsedToken {
  kind: TokenKind;
  start: number;
  end: number;
  label: string;
}

export interface ParseResult {
  title: string;
  missionId?: string;
  areaId?: AreaId;
  priority?: Priority;
  due?: string; // YYYY-MM-DD
  tokens: ParsedToken[];
}

export interface ParseContext {
  missions: { id: string; name: string; country: string }[];
  today?: Date;
}

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const MISSION_ALIASES: Record<string, string[]> = {
  GT: ["guatemala", "guate", "gt", "antigua"],
  SV: ["elsalvador", "el-salvador", "salvador", "sv"],
  CO: ["colombia", "co", "cartagena"],
  EC: ["ecuador", "ec", "quito"],
};

const AREA_ALIASES: Record<AreaId, string[]> = {
  missions: ["missions", "mission", "misiones"],
  programs: ["programs", "program", "programas"],
  communications: ["communications", "comms", "comunicaciones", "social"],
  partners: ["partners", "people", "socios", "aliados"],
  fundraising: ["fundraising", "fundraise", "donors", "fondos", "donantes"],
  operations: ["operations", "ops", "operaciones", "admin"],
  documents: ["documents", "docs", "documentos"],
  ideas: ["ideas", "inbox"],
};

const AREA_LABEL: Record<AreaId, string> = {
  missions: "Missions",
  programs: "Programs",
  communications: "Communications",
  partners: "Partners & People",
  fundraising: "Fundraising",
  operations: "Operations",
  documents: "Documents",
  ideas: "Ideas / Inbox",
};

const PRIORITY_ALIASES: Record<Priority, string[]> = {
  high: ["high", "alta", "h", "p1", "1", "urgent", "urgente"],
  medium: ["medium", "media", "med", "m", "p2", "2"],
  low: ["low", "baja", "l", "p3", "3"],
};

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, ene: 0, enero: 0,
  feb: 1, february: 1, febrero: 1,
  mar: 2, march: 2, marzo: 2,
  apr: 3, april: 3, abr: 3, abril: 3,
  may: 4, mayo: 4,
  jun: 5, june: 5, junio: 5,
  jul: 6, july: 6, julio: 6,
  aug: 7, august: 7, ago: 7, agosto: 7,
  sep: 8, sept: 8, september: 8, septiembre: 8, setiembre: 8,
  oct: 9, october: 9, octubre: 9,
  nov: 10, november: 10, noviembre: 10,
  dec: 11, december: 11, dic: 11, diciembre: 11,
};

const WEEKDAYS: Record<string, number> = {
  sunday: 0, sun: 0, domingo: 0,
  monday: 1, mon: 1, lunes: 1,
  tuesday: 2, tue: 2, tues: 2, martes: 2,
  wednesday: 3, wed: 3, miercoles: 3,
  thursday: 4, thu: 4, thurs: 4, jueves: 4,
  friday: 5, fri: 5, viernes: 5,
  saturday: 6, sat: 6, sabado: 6,
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

// Unicode-aware word boundaries.
const B = "(?<![\\p{L}\\d])";
const E = "(?![\\p{L}\\d])";
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");
// Ambiguous English abbreviations (sun, sat, wed) are left out on purpose.
const WEEKDAY_RE = "sunday|domingo|monday|mon|lunes|tuesday|tues|tue|martes|wednesday|mi[eé]rcoles|thursday|thurs|thu|jueves|friday|fri|viernes|saturday|s[aá]bado";

interface Rule {
  kind: TokenKind;
  re: RegExp;
  resolve: (m: RegExpExecArray, ctx: Required<ParseContext>) => { value: string; label: string } | null;
}

const RULES: Rule[] = [
  {
    kind: "mission",
    re: new RegExp(`${B}[#@]([\\p{L}\\d-]+)`, "giu"),
    resolve: (m, ctx) => {
      const word = norm(m[1]);
      const code = Object.entries(MISSION_ALIASES).find(([, al]) => al.includes(word))?.[0];
      const mission = code && ctx.missions.find((x) => x.country === code);
      return mission ? { value: mission.id, label: mission.name } : null;
    },
  },
  {
    kind: "area",
    re: new RegExp(`${B}[#@]([\\p{L}\\d-]+)`, "giu"),
    resolve: (m) => {
      const word = norm(m[1]);
      const area = (Object.entries(AREA_ALIASES) as [AreaId, string[]][]).find(([, al]) => al.includes(word))?.[0];
      return area ? { value: area, label: AREA_LABEL[area] } : null;
    },
  },
  {
    kind: "priority",
    re: new RegExp(`${B}(?:!([\\p{L}\\d]+)|(p[123]))${E}`, "giu"),
    resolve: (m) => {
      const word = norm(m[1] ?? m[2]);
      const p = (Object.entries(PRIORITY_ALIASES) as [Priority, string[]][]).find(([, al]) => al.includes(word))?.[0];
      return p ? { value: p, label: `${p[0].toUpperCase()}${p.slice(1)} priority` } : null;
    },
  },
  {
    kind: "due",
    re: new RegExp(`${B}(today|hoy|tonight|tomorrow|tmr|ma[nñ]ana|pasado ma[nñ]ana|next week|pr[oó]xima semana)${E}`, "giu"),
    resolve: (m, { today }) => {
      const w = norm(m[1]);
      const d =
        w === "today" || w === "hoy" || w === "tonight"
          ? today
          : w === "pasado manana"
            ? addDays(today, 2)
            : w === "next week" || w === "proxima semana"
              ? addDays(today, ((8 - today.getDay()) % 7) || 7) // next Monday
              : addDays(today, 1);
      return { value: iso(d), label: fmt(d) };
    },
  },
  {
    kind: "due",
    re: new RegExp(`${B}(?:in|en) (\\d{1,3}) (?:days?|d[ií]as?)${E}`, "giu"),
    resolve: (m, { today }) => {
      const d = addDays(today, Number(m[1]));
      return { value: iso(d), label: fmt(d) };
    },
  },
  {
    kind: "due",
    re: new RegExp(`${B}(?:(?:next|el|este|this) )?(${WEEKDAY_RE})${E}`, "giu"),
    resolve: (m, { today }) => {
      const target = WEEKDAYS[norm(m[1])];
      let diff = (target - today.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      const d = addDays(today, diff);
      return { value: iso(d), label: fmt(d) };
    },
  },
  {
    kind: "due",
    // "oct 12", "october 12", "12 oct", "12 de octubre"
    re: new RegExp(`${B}(?:(${MONTH_RE})\\.? (\\d{1,2})|(\\d{1,2}) (?:de )?(${MONTH_RE}))${E}`, "giu"),
    resolve: (m, { today }) => {
      const month = MONTHS[norm(m[1] ?? m[4])];
      const day = Number(m[2] ?? m[3]);
      if (day < 1 || day > 31) return null;
      let d = new Date(today.getFullYear(), month, day);
      if (d.getMonth() !== month) return null;
      if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) d = new Date(today.getFullYear() + 1, month, day);
      return { value: iso(d), label: fmt(d) };
    },
  },
];

export function parseQuickAdd(text: string, ctx: ParseContext): ParseResult {
  const full: Required<ParseContext> = { missions: ctx.missions, today: ctx.today ?? new Date() };
  const found: (ParsedToken & { value: string })[] = [];

  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text))) {
      const r = rule.resolve(m, full);
      if (r) found.push({ kind: rule.kind, start: m.index, end: m.index + m[0].length, label: r.label, value: r.value });
    }
  }

  // Earliest match wins; drop overlaps and repeated kinds (left as plain title text).
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const tokens: typeof found = [];
  const seen = new Set<TokenKind>();
  for (const t of found) {
    if (seen.has(t.kind) || tokens.some((x) => t.start < x.end && x.start < t.end)) continue;
    seen.add(t.kind);
    tokens.push(t);
  }

  let title = "";
  let cursor = 0;
  for (const t of tokens) {
    title += text.slice(cursor, t.start);
    cursor = t.end;
  }
  title = (title + text.slice(cursor)).replace(/\s{2,}/g, " ").trim();

  const get = (k: TokenKind) => tokens.find((t) => t.kind === k)?.value;
  return {
    title,
    missionId: get("mission"),
    areaId: get("area") as AreaId | undefined,
    priority: get("priority") as Priority | undefined,
    due: get("due"),
    tokens: tokens.map(({ kind, start, end, label }) => ({ kind, start, end, label })),
  };
}
