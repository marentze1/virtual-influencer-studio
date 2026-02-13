import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { MainNav } from "@/components/main-nav";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Virtual Influencer Studio",
  description: "Build and run an original virtual influencer strategy for Instagram."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans`}>
        <div className="mx-auto min-h-screen w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-8">
          <header className="space-y-4">
            <div className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-soft backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">Virtual Influencer Studio</p>
                  <h1 className="text-2xl text-ink sm:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
                    Design once. Publish daily. Stay consistent.
                  </h1>
                </div>
                <MainNav />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-ink px-6 py-8 text-stone shadow-soft">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#3f7cff]/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-20 h-56 w-56 rounded-full bg-[#96c9ff]/20 blur-3xl" />
              <div className="relative grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-stone/70">Guided Journey</p>
                  <p className="mt-2 text-3xl leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>
                    Create an original influencer, lock identity, and generate scene-ready prompts in minutes.
                  </p>
                </div>
                <div className="rounded-2xl border border-stone/20 bg-white/5 p-4 text-sm text-stone/85">
                  <p className="font-medium text-stone">Core safety</p>
                  <p className="mt-2">No celebrity cloning. Non-explicit content only. Identity consistency enforced in every prompt JSON.</p>
                </div>
              </div>
            </div>
          </header>

          <main className="mt-6 space-y-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
