import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 4 * 1024 * 1024; // photos are resized in the browser before upload
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const buf = Buffer.from(await file.arrayBuffer());
    return NextResponse.json({ url: `data:${file.type};base64,${buf.toString("base64")}` });
  }

  const { put } = await import("@vercel/blob");
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const blob = await put(`memories/photo.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return NextResponse.json({ url: blob.url });
}
