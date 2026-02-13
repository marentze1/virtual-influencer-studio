import Image from "next/image";
import Link from "next/link";
import { CreateAvatarStudio } from "@/components/create-avatar-studio";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const user = await ensureDemoUser();
  const profiles = await prisma.influencerProfile.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#8db5ff]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-[#d3defa]/35 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Create Avatar</p>
            <h2 className="mt-2 max-w-[18ch] text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Build an original influencer identity in one guided flow.
            </h2>
            <p className="mt-4 max-w-[60ch] text-sm text-ink/70">
              Choose appearance traits, generate 10 names, check handle hints, upload inspiration, and export 4 first-generation JSON prompts with no input images.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge text="Original only" />
              <Badge text="Brand-safe" />
              <Badge text="No explicit content" />
              <Badge text="Identity consistency" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative h-44 w-full overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                alt="Fashion inspiration"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="relative h-44 w-full overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                alt="Street style inspiration"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="relative h-44 w-full overflow-hidden rounded-2xl sm:col-span-2">
              <Image
                src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80"
                alt="Travel mood"
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Avatar Collection</p>
            <h3 className="text-xl font-semibold text-ink">Saved avatars</h3>
          </div>
          {profiles.length > 0 ? (
            <Link href={`/persona?profileId=${profiles[0]?.id}`} className="muted-button inline-flex items-center px-4 py-2 text-sm">
              Edit latest avatar
            </Link>
          ) : null}
        </div>

        {profiles.length === 0 ? (
          <p className="mt-3 text-sm text-ink/70">No avatars yet. Create your first one below.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <article key={profile.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                <p className="text-base font-semibold text-ink">{profile.name ?? "Untitled Avatar"}</p>
                <p className="mt-1 text-sm text-ink/65">@{profile.handle ?? "no_handle"}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.1em] text-ink/55">{profile.vibe}</p>
                <div className="mt-3 flex gap-2">
                  <Link href={`/persona?profileId=${profile.id}`} className="muted-button inline-flex items-center px-3 py-1.5 text-xs">
                    Edit persona
                  </Link>
                  <Link href={`/studio?profileId=${profile.id}`} className="muted-button inline-flex items-center px-3 py-1.5 text-xs">
                    Open studio
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CreateAvatarStudio />
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-ink/15 bg-white px-3 py-1 text-xs uppercase tracking-[0.08em] text-ink/65">
      {text}
    </span>
  );
}
