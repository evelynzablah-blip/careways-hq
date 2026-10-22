// Single-admin auth. Credentials live in env vars only:
//   ADMIN_EMAIL, ADMIN_PASSWORD_HASH ("scrypt:<salt b64>:<hash b64>"), AUTH_SECRET.
// proxy.ts redirects signed-out requests; requireSession() re-checks in Server
// Actions and the root layout, since the proxy alone is only an optimistic check.

import "server-only";
import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./session";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function getSession(): Promise<string | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<string> {
  const email = await getSession();
  if (!email) throw new Error("Not signed in");
  return email;
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const [scheme, salt, hash] = (process.env.ADMIN_PASSWORD_HASH ?? "").split(":");
  if (!adminEmail || scheme !== "scrypt" || !salt || !hash) throw new Error("Auth is not configured");
  const expected = Buffer.from(hash, "base64");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length);
  // Always run scrypt, so a wrong email takes as long as a wrong password.
  return timingSafeEqual(actual, expected) && email.trim().toLowerCase() === adminEmail;
}
