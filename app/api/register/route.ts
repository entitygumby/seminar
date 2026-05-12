import { NextRequest, NextResponse } from "next/server";
import { addRegistration, getRegistrationCount } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, dojo, rank, registrationType, attendDinner, dietaryRequirements } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check capacity
    const count = await getRegistrationCount();
    if (count >= 50) {
      return NextResponse.json(
        { error: "Sorry, the seminar is at full capacity. Please contact aikido@aikidoaus.com.au for waitlist options." },
        { status: 409 }
      );
    }

    const validTypes = ["saturday", "sunday", "both", "dinner_only"];
    const regType = validTypes.includes(registrationType) ? registrationType : "both";

    const registration = await addRegistration({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      dojo: (dojo || "").trim(),
      rank: (rank || "").trim(),
      registration_type: regType,
      attend_dinner: !!attendDinner,
      dietary_requirements: (dietaryRequirements || "").trim(),
    });

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again or contact aikido@aikidoaus.com.au." },
      { status: 500 }
    );
  }
}
