import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import Link from "next/link";
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
        <div className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
              <div className="flex h-full flex-col gap-5 rounded-3xl border border-ink/10 bg-white/75 p-5 shadow-soft backdrop-blur">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink/55">Virtual Influencer Studio</p>
                  <h1 className="mt-2 text-2xl text-ink" style={{ fontFamily: "var(--font-serif)" }}>
                    Creator Control
                  </h1>
                  <p className="mt-1 text-sm text-ink/70">
                    Original influencer planning stack. Brand-safe only.
                  </p>
                </div>
                <MainNav />
                <div className="mt-auto rounded-2xl border border-ink/10 bg-white/70 p-3 text-xs text-ink/70">
                  Timezone default: <span className="font-medium text-ink">Europe/Berlin</span>
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <header className="rounded-3xl border border-ink/10 bg-white/75 p-6 shadow-soft backdrop-blur">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-ink/55">Studio Workspace</p>
                    <h2 className="mt-2 text-3xl text-ink sm:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>
                      Build, lock, and scale your virtual persona.
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TopAction href="/character-lab" label="Character Lab" />
                    <TopAction href="/onboarding" label="Run Wizard" />
                    <TopAction href="/today" label="Today Brief" />
                  </div>
                </div>
              </header>

              <main className="space-y-6">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

function TopAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm text-ink hover:border-ink/45">
      {label}
    </Link>
  );
}
