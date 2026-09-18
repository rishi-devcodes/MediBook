import { NextRequest, NextResponse } from "next/server";
import { getDoctorBySlug } from "@/lib/services/doctors";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  if (!id || id.trim().length === 0) {
    return NextResponse.json({ error: "A doctor id is required." }, { status: 400 });
  }

  try {
    const doctor = await getDoctorBySlug(id);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error(`GET /api/doctors/${id} failed:`, error);
    return NextResponse.json(
      { error: "Unable to fetch this doctor right now. Please try again shortly." },
      { status: 500 }
    );
  }
}