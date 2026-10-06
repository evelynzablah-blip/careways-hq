"use client";

// Placeholder — full Quick Add (parsing + chips) lands in block 7.
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { QuickAddKind } from "@/lib/nav";
import type { Pickers } from "@/lib/queries";
import type { QuickAddDefaults } from "./quick-add-provider";

export function QuickAdd(props: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialKind: QuickAddKind;
  defaults: QuickAddDefaults;
  pickers: Pickers;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogTitle>Quick add</DialogTitle>
        <DialogDescription>Coming in block 7 ({props.initialKind}).</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
