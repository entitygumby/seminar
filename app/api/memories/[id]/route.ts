import { NextRequest, NextResponse } from "next/server";
import { deleteMemory, isAdmin, updateMemory } from "@/lib/memories";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const patch: Parameters<typeof updateMemory>[1] = {};
  if (["pending", "approved", "rejected"].includes(body.status)) patch.status = body.status;
  for (const key of ["name", "dojo", "since_year", "message"] as const) {
    if (typeof body[key] === "string") patch[key] = body[key];
  }
  if (Array.isArray(body.photos)) patch.photos = body.photos;

  const updated = await updateMemory(Number(id), patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ memory: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const removed = await deleteMemory(Number(id));
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blobUrls = removed.photos.map((p) => p.url).filter((u) => u.startsWith("https://"));
  if (blobUrls.length && process.env.BLOB_READ_WRITE_TOKEN) {
    const { del } = await import("@vercel/blob");
    await del(blobUrls).catch((err) => console.error("Blob cleanup failed:", err));
  }
  return NextResponse.json({ success: true });
}
