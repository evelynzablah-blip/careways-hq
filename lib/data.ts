// Typed mock data. Mission figures come from the CareWays HQ brief; tasks are
// dated relative to "today" so the dashboard always shows 5 today / 12 this week /
// 8 waiting / 2 overdue, whatever day the app is opened.

import { relISO } from "./dates";
import type {
  ContentItem,
  InboxItem,
  Mission,
  Priority,
  ProjectArea,
  Task,
} from "./types";

export const missions: Mission[] = [
  {
    id: "m-gt27",
    slug: "guatemala-2027",
    name: "Guatemala 2027",
    country: "GT",
    status: "planning",
    dates: { start: "2027-01-30", end: "2027-02-06", precision: "day" },
    dateLabel: "Jan 30 – Feb 6, 2027",
    planningStart: "2026-03-02",
    progress: 65,
    nextStep: "Lock OR schedule with the partner hospital",
    coverImage: "/missions/guatemala.jpg",
    city: "Antigua Guatemala",
    lead: "Evelyn Zablah",
    partners: ["Partner hospital (GT)", "MoH Guatemala"],
  },
  {
    id: "m-sv27",
    slug: "el-salvador-2027",
    name: "El Salvador 2027",
    country: "SV",
    status: "planning",
    dates: { start: "2027-06-01", end: "2027-06-30", precision: "month" },
    dateLabel: "June 2027",
    planningStart: "2026-07-13",
    progress: 30,
    nextStep: "Open volunteer applications",
    coverImage: "/missions/el-salvador.jpg",
    city: "San Salvador",
    lead: "Evelyn Zablah",
    partners: ["Partner hospital (SV)"],
  },
  {
    id: "m-co27",
    slug: "colombia-2027",
    name: "Colombia 2027",
    country: "CO",
    status: "early-planning",
    dates: { start: "2027-09-15", end: "2027-10-15", precision: "month" },
    dateLabel: "Sep/Oct 2027",
    planningStart: "2026-08-03",
    progress: 15,
    nextStep: "Schedule site visit to Cartagena",
    coverImage: "/missions/colombia.jpg",
    city: "Cartagena",
    lead: "Evelyn Zablah",
    partners: ["Dr. Herrera", "SIM Colombia"],
  },
  {
    id: "m-ec",
    slug: "ecuador-expansion",
    name: "Ecuador Expansion",
    country: "EC",
    status: "development",
    dates: null,
    dateLabel: "TBD",
    planningStart: "2026-06-01",
    progress: 20,
    nextStep: "Get feedback on the 3-year proposal with Baca Ortiz",
    coverImage: "/missions/ecuador.jpg",
    city: "Quito",
    lead: "Evelyn Zablah",
    partners: ["Hospital Baca Ortiz"],
  },
];

export const areas: ProjectArea[] = [
  { id: "missions", name: "Missions", emoji: "🌍", order: 1, description: "Medical mission trips — planning, logistics, teams and field days." },
  { id: "programs", name: "Programs", emoji: "🩺", order: 2, description: "Critical-care training, research and clinical programs." },
  { id: "communications", name: "Communications", emoji: "📣", order: 3, description: "Newsletter, social media, website and storytelling." },
  { id: "partners", name: "Partners & People", emoji: "🤝", order: 4, description: "Hospitals, volunteers, board, junior board and allies." },
  { id: "fundraising", name: "Fundraising", emoji: "💛", order: 5, description: "Donors, grants, events and campaigns." },
  { id: "operations", name: "Operations", emoji: "⚙️", order: 6, description: "Budget, legal, insurance and admin." },
  { id: "documents", name: "Documents", emoji: "📁", order: 7, description: "Consent forms, MOUs, templates and policies." },
  { id: "ideas", name: "Ideas / Inbox", emoji: "💡", order: 8, description: "Raw ideas, notes and contacts to sort later." },
];

// ---------------------------------------------------------------------------
// Tasks

type Seed = Omit<Task, "id">;

