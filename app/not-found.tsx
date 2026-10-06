import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="text-4xl" aria-hidden>🧭</p>
      <h1 className="font-heading text-2xl font-semibold">This page took a different route</h1>
      <p className="text-muted-foreground">We couldn’t find what you were looking for.</p>
      <Button asChild>
        <Link href="/">Back to CareWays HQ</Link>
      </Button>
    </div>
  );
}
