// Server-only Supabase client. Uses the secret key, which bypasses RLS, so this
// module must never reach the browser (`server-only` fails the build if it does).

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const g = globalThis as unknown as { __carewaysSupabase?: SupabaseClient<Database> };

export function supabase(): SupabaseClient<Database> {
  if (!g.__carewaysSupabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
    g.__carewaysSupabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return g.__carewaysSupabase;
}

/** Unwraps a Supabase response, throwing so the per-widget error boundaries show. */
export function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): NonNullable<T> {
  if (res.error) throw new Error(`Supabase ${what}: ${res.error.message}`);
  if (res.data === null) throw new Error(`Supabase ${what}: no data`);
  return res.data as NonNullable<T>;
}