/** Hand-written tasks that drive Today / This Week / Waiting / Overdue. */
function activeTasks(): Seed[] {
  return [
    // Overdue (2)
    { title: "Send signed MOU to partner hospital", status: "todo", priority: "high", due: relISO(-3), missionId: "m-gt27", areaId: "missions", owner: "Evelyn" },
    { title: "Submit Q3 grant report to Rotary District", status: "doing", priority: "high", due: relISO(-1), areaId: "fundraising", owner: "Evelyn" },
    // Today (5)
    { title: "Review October newsletter draft", status: "doing", priority: "medium", due: relISO(0), areaId: "communications", owner: "Evelyn" },
    { title: "Confirm anesthesia volunteer", status: "todo", priority: "high", due: relISO(0), missionId: "m-gt27", areaId: "missions", owner: "Evelyn" },
    { title: "Approve Instagram carousel: ICU nurse training", status: "todo", priority: "low", due: relISO(0), areaId: "communications", owner: "Evelyn" },
    { title: "Call Dr. Herrera about site visit", status: "todo", priority: "medium", due: relISO(0), missionId: "m-co27", areaId: "missions", owner: "Evelyn" },
    { title: "Update 2027 budget sheet", status: "todo", priority: "medium", due: relISO(0), areaId: "operations", owner: "Evelyn" },
    // This week (12)
    { title: "Book flights for the core team", status: "todo", priority: "high", due: relISO(1), missionId: "m-gt27", areaId: "missions", owner: "Evelyn" },
    { title: "Draft donor thank-you letters (September)", status: "todo", priority: "medium", due: relISO(1), areaId: "fundraising", owner: "Evelyn" },
    { title: "Finalize volunteer application form", status: "doing", priority: "medium", due: relISO(2), missionId: "m-sv27", areaId: "missions", owner: "Evelyn" },
    { title: "Board meeting agenda — October", status: "todo", priority: "high", due: relISO(2), areaId: "operations", owner: "Evelyn" },
    { title: "Outline ICU training curriculum", status: "todo", priority: "medium", due: relISO(3), areaId: "programs", owner: "Evelyn" },
    { title: "PPE & consumables order list", status: "todo", priority: "medium", due: relISO(3), missionId: "m-gt27", areaId: "missions", owner: "Evelyn" },
    { title: "LinkedIn post: Estudio UCI results", status: "todo", priority: "low", due: relISO(4), areaId: "communications", owner: "Evelyn" },
    { title: "Renew liability insurance quote", status: "todo", priority: "medium", due: relISO(4), areaId: "operations", owner: "Evelyn" },
    { title: "Translate consent forms to Spanish", status: "todo", priority: "medium", due: relISO(5), areaId: "documents", owner: "Evelyn" },
    { title: "Junior Board kickoff call", status: "todo", priority: "low", due: relISO(5), areaId: "partners", owner: "Evelyn" },
    { title: "Send sponsorship deck to 3 prospects", status: "todo", priority: "high", due: relISO(6), areaId: "fundraising", owner: "Evelyn" },
    { title: "Outline needs-assessment survey", status: "todo", priority: "medium", due: relISO(7), missionId: "m-ec", areaId: "missions", owner: "Evelyn" },
    // Waiting on someone (8)
    { title: "OR availability for Feb dates", status: "waiting", priority: "high", due: relISO(9), missionId: "m-gt27", areaId: "missions", waitingOn: { who: "Hospital", since: relISO(-6) } },
    { title: "Customs letter for donated equipment", status: "waiting", priority: "high", due: relISO(20), missionId: "m-gt27", areaId: "missions", waitingOn: { who: "MoH Guatemala", since: relISO(-12) } },
    { title: "Feedback on 3-year partnership proposal", status: "waiting", priority: "medium", missionId: "m-ec", areaId: "missions", waitingOn: { who: "Baca Ortiz", since: relISO(-9) } },
    { title: "Volunteer CVs & licenses", status: "waiting", priority: "medium", missionId: "m-co27", areaId: "missions", waitingOn: { who: "Dr. Herrera", since: relISO(-4) } },
    { title: "Bank statements for the audit", status: "waiting", priority: "medium", areaId: "operations", waitingOn: { who: "Accountant", since: relISO(-3) } },
    { title: "Venue quote for the spring gala", status: "waiting", priority: "low", areaId: "fundraising", waitingOn: { who: "Hotel events", since: relISO(-2) } },
    { title: "Photo release forms from August trip", status: "waiting", priority: "low", areaId: "communications", waitingOn: { who: "Field coordinator", since: relISO(-15) } },
    { title: "Co-author edits on NEJM paper", status: "waiting", priority: "medium", areaId: "programs", waitingOn: { who: "Dr. Ruiz", since: relISO(-7) } },
  ];
}

