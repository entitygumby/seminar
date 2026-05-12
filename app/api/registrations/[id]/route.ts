import { NextRequest, NextResponse } from "next/server";
import { deleteRegistration, updatePaidStatus } from "@/lib/db";

function authorize(request: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const url = new URL(request.url);
  const provided =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    url.searchParams.get("password");
  return provided === password;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deleteRegistration(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { paid } = await request.json();
  const updated = await updatePaidStatus(Number(id), !!paid);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ registration: updated });
}
