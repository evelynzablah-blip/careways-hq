// Every page and Server Action needs a session; signed-out requests go to /login.

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const email = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (email) return NextResponse.next();
  if (request.method !== "GET") return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL("/login", request.url);
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the login page, Next assets and public images (next/image
  // fetches those without the cookie).
  matcher: ["/((?!login|_next/static|_next/image|.*\\.(?:jpg|png|svg|ico)$).*)"],
};
