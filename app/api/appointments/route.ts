import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";
import { appointmentSchema } from "@/lib/validations/appointment";
import { createAppointment } from "@/lib/services/appointments";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ error: "Please log in before booking an appointment.", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the booking details.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createAppointment(parsed.data, session.user.id);

    if (!result.ok) {
      const status =
        result.code === "DOCTOR_NOT_FOUND" || result.code === "INVALID_DOCTOR"
          ? 404
          : result.code === "SLOT_ALREADY_BOOKED"
            ? 409
            : 400;

      return NextResponse.json({ error: result.message, code: result.code }, { status });
    }

    return NextResponse.json(
      {
        appointment: {
          id: result.appointment._id.toString(),
          status: result.appointment.status,
          appointmentDate: result.appointment.appointmentDate,
          appointmentTime: result.appointment.appointmentTime,
          consultationFee: result.appointment.consultationFee,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/appointments failed:", error);
    return NextResponse.json(
      { error: "Unable to create the appointment right now. Please try again." },
      { status: 500 }
    );
  }
}
