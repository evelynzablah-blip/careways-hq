import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getSession()) redirect("/");
  const { next } = await searchParams;

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Image src="/brand/CareWays_LogoMark_FullColor.svg" alt="" width={28} height={28} className="size-7" />
          <h1 className="font-heading text-[1.15rem] leading-none font-semibold tracking-tight">
            CareWays <span className="text-primary italic">HQ</span>
          </h1>
        </div>
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </div>
  );
}
