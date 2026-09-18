import { NextRequest, NextResponse } from "next/server";
import { getAllDoctors } from "@/lib/services/doctors";
import { doctorListQuerySchema } from "@/lib/validations/doctorQuery";
import type { Specialty } from "@/types/doctor";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialtyParams = searchParams.getAll("specialty");

  const parsed = doctorListQuerySchema.safeParse({
    query: searchParams.get("query") ?? undefined,
    specialty: specialtyParams.length > 0 ? specialtyParams : undefined,
    availableOnly: searchParams.get("availableOnly") ?? undefined,
    feeRangeId: searchParams.get("feeRangeId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const doctors = await getAllDoctors({
      query: parsed.data.query,
      specialties: parsed.data.specialty as Specialty[] | undefined,
      availableOnly: parsed.data.availableOnly,
      feeRangeId: parsed.data.feeRangeId,
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("GET /api/doctors failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch doctors right now. Please try again shortly." },
      { status: 500 }
    );
  }
}