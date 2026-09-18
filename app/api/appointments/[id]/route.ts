import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import { getAppointmentById } from "@/lib/services/appointments";
import {
  cancelAppointmentForUser,
  rescheduleAppointmentForUser,
} from "@/lib/services/appointmentManagement";

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { error: "Please log in to view this appointment.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const appointment = await getAppointmentById(
      params.id,
      session.user.id
    );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("GET /api/appointments/[id] failed:", error);
    return NextResponse.json(
      { error: "Unable to load the appointment right now." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { error: "Please log in before managing an appointment.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (body?.action === "cancel") {
      const result = await cancelAppointmentForUser(
        params.id,
        session.user.id
      );

      if (!result.ok) {
        const status =
          result.code === "NOT_FOUND"
            ? 404
            : result.code === "ALREADY_CANCELLED" ||
                result.code === "COMPLETED"
              ? 409
              : 400;

        return NextResponse.json(
          { error: result.message, code: result.code },
          { status }
        );
      }

      return NextResponse.json({
        appointment: {
          id: result.appointment._id.toString(),
          status: result.appointment.status,
        },
      });
    }

    if (body?.action === "reschedule") {
      const appointmentDate = String(body?.appointmentDate ?? "").trim();
      const appointmentTime = String(body?.appointmentTime ?? "").trim();

      const result = await rescheduleAppointmentForUser(
        params.id,
        session.user.id,
        appointmentDate,
        appointmentTime
      );

      if (!result.ok) {
        const status =
          result.code === "NOT_FOUND" || result.code === "DOCTOR_NOT_FOUND"
            ? 404
            : result.code === "SLOT_ALREADY_BOOKED" ||
                result.code === "CANCELLED" ||
                result.code === "COMPLETED"
              ? 409
              : 400;

        return NextResponse.json(
          { error: result.message, code: result.code },
          { status }
        );
      }

      return NextResponse.json({
        appointment: {
          id: result.appointment._id.toString(),
          status: result.appointment.status,
          appointmentDate: result.appointment.appointmentDate,
          appointmentTime: result.appointment.appointmentTime,
        },
      });
    }

    return NextResponse.json(
      { error: "Unsupported appointment action.", code: "INVALID_ACTION" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/appointments/[id] failed:", error);
    return NextResponse.json(
      { error: "Unable to update the appointment right now." },
      { status: 500 }
    );
  }
}
