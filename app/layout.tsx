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
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8">
          <header className="mb-8 rounded-3xl border border-ink/10 bg-white/75 p-6 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-ink/55">Virtual Influencer Studio</p>
                <h1
                  className="mt-2 text-3xl text-ink sm:text-4xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Create, plan, and grow your original IG persona.
                </h1>
              </div>
              <MainNav />
            </div>
          </header>
          <main className="space-y-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
