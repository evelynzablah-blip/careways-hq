"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { logout } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import { AREA_TONE } from "@/lib/meta";
import { NAV, QUICK_LINKS } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuickAdd } from "@/components/quick-add/quick-add-provider";

export const SIDEBAR_COOKIE = "cw_sidebar";

function isActive(pathname: string, href: string) {
  if (href === "/") return ["/", "/calendar", "/timeline", "/gallery"].includes(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Wraps a control in a right-side tooltip only when the rail is collapsed. */
function RailTip({ show, label, children }: { show: boolean; label: string; children: React.ReactElement }) {
  if (!show) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { open } = useQuickAdd();

  return (
    <div className="flex h-full flex-col gap-4">
      <Link
        href="/"
        onClick={onNavigate}
        className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1", collapsed && "justify-center px-0")}
        aria-label="CareWays HQ home"
      >
        <Image src="/brand/CareWays_LogoMark_FullColor.svg" alt="" width={28} height={28} className="size-7 shrink-0" />
        {!collapsed && (
          <span className="font-heading text-[1.15rem] leading-none font-semibold tracking-tight">
            CareWays <span className="text-primary italic">HQ</span>
          </span>
        )}
      </Link>

      <RailTip show={collapsed} label="New (⌘K)">
        <Button
          onClick={() => {
            onNavigate?.();
            open("task");
          }}
          className={cn("w-full justify-start", collapsed && "justify-center px-0")}
          aria-label={collapsed ? "New task" : undefined}
        >
          <Plus aria-hidden />
          {!collapsed && (
            <>
              New
              <kbd className="ml-auto rounded bg-primary-foreground/15 px-1.5 py-0.5 font-sans text-[0.7rem]">⌘K</kbd>
            </>
          )}
        </Button>
      </RailTip>

      <nav aria-label="Main" className="-mx-1 flex-1 overflow-y-auto px-1">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <RailTip show={collapsed} label={item.label}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <span
                      data-tone={item.area ? AREA_TONE[item.area] : undefined}
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-md",
                        item.area ? "bg-(--tone-bg) text-(--tone-fg)" : "text-sidebar-foreground/70",
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </RailTip>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          {!collapsed && (
            <h2 className="px-2.5 pb-1.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Quick links
            </h2>
          )}
          <ul className="flex flex-col gap-0.5">
            {QUICK_LINKS.map(({ kind, label, icon: Icon }) => (
              <li key={kind}>
                <RailTip show={collapsed} label={`Add ${label.toLowerCase()}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate?.();
                      open(kind);
                    }}
                    aria-label={collapsed ? `Add ${label.toLowerCase()}` : undefined}
                    className={cn(
                      "flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <span className="grid size-6 place-items-center">
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    {!collapsed && (
                      <span>
                        <span className="text-muted-foreground">+ </span>
                        {label}
                      </span>
                    )}
                  </button>
                </RailTip>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className={cn("flex items-center gap-2.5 border-t pt-3", collapsed && "justify-center")}>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-heading text-sm text-primary-foreground">
          EZ
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1 text-sm leading-tight">
            <p className="truncate font-medium">Evelyn Zablah</p>
            <p className="truncate text-xs text-muted-foreground">Director</p>
          </div>
        )}
        {!collapsed && (
          <form action={logout}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
                  <LogOut aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </form>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ initialCollapsed }: { initialCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar p-3 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[4.25rem]" : "w-64",
      )}
    >
      <SidebarBody collapsed={collapsed} />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        className="absolute top-4 -right-3.5 rounded-full border bg-background shadow-sm"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
      </Button>
    </aside>
  );
}

export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const quickAdd = useQuickAdd();
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">CareWays HQ sections and quick links</SheetDescription>
          <SidebarBody collapsed={false} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center gap-2">
        <Image src="/brand/CareWays_LogoMark_FullColor.svg" alt="" width={24} height={24} className="size-6" />
        <span className="font-heading text-base font-semibold">
          CareWays <span className="text-primary italic">HQ</span>
        </span>
      </Link>
      <Button size="sm" className="ml-auto" onClick={() => quickAdd.open("task")}>
        <Plus aria-hidden /> New
      </Button>
    </header>
  );
}
