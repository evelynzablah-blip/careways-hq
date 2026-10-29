// Signed session cookie: `<email>.<expiry ms>.<HMAC-SHA256 base64url>`, keyed by
// AUTH_SECRET. Web Crypto only, so proxy.ts and server code share it.

export const SESSION_COOKIE = "cw_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmac(data: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Missing or short AUTH_SECRET");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(email: string): Promise<string> {
  const payload = `${encodeURIComponent(email)}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await hmac(payload)}`;
}

/** Returns the signed-in email, or null if the token is missing, forged or expired. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  // Split from the right: the encoded email keeps its dots (`.` isn't escaped).
  const sigAt = token.lastIndexOf(".");
  const expAt = token.lastIndexOf(".", sigAt - 1);
  if (expAt <= 0) return null;
  const email = token.slice(0, expAt);
  const exp = token.slice(expAt + 1, sigAt);
  const sig = token.slice(sigAt + 1);
  if (!safeEqual(sig, await hmac(`${email}.${exp}`))) return null;
  if (!(Number(exp) > Date.now())) return null;
  return decodeURIComponent(email);
}