/** Standard mission checklist used to fill each mission up to its task count. */
const MISSION_CHECKLIST = [
  "Define clinical scope with partner hospital",
  "Sign letter of intent",
  "Appoint mission lead and co-lead",
  "Draft mission budget",
  "Confirm dates with hospital leadership",
  "Needs assessment call with ICU team",
  "Recruit physician volunteers",
  "Recruit nursing volunteers",
  "Recruit respiratory therapists",
  "Collect volunteer licenses",
  "Apply for temporary medical permits",
  "Book team lodging",
  "Arrange ground transport",
  "Equipment & donations inventory",
  "Ship donated equipment",
  "Customs paperwork",
  "Purchase travel insurance",
  "Prepare training modules",
  "Translate training materials",
  "Plan family education sessions",
  "Pre-departure team briefing",
  "Emergency & safety plan",
  "Media & photo consent plan",
  "Donor update before departure",
  "Daily field schedule",
  "Post-mission survey",
  "Impact report outline",
  "Thank-you notes to partners",
];

const FILL_PRIORITY: Priority[] = ["medium", "low", "medium", "high", "low"];

/** Fills each mission up to `total` tasks with `done` completed. */
function missionFill(
  active: Seed[],
  plan: Record<string, { total: number; done: number; dueFrom?: number; dueTo?: number }>,
): Seed[] {
  const out: Seed[] = [];
  for (const [missionId, { total, done, dueFrom, dueTo }] of Object.entries(plan)) {
    const existing = active.filter((t) => t.missionId === missionId).length;
    const toAdd = total - existing;
    const openToAdd = toAdd - done;
    for (let i = 0; i < toAdd; i++) {
      const title = MISSION_CHECKLIST[i % MISSION_CHECKLIST.length];
      const isDone = i < done;
      const openIndex = i - done;
      const due =
        isDone || dueFrom === undefined || dueTo === undefined
          ? undefined
          : relISO(Math.round(dueFrom + ((dueTo - dueFrom) * openIndex) / Math.max(1, openToAdd - 1)));
      out.push({
        title,
        status: isDone ? "done" : "todo",
        priority: FILL_PRIORITY[i % FILL_PRIORITY.length],
        due: isDone ? relISO(-60 + i * 3) : due,
        completedAt: isDone ? relISO(-58 + i * 3) : undefined,
        missionId,
        areaId: "missions",
        owner: "Evelyn",
      });
    }
  }
  return out;
}

/** A few undated area tasks and a recently-completed log (feeds Archive). */
function areaBacklog(): Seed[] {
  return [
    { title: "Map ICU training outcomes to 2027 goals", status: "todo", priority: "medium", areaId: "programs" },
    { title: "Estudio UCI: data cleaning plan", status: "todo", priority: "low", areaId: "programs" },
    { title: "Refresh website mission pages", status: "todo", priority: "low", areaId: "communications" },
    { title: "Volunteer onboarding checklist", status: "todo", priority: "medium", areaId: "partners" },
    { title: "Giving Tuesday campaign plan", status: "todo", priority: "high", due: relISO(14), areaId: "fundraising" },
    { title: "Annual report to IRS (Form 990) prep", status: "todo", priority: "medium", due: relISO(30), areaId: "operations" },
    { title: "MOU template v2", status: "todo", priority: "low", areaId: "documents" },
    { title: "Sent September newsletter", status: "done", priority: "medium", areaId: "communications", completedAt: relISO(-6) },
    { title: "Board minutes — September", status: "done", priority: "low", areaId: "operations", completedAt: relISO(-10) },
    { title: "Wire transfer details to partner", status: "done", priority: "high", areaId: "operations", completedAt: relISO(-12) },
  ];
}

