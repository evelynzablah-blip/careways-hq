"use client";

import { useSyncExternalStore } from "react";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const subscribe = () => () => {};

/** Uses the viewer's local clock; falls back to "Good morning" on the server. */
export function Greeting() {
  const text = useSyncExternalStore(
    subscribe,
    () => greetingFor(new Date().getHours()),
    () => "Good morning",
  );
  return <>{text}</>;
}
