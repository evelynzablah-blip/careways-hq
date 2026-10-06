"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="text-4xl" aria-hidden>⛑️</p>
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">{error.message || "Please try again."}</p>
      <Button onClick={() => retry()}>
        <RotateCw aria-hidden /> Try again
      </Button>
    </div>
  );
}
