"use client";

import { createContext, Suspense, use, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { QuickAddKind } from "@/lib/nav";
import type { Pickers } from "@/lib/queries";
import type { AreaId, Priority, TaskStatus } from "@/lib/types";
import { QuickAdd } from "./quick-add";

export interface QuickAddDefaults {
  missionId?: string;
  areaId?: AreaId;
  priority?: Priority;
  due?: string;
  status?: TaskStatus;
}

interface Ctx {
  open: (kind?: QuickAddKind, defaults?: QuickAddDefaults) => void;
}

const QuickAddContext = createContext<Ctx | null>(null);

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd must be used inside <QuickAddProvider>");
  return ctx;
}

export function QuickAddProvider({ pickers, children }: { pickers: Promise<Pickers>; children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; kind: QuickAddKind; defaults: QuickAddDefaults; key: number }>({
    open: false,
    kind: "task",
    defaults: {},
    key: 0,
  });

  const open = useCallback((kind: QuickAddKind = "task", defaults: QuickAddDefaults = {}) => {
    setState((s) => ({ open: true, kind, defaults, key: s.key + 1 }));
  }, []);

  // ⌘K / Ctrl+K opens Quick Add from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setState((s) => (s.open ? { ...s, open: false } : { open: true, kind: "task", defaults: {}, key: s.key + 1 }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <QuickAddWithData
          key={state.key}
          open={state.open}
          onOpenChange={(o) => setState((s) => ({ ...s, open: o }))}
          initialKind={state.kind}
          defaults={state.defaults}
          pickers={pickers}
        />
      </Suspense>
    </QuickAddContext.Provider>
  );
}

function QuickAddWithData({ pickers, ...props }: Omit<React.ComponentProps<typeof QuickAdd>, "pickers"> & { pickers: Promise<Pickers> }) {
  return <QuickAdd {...props} pickers={use(pickers)} />;
}
