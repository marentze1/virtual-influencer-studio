-- CreateTable
CREATE TABLE "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "displayName" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "influencer_profiles" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT,
  "handle" TEXT,
  "niche" TEXT NOT NULL,
  "targetAudience" TEXT NOT NULL,
  "vibe" TEXT NOT NULL,
  "values" TEXT NOT NULL,
  "boundaries" TEXT NOT NULL,
  "languages" TEXT NOT NULL,
  "postingFrequency" TEXT NOT NULL,
  "growthGoal" TEXT NOT NULL,
  "referenceFaceImageId" TEXT,
  "bodyDescriptors" TEXT,
  "styleRules" TEXT,
  "cameraStyle" TEXT,
  "recurringLocations" TEXT,
  "personaBio" TEXT,
  "whyExists" TEXT,
  "backstory" TEXT,
  "personalityTraits" TEXT,
  "toneRules" TEXT,
  "doRules" TEXT,
  "dontRules" TEXT,
  "brandColors" TEXT,
  "captionStyle" TEXT,
  "emojiRules" TEXT,
  "photographyStyle" TEXT,
  "recurringMotifs" TEXT,
  "contentPillars" TEXT,
  "nameIdeas" TEXT,
  "handleSuggestions" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "influencer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trend_inputs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL DEFAULT 'BRIEF',
  "title" TEXT,
  "rawText" TEXT NOT NULL,
  "sourceLinks" TEXT,
  "summary" TEXT,
  "themes" TEXT,
  "hooks" TEXT,
  "angles" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "trend_inputs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_calendar" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "profileId" TEXT,
  "date" DATETIME NOT NULL,
  "format" TEXT NOT NULL,
  "concept" TEXT NOT NULL,
  "caption" TEXT NOT NULL,
  "cta" TEXT NOT NULL,
  "hashtags" TEXT NOT NULL,
  "promptJson" TEXT NOT NULL,
  "safetyChecklist" TEXT NOT NULL,
  "pillar" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "content_calendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "content_calendar_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "influencer_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_briefs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "date" DATETIME NOT NULL,
  "payload" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "daily_briefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assets" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "profileId" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT,
  "filePath" TEXT,
  "mimeType" TEXT,
  "promptJson" TEXT,
  "captionText" TEXT,
  "tags" TEXT,
  "outfit" TEXT,
  "location" TEXT,
  "pillar" TEXT,
  "assetDate" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "assets_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "influencer_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "metrics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "date" DATETIME NOT NULL,
  "followers" INTEGER NOT NULL,
  "reach" INTEGER NOT NULL,
  "likes" INTEGER NOT NULL,
  "comments" INTEGER NOT NULL,
  "saves" INTEGER NOT NULL,
  "engagementRate" REAL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "influencer_profiles_userId_idx" ON "influencer_profiles"("userId");

-- CreateIndex
CREATE INDEX "trend_inputs_userId_idx" ON "trend_inputs"("userId");

-- CreateIndex
CREATE INDEX "content_calendar_userId_date_idx" ON "content_calendar"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_briefs_userId_date_key" ON "daily_briefs"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_briefs_userId_idx" ON "daily_briefs"("userId");

-- CreateIndex
CREATE INDEX "assets_userId_createdAt_idx" ON "assets"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_userId_date_key" ON "metrics"("userId", "date");

-- CreateIndex
CREATE INDEX "metrics_userId_idx" ON "metrics"("userId");
