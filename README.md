# Virtual Influencer Studio

A full-stack Next.js app to create and run an original, brand-safe virtual influencer workflow for Instagram planning.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL (Supabase-ready)
- Server Actions + API Routes

## What the MVP includes

- Onboarding wizard (`/onboarding`) to define niche, audience, vibe, values, boundaries, languages, posting frequency, growth goal, visual identity rules, and optional reference face upload.
- Editable Influencer Bible (`/profile`) with persona, voice/tone, brand kit fields, content pillars, and generated name/handle options.
- Prompt Builder panel on `/profile` for preset-based JSON prompt generation with identity lock + negatives.
- Trend research page (`/trends`) using user-provided notes/links/briefs (paste or text-file upload) + extracted themes/hooks/angles.
- Monthly planner (`/calendar`) that generates a month of content items with:
  - format (post/story/carousel/reel)
  - concept
  - caption + CTA + hashtags
  - image prompt JSON templates
  - safety & originality checklist
- Daily brief (`/today`) for mission, shot list, caption, hashtags, prompt JSON, plus copy/download JSON/download TXT export.
- Asset library (`/assets`) to store prompt/caption exports and uploaded images with tags.
- Basic growth tracker (`/analytics`) with manual metrics and performance summary.
- Settings (`/settings`) for timezone (default `Europe/Berlin`) and local workspace identity.

## Safety/Compliance defaults

- Original influencer only (no celebrity/public figure references).
- Non-explicit content only (fashion/travel/photography/lifestyle).
- No automatic Instagram posting in this MVP.
- Optional connectors are stubs only (trend adapters, image generation provider adapter).

## Prompt system

- `generatePromptJSON()` returns a consistent JSON structure with:
  - identity lock (`reference_image_id`, lock face/hair/skin tone)
  - body consistency descriptors
  - style constants (aspect ratio, lens look, lighting, background)
  - strong negative prompts for identity drift/deformities/CGI look
- Presets include:
  - studio portrait
  - street fashion
  - airport/travel
  - cafe laptop
  - golden-hour city walk
  - museum/gallery
  - rooftop sunset

## One-click style deployment (Vercel + Supabase, no local install)

1. Push this project to a GitHub repository.
2. Create a Supabase project and copy connection strings.
3. Import the GitHub repo in Vercel.
4. Set environment variables in Vercel:
   - `DATABASE_URL` (Supabase pooler URL, port `6543`)
   - `DIRECT_URL` (Supabase direct URL, port `5432`)
   - `DEMO_USER_EMAIL` (any email, e.g. `creator@virtualstudio.local`)
   - Optional: `LLM_API_URL`, `LLM_API_KEY`
5. Deploy. The build script runs Prisma schema sync automatically.

Then open your live Vercel URL and complete onboarding.

## Local setup (optional)

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Sync Prisma schema + generate client:

```bash
npx prisma db push
```

4. Seed sample data (one influencer profile + one example monthly plan + brief + metrics):

```bash
npm run prisma:seed
```

5. Start development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Database models

Prisma models mapped to required tables:

- `users`
- `influencer_profiles`
- `trend_inputs`
- `content_calendar`
- `daily_briefs`
- `assets`
- `metrics`

## LLM integration

`/lib/llm.ts` exposes:

- `generateTextPlan()`
- `generatePromptJSON()`

If `LLM_API_URL` and `LLM_API_KEY` are not set, deterministic mock output is used, so the app remains runnable locally.

## Optional image generation connector

A provider interface + stub is implemented:

- `/lib/image-connectors/types.ts`
- `/lib/image-connectors/stub.ts`
- `/app/api/image-generate/route.ts`

Replace the stub with your provider adapter (e.g., Nano Banana-compatible) behind the same interface.
