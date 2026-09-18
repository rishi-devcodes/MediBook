import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const AppointmentSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, required: true, trim: true, maxlength: 100 },
    patientAge: { type: Number, required: true, min: 1, max: 120 },
    patientGender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    patientPhone: { type: String, required: true, trim: true, maxlength: 20 },
    patientEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    consultationType: {
      type: String,
      required: true,
      enum: ["In-Person", "Video"],
    },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    consultationFee: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// A doctor can only have one appointment at a given date/time.
AppointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  { unique: true }
);

export type AppointmentSchemaType = InferSchemaType<typeof AppointmentSchema>;

export const Appointment: Model<AppointmentSchemaType> =
  (models.Appointment as Model<AppointmentSchemaType>) ||
  model<AppointmentSchemaType>("Appointment", AppointmentSchema);

export function isValidObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}
