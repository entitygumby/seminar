import { NextRequest, NextResponse } from "next/server";
import { deleteRegistration, updatePaidStatus, updateRegistration } from "@/lib/db";

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
  const body = await request.json();

  // A body with only `paid` is the paid toggle; anything else is a full edit of the participant's details.
  if (!("name" in body)) {
    const updated = await updatePaidStatus(Number(id), !!body.paid);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ registration: updated });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phone = str(body.phone);
  if (!name || !email || !phone) {
    return NextResponse.json({ error: "Name, email and phone number are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const validTypes = ["saturday", "sunday", "both", "dinner_only"];
  if (!validTypes.includes(body.registration_type)) {
    return NextResponse.json({ error: "Invalid registration type" }, { status: 400 });
  }
  const type: string = body.registration_type;

  // Same rules as the public form: dinner-only always includes dinner and no lunches,
  // and a single-day registration can't include the other day's lunch.
  const updated = await updateRegistration(Number(id), {
    name,
    email,
    phone,
    dojo: str(body.dojo),
    rank: str(body.rank),
    registration_type: type,
    attend_dinner: type === "dinner_only" || !!body.attend_dinner,
    lunch_saturday: (type === "both" || type === "saturday") && !!body.lunch_saturday,
    lunch_sunday: (type === "both" || type === "sunday") && !!body.lunch_sunday,
    dietary_requirements: str(body.dietary_requirements),
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ registration: updated });
}
