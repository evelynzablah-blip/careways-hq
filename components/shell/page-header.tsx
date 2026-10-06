import { cn } from "@/lib/utils";
import { ViewTabs } from "./view-tabs";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  tabs = false,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{eyebrow}</p>}
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
      {tabs && <ViewTabs className="mt-5" />}
    </header>
  );
}

export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8", className)}>{children}</div>;
}
