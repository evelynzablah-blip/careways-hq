"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [error, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Email
        <Input name="email" type="email" autoComplete="username" required autoFocus className="h-9" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Password
        <Input name="password" type="password" autoComplete="current-password" required className="h-9" />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-1 h-9">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
