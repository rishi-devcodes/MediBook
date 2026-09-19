import { connectToDatabase } from "@/lib/db/connect";
import {
  Doctor as DoctorModel,
  type DoctorSchemaType,
} from "@/lib/models/Doctor";
import { FEE_RANGES } from "@/lib/constants";
import type {
  Doctor,
  DayAvailability,
  Specialty,
} from "@/types/doctor";

export interface DoctorListFilters {
  query?: string;
  specialties?: Specialty[];
  availableOnly?: boolean;
  feeRangeId?: string;
}

// Shape of a lean (plain object) Mongoose doc for Doctor.
type LeanDoctor = DoctorSchemaType & { slug: string };

type AvailabilityEntry = {
  day: string;
  date: string;
  slots: string[];
};

type AvailabilityMeta = {
  isAvailableToday: boolean;
  nextAvailableLabel: string;
};

const IST_TIME_ZONE = "Asia/Kolkata";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getIndiaDateTime() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function parseSlotToMinutes(slot: string): number {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    return Number.POSITIVE_INFINITY;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  return hour * 60 + minute;
}

function formatIndiaDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: IST_TIME_ZONE,
  }).format(date);
}

function getDynamicAvailabilityMeta(
  availability: AvailabilityEntry[]
): AvailabilityMeta {
  if (!availability.length) {
    return {
      isAvailableToday: false,
      nextAvailableLabel: "No upcoming availability",
    };
  }

  const now = getIndiaDateTime();
  const currentMinutes = now.hour * 60 + now.minute;

  const currentDate = new Date();

  const todayLabel = formatIndiaDate(currentDate);

  const tomorrowDate = new Date(currentDate);
  tomorrowDate.setDate(currentDate.getDate() + 1);

  const tomorrowLabel = formatIndiaDate(tomorrowDate);

  for (const entry of availability) {
    if (!entry.slots || entry.slots.length === 0) {
      continue;
    }

    const isToday = entry.date === todayLabel;

    // For today, remove slots that have already passed.
    // For future dates, all stored slots are considered valid.
    const validSlots = isToday
      ? entry.slots.filter(
          (slot) => parseSlotToMinutes(slot) > currentMinutes
        )
      : entry.slots;

    if (validSlots.length === 0) {
      continue;
    }

    if (isToday) {
      return {
        isAvailableToday: true,
        nextAvailableLabel: `Today, ${validSlots[0]}`,
      };
    }

    if (entry.date === tomorrowLabel) {
      return {
        isAvailableToday: false,
        nextAvailableLabel: `Tomorrow, ${validSlots[0]}`,
      };
    }

    return {
      isAvailableToday: false,
      nextAvailableLabel: `${entry.day}, ${validSlots[0]}`,
    };
  }

  return {
    isAvailableToday: false,
    nextAvailableLabel: "No upcoming availability",
  };
}

function toDoctorDTO(doc: LeanDoctor): Doctor {
  const availability = (doc.availability ?? []) as AvailabilityEntry[];

  const availabilityMeta = getDynamicAvailabilityMeta(availability);

  return {
    id: doc.slug,
    name: doc.name,
    photoUrl: doc.photoUrl,
    specialty: doc.specialty as Specialty,
    qualifications: doc.qualifications ?? [],
    experienceYears: doc.experienceYears,
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    consultationFee: doc.consultationFee,
    consultationTypes:
      (doc.consultationTypes ?? []) as Doctor["consultationTypes"],
    languages: doc.languages ?? [],
    about: doc.about,
    clinicName: doc.clinicName,
    clinicLocation: doc.clinicLocation,
    verified: doc.verified ?? false,

    // Calculate these from the actual stored availability
    // instead of using stale seeded values.
    isAvailableToday: availabilityMeta.isAvailableToday,
    nextAvailableLabel: availabilityMeta.nextAvailableLabel,

    availability: availability as DayAvailability[],
    reviews: (doc.reviews ?? []) as Doctor["reviews"],
  };
}

export async function getAllDoctors(
  filters: DoctorListFilters = {}
): Promise<Doctor[]> {
  await connectToDatabase();

  const mongoFilter: Record<string, unknown> = {};

  if (filters.specialties && filters.specialties.length > 0) {
    mongoFilter.specialty = {
      $in: filters.specialties,
    };
  }

  if (filters.feeRangeId) {
    const range = FEE_RANGES.find(
      (r) => r.id === filters.feeRangeId
    );

    if (range && range.id !== "any") {
      const feeFilter: Record<string, number> = {
        $gte: range.min,
      };

      if (Number.isFinite(range.max)) {
        feeFilter.$lte = range.max;
      }

      mongoFilter.consultationFee = feeFilter;
    }
  }

  if (filters.query && filters.query.trim().length > 0) {
    const regex = new RegExp(
      escapeRegExp(filters.query.trim()),
      "i"
    );

    mongoFilter.$or = [
      { name: regex },
      { specialty: regex },
    ];
  }

  const docs = await DoctorModel.find(mongoFilter)
    .sort({ rating: -1 })
    .lean();

  const doctors = docs.map((doc) =>
    toDoctorDTO(doc as unknown as LeanDoctor)
  );

  // Use dynamically calculated availability rather than
  // the old static database flag.
  if (filters.availableOnly) {
    return doctors.filter(
      (doctor) => doctor.isAvailableToday
    );
  }

  return doctors;
}

export async function getDoctorBySlug(
  slug: string
): Promise<Doctor | null> {
  await connectToDatabase();

  const doc = await DoctorModel.findOne({
    slug,
  }).lean();

  if (!doc) {
    return null;
  }

  return toDoctorDTO(
    doc as unknown as LeanDoctor
  );
}

export async function getFeaturedDoctors(
  count = 4
): Promise<Doctor[]> {
  await connectToDatabase();

  const docs = await DoctorModel.find({})
    .sort({ rating: -1 })
    .limit(count)
    .lean();

  return docs.map((doc) =>
    toDoctorDTO(doc as unknown as LeanDoctor)
  );
}

export async function getDoctorAvailability(
  slug: string
): Promise<DayAvailability[] | null> {
  await connectToDatabase();

  const doc = await DoctorModel.findOne({
    slug,
  }).lean();

  if (!doc) {
    return null;
  }

  return (
    (doc as unknown as LeanDoctor).availability ?? []
  ) as DayAvailability[];
}