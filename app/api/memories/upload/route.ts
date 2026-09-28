import { NextRequest, NextResponse } from "next/server";
import { hasBlob, storageStatus } from "@/lib/memories";

const MAX_BYTES = 4 * 1024 * 1024; // photos are resized in the browser before upload
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  if (!storageStatus().acceptingUploads) {
    console.error("Photo upload refused: Postgres or Blob storage is not configured for this deployment");
    return NextResponse.json(
      { error: "Uploads are temporarily unavailable. Please try again later or email aikido@aikidoaus.com.au." },
      { status: 503 }
    );
  }
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Please upload a JPEG, PNG or WebP image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large" }, { status: 413 });
  }

  // Without Blob storage configured (local dev), keep the image inline as a data URL.
  if (!hasBlob()) {
    const buf = Buffer.from(await file.arrayBuffer());
    return NextResponse.json({ url: `data:${file.type};base64,${buf.toString("base64")}` });
  }

  const { put } = await import("@vercel/blob");
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  // Stores are created either private or public; try private first (photos then load via
  // /api/memories/photo) and fall back to public for a public store.
  let lastError: unknown;
  for (const access of ["private", "public"] as const) {
    try {
      const blob = await put(`memories/photo.${ext}`, file, { access, addRandomSuffix: true, contentType: file.type });
      return NextResponse.json({ url: blob.url });
    } catch (err) {
      lastError = err;
    }
  }
  console.error("Blob upload failed:", lastError);
  return NextResponse.json({ error: "Upload failed" }, { status: 502 });
}
