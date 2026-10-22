import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuickAddProvider } from "@/components/quick-add/quick-add-provider";
import { MobileTopBar, SIDEBAR_COOKIE, Sidebar } from "@/components/shell/sidebar";
import { getSession } from "@/lib/auth";
import { getPickers } from "@/lib/queries";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT"] });

export const metadata: Metadata = {
  title: { default: "CareWays HQ", template: "%s · CareWays HQ" },
  description: "Director dashboard for CareWays Collaborative — stronger critical care, healthier communities, brighter tomorrows.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Signed out (only /login gets past proxy.ts): no shell, no data.
  if (!(await getSession())) {
    return (
      <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`}>
        <body className="min-h-dvh">{children}</body>
      </html>
    );
  }
  const cookieStore = await cookies();
  // Not awaited: Quick Add resolves it with use(), so the shell streams immediately.
  const pickers = getPickers();
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <TooltipProvider delayDuration={200}>
          <QuickAddProvider pickers={pickers}>
            <div className="flex min-h-dvh">
              <Sidebar initialCollapsed={collapsed} />
              <div className="flex min-w-0 flex-1 flex-col">
                <MobileTopBar />
                <main id="main" className="flex-1">
                  {children}
                </main>
              </div>
            </div>
          </QuickAddProvider>
        </TooltipProvider>
        <Toaster theme="light" position="bottom-right" closeButton />
      </body>
    </html>
  );
}