export function seedTasks(): Task[] {
  const active = activeTasks();
  const fill = missionFill(active, {
    "m-gt27": { total: 18, done: 12, dueFrom: 25, dueTo: 100 },
    "m-sv27": { total: 26, done: 8, dueFrom: 21, dueTo: 220 },
    "m-co27": { total: 28, done: 5, dueFrom: 30, dueTo: 330 },
    "m-ec": { total: 20, done: 4 },
  });
  return [...active, ...fill, ...areaBacklog()].map((t, i) => ({
    id: `t-${String(i + 1).padStart(3, "0")}`,
    ...t,
  }));
}

// ---------------------------------------------------------------------------
// Content

export function seedContent(): ContentItem[] {
  const at = (days: number, time: string) => `${relISO(days)}T${time}`;
  const items: Omit<ContentItem, "id">[] = [
    { title: "Board welcome: new members", type: "social-post", platform: "linkedin", publishAt: at(-8, "09:00"), status: "published" },
    { title: "Thank you, Rotary District!", type: "social-post", platform: "linkedin", publishAt: at(-4, "10:00"), status: "published" },
    { title: "ICU nurse training carousel", type: "social-post", platform: "instagram", publishAt: at(2, "12:00"), status: "scheduled" },
    { title: "Estudio UCI: key findings", type: "social-post", platform: "linkedin", publishAt: at(3, "10:00"), status: "drafting" },
    { title: "Meet the team: volunteer spotlight", type: "social-post", platform: "instagram", publishAt: at(7, "18:00"), status: "writing" },
    { title: "October Newsletter: Road to Guatemala 2027", type: "newsletter", platform: "email", publishAt: at(9, "09:00"), status: "review", missionId: "m-gt27" },
    { title: "Giving Tuesday teaser", type: "social-post", platform: "facebook", publishAt: at(14, "11:00"), status: "ideation" },
    { title: "El Salvador 2027: call for volunteers", type: "social-post", platform: "instagram", publishAt: at(16, "17:00"), status: "drafting", missionId: "m-sv27" },
    { title: "Packing donated equipment (behind the scenes)", type: "social-post", platform: "facebook", publishAt: at(21, "12:00"), status: "ideation", missionId: "m-gt27" },
    { title: "Cartagena site visit recap", type: "social-post", platform: "instagram", publishAt: at(23, "18:00"), status: "ideation", missionId: "m-co27" },
    { title: "November Newsletter: Giving Tuesday", type: "newsletter", platform: "email", publishAt: at(37, "09:00"), status: "ideation" },
    { title: "World Pneumonia Day", type: "social-post", platform: "linkedin", publishAt: at(37, "10:00"), status: "writing" },
    { title: "Giving Tuesday — donate today", type: "social-post", platform: "instagram", publishAt: at(56, "09:00"), status: "ideation" },
  ];
  return items.map((c, i) => ({ id: `c-${String(i + 1).padStart(2, "0")}`, owner: "Evelyn", ...c }));
}

export function seedInbox(): InboxItem[] {
  return [
    { id: "i-01", kind: "note", text: "Idea: alumni volunteer ambassadors program", createdAt: `${relISO(-2)}T09:30` },
    { id: "i-02", kind: "contact", text: "Dra. Paredes — pediatric ICU, Quito (met at conference)", createdAt: `${relISO(-5)}T16:10` },
  ];
}
