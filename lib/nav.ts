import {
  Archive,
  FolderOpen,
  HandCoins,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Megaphone,
  Newspaper,
  Plane,
  Settings2,
  SquarePen,
  StickyNote,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AreaId } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  area?: AreaId;
}

export const NAV: NavItem[] = [
  { href: "/", label: "CareWays HQ", icon: LayoutDashboard },
  { href: "/missions", label: "Missions", icon: Plane, area: "missions" },
  { href: "/programs", label: "Programs", icon: HeartPulse, area: "programs" },
  { href: "/communications", label: "Communications", icon: Megaphone, area: "communications" },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/partners", label: "Partners & People", icon: Users, area: "partners" },
  { href: "/fundraising", label: "Fundraising", icon: HandCoins, area: "fundraising" },
  { href: "/operations", label: "Operations", icon: Settings2, area: "operations" },
  { href: "/documents", label: "Documents", icon: FolderOpen, area: "documents" },
  { href: "/ideas", label: "Ideas / Inbox", icon: Lightbulb, area: "ideas" },
  { href: "/archive", label: "Archive", icon: Archive },
];

/** Routes served by app/[area]/page.tsx. */
export const AREA_ROUTES = ["programs", "communications", "partners", "fundraising", "operations", "documents", "ideas", "archive"] as const;

export type QuickAddKind = "task" | "social-post" | "newsletter" | "contact" | "note";

export const QUICK_LINKS: { kind: QuickAddKind; label: string; icon: LucideIcon }[] = [
  { kind: "task", label: "New task", icon: ListChecks },
  { kind: "social-post", label: "Social post", icon: SquarePen },
  { kind: "newsletter", label: "Newsletter", icon: Newspaper },
  { kind: "contact", label: "Contact", icon: UserPlus },
  { kind: "note", label: "Note", icon: StickyNote },
];

export const VIEW_TABS = [
  { href: "/", label: "Director Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/timeline", label: "Timeline" },
  { href: "/tasks", label: "All Tasks" },
  { href: "/gallery", label: "Gallery" },
] as const;
