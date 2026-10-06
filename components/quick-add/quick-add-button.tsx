"use client";

import { Plus } from "lucide-react";
import type { QuickAddKind } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { useQuickAdd, type QuickAddDefaults } from "./quick-add-provider";

/** Opens Quick Add pre-configured (e.g. from a mission or area page). */
export function QuickAddButton({
  kind = "task",
  defaults,
  children = "Add task",
  variant = "default",
}: {
  kind?: QuickAddKind;
  defaults?: QuickAddDefaults;
  children?: React.ReactNode;
  variant?: "default" | "outline";
}) {
  const { open } = useQuickAdd();
  return (
    <Button size="sm" variant={variant} onClick={() => open(kind, defaults)}>
      <Plus aria-hidden /> {children}
    </Button>
  );
}
