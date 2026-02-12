import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureDemoUser } from "@/lib/planner";
import { prisma } from "@/lib/db";
import { zonedDate } from "@/lib/time";

export const runtime = "nodejs";

function parseList(value: string): string[] {
  return value
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "Missing file" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".bin";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const absolutePath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  const filePath = `/uploads/${filename}`;

  const asset = await prisma.asset.create({
    data: {
      userId: user.id,
      type: "IMAGE",
      title: String(formData.get("title") ?? file.name),
      filePath,
      mimeType: file.type,
      tags: parseList(String(formData.get("tags") ?? "")),
      pillar: String(formData.get("pillar") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      outfit: String(formData.get("outfit") ?? "") || null,
      assetDate: String(formData.get("assetDate") ?? "")
        ? zonedDate(String(formData.get("assetDate")), user.timezone)
        : null
    }
  });

  return Response.json({ ok: true, asset, filePath });
}
