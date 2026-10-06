import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRY, PLATFORM } from "@/lib/meta";
import type { CountryCode, Platform } from "@/lib/types";

// lucide-react v1 dropped brand marks, so these are minimal outline glyphs.
function Glyph({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {children}
    </svg>
  );
}

const GLYPHS: Record<Exclude<Platform, "email">, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.5v.01M12 16v-5.5M12 13a2.5 2.5 0 0 1 5 0v3" />
    </>
  ),
  facebook: <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v3h2v8h3v-8h2.5l.5-3h-3V7.5A1.5 1.5 0 0 1 13.5 6H15z" />,
};

export function PlatformIcon({ platform, className, withLabel }: { platform: Platform; className?: string; withLabel?: boolean }) {
  const meta = PLATFORM[platform];
  const cls = cn("size-3.5 shrink-0", className);
  const icon = platform === "email" ? <Mail className={cls} aria-hidden /> : <Glyph className={cls}>{GLYPHS[platform]}</Glyph>;
  return (
    <span data-tone={meta.tone} className="inline-flex items-center gap-1.5 text-(--tone-fg)">
      {icon}
      <span className={withLabel ? "text-muted-foreground" : "sr-only"}>{meta.label}</span>
    </span>
  );
}

export function Flag({ country, className }: { country: CountryCode; className?: string }) {
  const c = COUNTRY[country];
  return (
    <span role="img" aria-label={`${c.name} flag`} className={cn("leading-none", className)}>
      {c.flag}
    </span>
  );
}
