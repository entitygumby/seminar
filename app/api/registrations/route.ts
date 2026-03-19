import { NextRequest, NextResponse } from "next/server";
import { getRegistrations } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Simple password-based auth via query param or Authorization header
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const queryPassword = url.searchParams.get("password");

  const providedPassword = authHeader?.replace("Bearer ", "") || queryPassword;

  if (providedPassword !== password) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registrations = await getRegistrations();

    // Support CSV export
    const format = url.searchParams.get("format");
    if (format === "csv") {
      const headers = ["ID", "Name", "Email", "Phone", "Dojo", "Rank", "Registration Type", "Dinner", "Dietary Requirements", "Registered At"];
      const rows = registrations.map((r) => [
        r.id,
        `"${r.name}"`,
        r.email,
        r.phone,
        `"${r.dojo}"`,
        r.rank,
        r.registration_type,
        r.attend_dinner ? "Yes" : "No",
        `"${r.dietary_requirements}"`,
        r.created_at,
      ].join(","));
      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=seminar-registrations.csv",
        },
      });
    }

    return NextResponse.json({ registrations, count: registrations.length });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}
