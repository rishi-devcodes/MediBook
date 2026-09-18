import { NextRequest, NextResponse } from "next/server";
import {
  getDoctorBySlug,
} from "@/lib/services/doctors";
import {
  getBookedTimes,
  isDateInDoctorAvailability,
} from "@/lib/services/appointments";

interface RouteParams {
  params: { id: string };
}

function getTodayInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function getCurrentMinutesInIndia(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0
  );

  return hour * 60 + minute;
}

function slotToMinutes(slot: string): number | null {
  const match = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  if (period === "AM") {
    if (hour === 12) hour = 0;
  } else {
    if (hour !== 12) hour += 12;
  }

  return hour * 60 + minute;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const doctorId = params.id;
  const date = new URL(request.url).searchParams.get("date");

  if (!doctorId) {
    return NextResponse.json(
      { error: "A doctor id is required." },
      { status: 400 }
    );
  }

  const doctor = await getDoctorBySlug(doctorId);

  if (!doctor) {
    return NextResponse.json(
      { error: "Doctor not found." },
      { status: 404 }
    );
  }

  if (!date) {
    return NextResponse.json({
      availability: doctor.availability,
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid date." },
      { status: 400 }
    );
  }

  const today = getTodayInIndia();

  // Past dates should never show bookable slots.
  if (date < today) {
    return NextResponse.json({
      date,
      slots: [],
    });
  }

  const availability = isDateInDoctorAvailability(
    doctor.availability,
    date
  );

  if (!availability.available) {
    return NextResponse.json({
      date,
      slots: [],
    });
  }

  try {
    const bookedTimes = await getBookedTimes(doctor.id, date);

    let availableSlots = availability.slots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    // If the selected date is today, remove already-passed slots.
    if (date === today) {
      const currentMinutes = getCurrentMinutesInIndia();

      availableSlots = availableSlots.filter((slot) => {
        const slotMinutes = slotToMinutes(slot);

        // If a slot has an unexpected format, don't expose it.
        if (slotMinutes === null) return false;

        return slotMinutes > currentMinutes;
      });
    }

    return NextResponse.json({
      date,
      slots: availableSlots,
    });
  } catch (error) {
    console.error(
      `GET /api/doctors/${doctorId}/slots failed:`,
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to fetch available slots right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}