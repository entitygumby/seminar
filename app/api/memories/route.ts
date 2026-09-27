import { NextRequest, NextResponse } from "next/server";
import { addMemory, ERAS, getMemories, storageStatus, toPublic, type Era, type MemoryPhoto } from "@/lib/memories";

export const dynamic = "force-dynamic";

const MAX_PHOTOS = 6;
const MAX_MESSAGE = 1200;

export async function GET() {
  const memories = await getMemories("approved");
  return NextResponse.json({ memories: memories.map(toPublic) });
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function isAllowedUrl(url: string): boolean {
  if (url.startsWith("data:image/")) return !process.env.BLOB_READ_WRITE_TOKEN;
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!storageStatus().acceptingUploads) {
    console.error("Contribution refused: Postgres or Blob storage is not configured for this deployment");
    return NextResponse.json(
      { error: "Contributions are temporarily unavailable. Please try again later or email aikido@aikidoaus.com.au." },
      { status: 503 }
    );
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Honeypot — real people never fill this in.
  if (body.website) return NextResponse.json({ success: true });

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const message = str(body.message, MAX_MESSAGE);
  const rawPhotos: unknown[] = Array.isArray(body.photos) ? body.photos.slice(0, MAX_PHOTOS) : [];

  const photos: MemoryPhoto[] = [];
  for (const p of rawPhotos) {
    const photo = p as Record<string, unknown>;
    const url = str(photo.url, 10_000_000);
    if (!isAllowedUrl(url)) {
      return NextResponse.json({ error: "One of the photos could not be verified. Please re-upload it." }, { status: 400 });
    }
    photos.push({
      url,
      caption: str(photo.caption, 200),
      era: ERAS.includes(photo.era as Era) ? (photo.era as Era) : "Undated",
      width: Number(photo.width) || 0,
      height: Number(photo.height) || 0,
    });
  }

  if (!name || !email) {
    return NextResponse.json({ error: "Please provide your name and email" }, { status: 400 });
  }
  if (!message && photos.length === 0) {
    return NextResponse.json({ error: "Please add a message or at least one photo" }, { status: 400 });
  }
  if (!body.consent) {
    return NextResponse.json({ error: "Please confirm the consent statement" }, { status: 400 });
  }

  await addMemory({
    name,
    email,
    dojo: str(body.dojo, 120),
    since_year: str(body.since_year, 4),
    message,
    photos,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
