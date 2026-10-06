import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Handshake, UserRound } from "lucide-react";
import { relISO } from "@/lib/dates";
import { healthOf, isOpen, PLANNING_WINDOW_DAYS, sortTasks } from "@/lib/derive";
import { HEALTH, MISSION_STATUS } from "@/lib/meta";
import { getContent, getMission, getTasks } from "@/lib/queries";
import { ContentList } from "@/components/content/content-list";
import { Flag } from "@/components/cw/platform-icon";
import { HealthIndicator, ProgressBar, StatusPill } from "@/components/cw/pills";
import { SectionHeader } from "@/components/cw/section-header";
import { QuickAddButton } from "@/components/quick-add/quick-add-button";
import { PageBody } from "@/components/shell/page-header";
import { TaskList } from "@/components/tasks/task-list";

export async function generateMetadata({ params }: PageProps<"/missions/[slug]">): Promise<Metadata> {
  const m = await getMission((await params).slug);
  return { title: m?.name ?? "Mission" };
}

export default async function MissionPage({ params }: PageProps<"/missions/[slug]">) {
  const { slug } = await params;
  const m = await getMission(slug);
  if (!m) notFound();

  const [tasks, content] = await Promise.all([getTasks({ missionId: m.id }), getContent()]);
  const open = tasks.filter(isOpen).sort(sortTasks);
  const linked = content.filter((c) => c.missionId === m.id);
  const { expected } = healthOf(m);
  const tone = MISSION_STATUS[m.status].tone;

  return (
    <>
      <header className="relative">
        <div className="relative h-56 overflow-hidden sm:h-72">
          <Image src={m.coverImage} alt={`${m.city}`} fill priority sizes="(min-width: 1024px) calc(100vw - 16rem), 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 text-white sm:px-6 lg:px-8">
            <Link href="/missions" className="mb-3 inline-flex items-center gap-1 text-sm text-white/85 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden /> Missions
            </Link>
            <h1 className="flex items-center gap-3 font-heading text-3xl font-semibold sm:text-4xl">
              <Flag country={m.country} /> {m.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90">
              <StatusPill kind="mission" status={m.status} />
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden /> {m.dateLabel}
              </span>
              <span>{m.city}</span>
            </p>
          </div>
        </div>
      </header>

      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">Progress</p>
            <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">{m.progress}%</p>
            <ProgressBar value={m.progress} label="Mission progress" tone={tone} showValue={false} className="mt-2" />
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">Tasks</p>
            <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">
              {m.tasksDone}
              <span className="text-lg text-muted-foreground">/{m.tasksTotal}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{open.length} open</p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">Health</p>
            <HealthIndicator health={m.health} className="mt-2 text-base" />
            <p className="mt-1 text-xs text-muted-foreground">
              {expected !== null ? `Expected ≈${expected}% at this point (${Math.round(PLANNING_WINDOW_DAYS / 30)}-month window).` : HEALTH[m.health].hint}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">Countdown</p>
            <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">{m.daysToStart ?? "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.daysToStart !== null ? "days until departure" : "dates to be defined"}</p>
          </div>
        </div>

        <div data-tone={tone} className="flex items-start gap-3 rounded-2xl border border-(--tone-border) bg-(--tone-bg) p-4 text-(--tone-fg)">
          <ArrowRight className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase">Next step</p>
            <p className="font-heading text-lg">{m.nextStep}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <section aria-labelledby="mission-tasks" className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
            <SectionHeader id="mission-tasks" title="Open tasks" count={open.length} action={{ href: `/tasks?mission=${m.id}&view=board`, label: "Board" }} />
            <TaskList
              tasks={open}
              missions={{}}
              limit={50}
              addDefaults={{ missionId: m.id, areaId: "missions", due: relISO(7) }}
              addPlaceholder={`Add a task to ${m.name}`}
              empty={{ emoji: "🎉", title: "All tasks done" }}
            />
          </section>

          <aside className="flex min-w-0 flex-col gap-6">
            <section aria-labelledby="mission-people" className="rounded-2xl border bg-card p-4 shadow-xs">
              <h2 id="mission-people" className="mb-3 font-heading text-lg font-semibold">People & partners</h2>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <UserRound className="size-4 text-muted-foreground" aria-hidden /> Lead: {m.lead}
                </li>
                {m.partners.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Handshake className="size-4 text-muted-foreground" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="mission-content" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 id="mission-content" className="font-heading text-lg font-semibold">Content</h2>
                <QuickAddButton kind="social-post" defaults={{ missionId: m.id }} variant="outline">
                  Post
                </QuickAddButton>
              </div>
              <ContentList items={linked} />
            </section>
          </aside>
        </div>
      </PageBody>
    </>
  );
}
