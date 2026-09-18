import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReviewForAppointment } from "@/lib/services/reviews";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to submit a review." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = await createReviewForAppointment(
      {
        appointmentId: body.appointmentId,
        rating: body.rating,
        comment: body.comment,
      },
      session.user.id
    );

    if (!result.ok) {
      const status =
        result.code === "APPOINTMENT_NOT_FOUND"
          ? 404
          : result.code === "DOCTOR_NOT_FOUND"
            ? 404
            : result.code === "ALREADY_REVIEWED"
              ? 409
              : result.code === "APPOINTMENT_NOT_COMPLETED"
                ? 400
                : result.code === "INVALID_APPOINTMENT" ||
                    result.code === "INVALID_USER"
                  ? 400
                  : 400;

      return NextResponse.json(
        { error: result.message, code: result.code },
        { status }
      );
    }

    return NextResponse.json(
      {
        message: "Review submitted successfully.",
        review: result.review,
        rating: result.rating,
        reviewCount: result.reviewCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews failed:", error);

    return NextResponse.json(
      { error: "Unable to submit review right now. Please try again." },
      { status: 500 }
    );
  }
}