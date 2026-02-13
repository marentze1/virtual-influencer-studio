import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Virtual Influencer Studio",
  description: "Create, plan, and scale original virtual influencer content with consistent prompt JSON outputs."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-16 pt-5 sm:px-8 lg:px-12">
          <header className="sticky top-4 z-50 rounded-[24px] border border-ink/10 bg-white/80 p-4 shadow-soft backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink/45">Virtual Influencer Studio</p>
                <h1 className="mt-1 text-2xl text-ink sm:text-3xl">Create avatars. Shape persona. Generate daily visuals.</h1>
              </div>
              <MainNav />
            </div>
          </header>

          <main className="mt-6 space-y-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
