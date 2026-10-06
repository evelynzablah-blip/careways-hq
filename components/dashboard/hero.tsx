import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Hourglass, ListChecks, TriangleAlert } from "lucide-react";
import { formatLongDate } from "@/lib/dates";
import { getTaskBuckets } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Greeting } from "./greeting";
import { CustomizeDashboard } from "./customize";

// Refs: Asana Home (date + big greeting + summary chips + Customize),
// Deel Home (overdue alert card with a direct action).
export function Hero() {
  return (
    <header className="relative">
      <div className="relative h-36 overflow-hidden sm:h-48 lg:h-56">
        <Image src="/hero-cover.jpg" alt="" fill priority sizes="(min-width: 1024px) calc(100vw - 16rem), 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
      </div>

      <div className="relative mx-auto -mt-12 max-w-7xl px-4 sm:-mt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="w-fit rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border sm:p-4">
            <Image src="/brand/CareWays_Logo_FullColor.svg" alt="CareWays Collaborative" width={200} height={60} className="h-10 w-auto sm:h-12" priority />
          </div>
          <p className="max-w-md pb-1 font-heading text-base text-muted-foreground italic sm:text-lg">
            “Stronger critical care. Healthier communities. Brighter tomorrows.”
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{formatLongDate()}</p>
            <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              <Greeting />, Evelyn
            </h1>
            <p className="mt-1 font-heading text-lg text-primary italic">Same mission. Greater impact.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Suspense
              fallback={[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-full" />
              ))}
            >
              <SummaryChips />
            </Suspense>
            <CustomizeDashboard />
          </div>
        </div>

        <Suspense fallback={null}>
          <OverdueBanner />
        </Suspense>
      </div>
    </header>
  );
}

async function SummaryChips() {
  const buckets = await getTaskBuckets();
  return (
    <>
      <SummaryChip href="#today" icon={<ListChecks className="size-3.5" aria-hidden />}>
        {buckets.today.length} tasks today
      </SummaryChip>
      <SummaryChip href="/tasks?due=overdue" tone="red" icon={<TriangleAlert className="size-3.5" aria-hidden />}>
        {buckets.overdue.length} overdue
      </SummaryChip>
      <SummaryChip href="#waiting" icon={<Hourglass className="size-3.5" aria-hidden />}>
        {buckets.waiting.length} waiting
      </SummaryChip>
    </>
  );
}

async function OverdueBanner() {
  const buckets = await getTaskBuckets();
  const overdue = buckets.overdue.length;
  return (
    overdue > 0 && (
          <div
            role="status"
            data-tone="red"
            className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-(--tone-border) bg-(--tone-bg) px-4 py-3 text-sm text-(--tone-fg)"
          >
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            <span className="font-medium">
              {overdue} overdue {overdue === 1 ? "task" : "tasks"}
            </span>
            <span className="text-(--tone-fg)/80">— {buckets.overdue.map((t) => t.title).join(" · ")}</span>
            <Link
              href="/tasks?due=overdue"
              className="ml-auto inline-flex items-center gap-1 rounded-md font-semibold underline-offset-4 hover:underline"
            >
              Review <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
    )
  );
}

function SummaryChip({ href, tone, icon, children }: { href: string; tone?: "red"; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      data-tone={tone}
      className={
        tone
          ? "inline-flex h-8 items-center gap-1.5 rounded-full border border-(--tone-border) bg-(--tone-bg) px-3 text-sm font-medium text-(--tone-fg) transition hover:brightness-95"
          : "inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-medium transition hover:bg-muted"
      }
    >
      {icon}
      {children}
    </Link>
  );
}
