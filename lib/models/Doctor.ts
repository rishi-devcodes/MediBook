import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
import { SPECIALTIES } from "@/lib/constants";

const DayAvailabilitySchema = new Schema(
  {
    day: { type: String, required: true },
    date: { type: String, required: true },
    slots: { type: [String], default: [] },
  },
  { _id: false }
);

const DoctorReviewSchema = new Schema(
  {
    id: { type: String, required: true },
    appointmentId: { type: String,},
    patientName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const DoctorSchema = new Schema(
  {
    // Human-readable, URL-safe identifier (e.g. "dr-anjali-mehta").
    // This is what the frontend uses in routes like /doctors/[doctorId],
    // kept separate from Mongo's own _id so existing Phase 1 URLs and
    // components (which read `doctor.id`) don't need to change.
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true },
    specialty: { type: String, required: true, enum: SPECIALTIES },
    qualifications: { type: [String], default: [] },
    experienceYears: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviewCount: { type: Number, required: true, min: 0, default: 0 },
    consultationFee: { type: Number, required: true, min: 0 },
    consultationTypes: {
      type: [String],
      enum: ["In-Person", "Video"],
      default: [],
    },
    languages: { type: [String], default: [] },
    about: { type: String, required: true },
    clinicName: { type: String, required: true },
    clinicLocation: { type: String, required: true },
    verified: { type: Boolean, default: false },
    isAvailableToday: { type: Boolean, default: false },
    nextAvailableLabel: { type: String, default: "" },
    availability: { type: [DayAvailabilitySchema], default: [] },
    reviews: { type: [DoctorReviewSchema], default: [] },
  },
  { timestamps: true }
);

export type DoctorSchemaType = InferSchemaType<typeof DoctorSchema>;

// Reuse the existing compiled model on hot reload instead of calling
// `model()` again, which would throw "Cannot overwrite `Doctor` model".
export const Doctor: Model<DoctorSchemaType> =
  (models.Doctor as Model<DoctorSchemaType>) ||
  model<DoctorSchemaType>("Doctor", DoctorSchema);