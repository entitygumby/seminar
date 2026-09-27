import { NextRequest, NextResponse } from "next/server";
import { getMemories, isAdmin, storageStatus } from "@/lib/memories";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const memories = await getMemories();
  return NextResponse.json({ memories, storage: storageStatus() });
}
