import { z } from "zod";

export const genderSchema = z.enum(["Male", "Female", "Other", "Prefer not to say"]);
export const consultationTypeSchema = z.enum(["In-Person", "Video"]);

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required."),
  patientName: z.string().trim().min(2, "Please enter the patient's full name.").max(100),
  patientAge: z.coerce.number().int().min(1, "Age must be at least 1.").max(120, "Please enter a valid age."),
  patientGender: genderSchema,
  patientPhone: z
    .string()
    .trim()
    .regex(/^[+]?\d[\d\s-]{7,18}$/, "Please enter a valid phone number."),
  patientEmail: z.string().trim().email("Please enter a valid email address.").max(160),
  reason: z.string().trim().min(3, "Please tell us the reason for the visit.").max(500),
  consultationType: consultationTypeSchema,
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid appointment date."),
  appointmentTime: z.string().min(1, "Appointment time is required."),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
