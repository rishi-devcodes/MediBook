import { connectToDatabase } from "@/lib/db/connect";
import { Doctor as DoctorModel, type DoctorSchemaType } from "@/lib/models/Doctor";
import { FEE_RANGES } from "@/lib/constants";
import type { Doctor, DayAvailability, Specialty } from "@/types/doctor";

export interface DoctorListFilters {
  query?: string;
  specialties?: Specialty[];
  availableOnly?: boolean;
  feeRangeId?: string;
}

// Shape of a lean (plain object) Mongoose doc for Doctor.
type LeanDoctor = DoctorSchemaType & { slug: string };

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toDoctorDTO(doc: LeanDoctor): Doctor {
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
    consultationTypes: (doc.consultationTypes ?? []) as Doctor["consultationTypes"],
    languages: doc.languages ?? [],
    about: doc.about,
    clinicName: doc.clinicName,
    clinicLocation: doc.clinicLocation,
    verified: doc.verified ?? false,
    isAvailableToday: doc.isAvailableToday ?? false,
    nextAvailableLabel: doc.nextAvailableLabel ?? "",
    availability: (doc.availability ?? []) as DayAvailability[],
    reviews: (doc.reviews ?? []) as Doctor["reviews"],
  };
}

export async function getAllDoctors(filters: DoctorListFilters = {}): Promise<Doctor[]> {
  await connectToDatabase();

  const mongoFilter: Record<string, unknown> = {};

  if (filters.specialties && filters.specialties.length > 0) {
    mongoFilter.specialty = { $in: filters.specialties };
  }

  if (filters.availableOnly) {
    mongoFilter.isAvailableToday = true;
  }

  if (filters.feeRangeId) {
    const range = FEE_RANGES.find((r) => r.id === filters.feeRangeId);
    if (range && range.id !== "any") {
      const feeFilter: Record<string, number> = { $gte: range.min };
      if (Number.isFinite(range.max)) {
        feeFilter.$lte = range.max;
      }
      mongoFilter.consultationFee = feeFilter;
    }
  }

  if (filters.query && filters.query.trim().length > 0) {
    const regex = new RegExp(escapeRegExp(filters.query.trim()), "i");
    mongoFilter.$or = [{ name: regex }, { specialty: regex }];
  }

  const docs = await DoctorModel.find(mongoFilter).sort({ rating: -1 }).lean();
  return docs.map((doc) => toDoctorDTO(doc as unknown as LeanDoctor));
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  await connectToDatabase();
  const doc = await DoctorModel.findOne({ slug }).lean();
  if (!doc) return null;
  return toDoctorDTO(doc as unknown as LeanDoctor);
}

export async function getFeaturedDoctors(count = 4): Promise<Doctor[]> {
  await connectToDatabase();
  const docs = await DoctorModel.find({}).sort({ rating: -1 }).limit(count).lean();
  return docs.map((doc) => toDoctorDTO(doc as unknown as LeanDoctor));
}

/**
 * Returns the doctor's weekly availability template. Slot locking against
 * real appointments is not implemented yet — that lands in the booking
 * phase, once appointments exist to check against.
 */
export async function getDoctorAvailability(
  slug: string
): Promise<DayAvailability[] | null> {
  await connectToDatabase();
  const doc = await DoctorModel.findOne({ slug }).lean();
  if (!doc) return null;
  return ((doc as unknown as LeanDoctor).availability ?? []) as DayAvailability[];
}