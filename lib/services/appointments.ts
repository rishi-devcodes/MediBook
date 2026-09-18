import { connectToDatabase } from "@/lib/db/connect";
import { Appointment, isValidObjectId } from "@/lib/models/Appointment";
import { Doctor } from "@/lib/models/Doctor";
import type { AppointmentInput } from "@/lib/validations/appointment";

function parseAvailabilityDate(label: string, year: number): string | null {
  const match = label.trim().match(/^(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?$/);
  if (!match) return null;

  const day = Number(match[1]);
  const monthIndex = new Date(`${match[2]} 1, ${match[3] ?? year}`).getMonth();
  if (!Number.isInteger(monthIndex)) return null;

  const targetYear = Number(match[3] ?? year);
  const date = new Date(Date.UTC(targetYear, monthIndex, day));
  if (
    date.getUTCFullYear() !== targetYear ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${targetYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isDateInDoctorAvailability(
  availability: Array<{ date: string; slots: string[] }>,
  appointmentDate: string
): { available: boolean; slots: string[] } {
  const requestedYear = Number(appointmentDate.slice(0, 4));

  for (const day of availability) {
    const parsed = parseAvailabilityDate(day.date, requestedYear);
    if (parsed === appointmentDate) {
      return { available: true, slots: day.slots ?? [] };
    }
  }

  return { available: false, slots: [] };
}

export async function createAppointment(input: AppointmentInput, userId: string) {
  await connectToDatabase();

  const doctor = await Doctor.findOne({ slug: input.doctorId }).lean();
  if (!doctor) {
    return { ok: false as const, code: "DOCTOR_NOT_FOUND", message: "Doctor not found." };
  }

  if (!doctor.consultationTypes.includes(input.consultationType)) {
    return {
      ok: false as const,
      code: "INVALID_CONSULTATION_TYPE",
      message: "This consultation type is not available for this doctor.",
    };
  }
  const availability = isDateInDoctorAvailability(doctor.availability ?? [], input.appointmentDate);
  if (!availability.available || !availability.slots.includes(input.appointmentTime)) {
    return {
      ok: false as const,
      code: "SLOT_UNAVAILABLE",
      message: "That appointment slot is no longer available. Please choose another slot.",
    };
  }

  const todayInIndia = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
}).format(new Date());

if (input.appointmentDate < todayInIndia) {
  return {
    ok: false as const,
    code: "PAST_DATE",
    message: "Please choose a future date.",
  };
}

  try {
    const appointment = await Appointment.create({
      doctorId: doctor._id,
      userId,
      patientName: input.patientName,
      patientAge: input.patientAge,
      patientGender: input.patientGender,
      patientPhone: input.patientPhone,
      patientEmail: input.patientEmail,
      reason: input.reason,
      consultationType: input.consultationType,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      consultationFee: doctor.consultationFee,
      status: "pending",
    });

    return { ok: true as const, appointment };
  } catch (error: unknown) {
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        ok: false as const,
        code: "SLOT_ALREADY_BOOKED",
        message: "Someone just booked this slot. Please choose another time.",
      };
    }
    throw error;
  }
}

export async function getAppointmentById(id: string, userId?: string) {
  await connectToDatabase();
  if (!isValidObjectId(id)) return null;
  if (userId && !isValidObjectId(userId)) return null;

  const filter = userId ? { _id: id, userId } : { _id: id };
  return Appointment.findOne(filter).populate(
  "doctorId",
  "name slug specialty photoUrl consultationFee clinicName clinicLocation"
).lean();
}

export async function getBookedTimes(doctorId: string, appointmentDate: string): Promise<string[]> {
  await connectToDatabase();
  const doctor = await Doctor.findOne({ slug: doctorId }, { _id: 1 }).lean();
  if (!doctor) return [];

  const appointments = await Appointment.find(
    { doctorId: doctor._id, appointmentDate, status: { $in: ["pending", "confirmed"] } },
    { appointmentTime: 1, _id: 0 }
  ).lean();

  return appointments.map((appointment) => appointment.appointmentTime);
}

export async function confirmAppointment(id: string) {
  await connectToDatabase();
  if (!isValidObjectId(id)) return null;
  return Appointment.findOneAndUpdate(
    { _id: id, status: "pending" },
    { $set: { status: "confirmed" } },
    { new: true }
  ).lean();
}

export async function getAppointmentsForUser(userId: string) {
  await connectToDatabase();

  if (!isValidObjectId(userId)) {
    return [];
  }

  return Appointment.find({ userId })
    .populate(
      "doctorId",
      "name specialty photoUrl consultationFee clinicName clinicLocation"
    )
    .sort({
      appointmentDate: 1,
      appointmentTime: 1,
      createdAt: -1,
    })
    .lean();
}
export async function markPastAppointmentsCompleted(userId: string) {
  await connectToDatabase();

  const now = new Date();

  const today = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const appointments = await Appointment.find({
  userId,
  appointmentDate: { $lte: today },
  status: "confirmed",
}).lean();

  const idsToComplete = appointments
    .filter((appointment) => {
      if (appointment.appointmentDate < today) {
        return true;
      }

      const match = appointment.appointmentTime
        .trim()
        .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

      if (!match) {
        return false;
      }

      let hours = Number(match[1]);
      const minutes = Number(match[2]);
      const period = match[3].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      }

      if (period === "AM" && hours === 12) {
        hours = 0;
      }

      const appointmentMinutes = hours * 60 + minutes;

      return appointmentMinutes < currentMinutes;
    })
    .map((appointment) => appointment._id);

  if (idsToComplete.length === 0) {
    return 0;
  }

  const result = await Appointment.updateMany(
    {
      _id: { $in: idsToComplete },
      userId,
      status: "confirmed",
    },
    {
      $set: { status: "completed" },
    }
  );

  return result.modifiedCount;
}
