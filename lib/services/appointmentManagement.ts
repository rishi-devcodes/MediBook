import { connectToDatabase } from "@/lib/db/connect";
import { Appointment, isValidObjectId } from "@/lib/models/Appointment";
import { Doctor } from "@/lib/models/Doctor";
import {
  getBookedTimes,
  isDateInDoctorAvailability,
} from "@/lib/services/appointments";

export async function cancelAppointmentForUser(
  appointmentId: string,
  userId: string
) {
  await connectToDatabase();

  if (!isValidObjectId(appointmentId) || !isValidObjectId(userId)) {
    return {
      ok: false as const,
      code: "INVALID_ID",
      message: "Invalid appointment or user.",
    };
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    userId,
  });

  if (!appointment) {
    return {
      ok: false as const,
      code: "NOT_FOUND",
      message: "Appointment not found.",
    };
  }

  if (appointment.status === "cancelled") {
    return {
      ok: false as const,
      code: "ALREADY_CANCELLED",
      message: "This appointment is already cancelled.",
    };
  }

  if (appointment.status === "completed") {
    return {
      ok: false as const,
      code: "COMPLETED",
      message: "Completed appointments cannot be cancelled.",
    };
  }

  appointment.status = "cancelled";
  await appointment.save();

  return {
    ok: true as const,
    appointment: appointment.toObject(),
  };
}

export async function rescheduleAppointmentForUser(
  appointmentId: string,
  userId: string,
  appointmentDate: string,
  appointmentTime: string
) {
  await connectToDatabase();

  if (!isValidObjectId(appointmentId) || !isValidObjectId(userId)) {
    return {
      ok: false as const,
      code: "INVALID_ID",
      message: "Invalid appointment or user.",
    };
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    userId,
  });

  if (!appointment) {
    return {
      ok: false as const,
      code: "NOT_FOUND",
      message: "Appointment not found.",
    };
  }

  if (appointment.status === "cancelled") {
    return {
      ok: false as const,
      code: "CANCELLED",
      message: "Cancelled appointments cannot be rescheduled.",
    };
  }

  if (appointment.status === "completed") {
    return {
      ok: false as const,
      code: "COMPLETED",
      message: "Completed appointments cannot be rescheduled.",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !appointmentTime) {
    return {
      ok: false as const,
      code: "INVALID_SCHEDULE",
      message: "Please select a valid date and time.",
    };
  }
  const todayInIndia = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
}).format(new Date());

if (appointmentDate < todayInIndia) {
  return {
    ok: false as const,
    code: "PAST_DATE",
    message: "Please choose a future date.",
  };
}

  const doctor = await Doctor.findById(appointment.doctorId).lean();

  if (!doctor) {
    return {
      ok: false as const,
      code: "DOCTOR_NOT_FOUND",
      message: "Doctor not found.",
    };
  }

  // Check whether the selected date is available
  const availability = isDateInDoctorAvailability(
    doctor.availability ?? [],
    appointmentDate
  );

  if (!availability.available) {
    return {
      ok: false as const,
      code: "DATE_UNAVAILABLE",
      message: "The doctor is not available on the selected date.",
    };
  }

  // Make sure the selected time is actually one of the doctor's slots
  if (!availability.slots.includes(appointmentTime)) {
    return {
      ok: false as const,
      code: "SLOT_UNAVAILABLE",
      message: "That appointment slot is not available. Please choose another time.",
    };
  }

  // getBookedTimes currently expects the doctor's slug
  const bookedTimes = await getBookedTimes(
    doctor.slug,
    appointmentDate
  );

  // Ignore the current appointment's existing slot when checking conflicts
  const isSameCurrentAppointmentSlot =
    appointment.appointmentDate === appointmentDate &&
    appointment.appointmentTime === appointmentTime;

  if (
    bookedTimes.includes(appointmentTime) &&
    !isSameCurrentAppointmentSlot
  ) {
    return {
      ok: false as const,
      code: "SLOT_ALREADY_BOOKED",
      message:
        "This slot has already been booked. Please choose another time.",
    };
  }

  try {
    const updated = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        userId,
        status: { $in: ["pending", "confirmed"] },
      },
      {
        $set: {
          appointmentDate,
          appointmentTime,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updated) {
      return {
        ok: false as const,
        code: "UPDATE_FAILED",
        message: "Unable to reschedule this appointment.",
      };
    }

    return {
      ok: true as const,
      appointment: updated,
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return {
        ok: false as const,
        code: "SLOT_ALREADY_BOOKED",
        message:
          "This slot has already been booked. Please choose another time.",
      };
    }

    throw error;
  }
}