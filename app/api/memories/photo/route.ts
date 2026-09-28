import { NextRequest, NextResponse } from "next/server";
import { isBlobUrl } from "@/lib/memories";

// Serves photos from a private Blob store. Blob URLs carry a random suffix and never
// change, so responses can be cached for a long time.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("u") || "";
  if (!isBlobUrl(url)) return new NextResponse("Not found", { status: 404 });

  const { get } = await import("@vercel/blob");
  const result = await get(url, { access: "private" }).catch((err) => {
    console.error("Blob read failed:", err);
    return null;
  });
  if (!result || result.statusCode !== 200) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
