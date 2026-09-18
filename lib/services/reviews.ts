import { randomUUID } from "crypto";
import { connectToDatabase } from "@/lib/db/connect";
import { Appointment } from "@/lib/models/Appointment";
import { Doctor } from "@/lib/models/Doctor";
import { isValidObjectId } from "@/lib/models/Appointment";

interface CreateReviewInput {
  appointmentId: string;
  rating: number;
  comment: string;
}

export async function createReviewForAppointment(
  input: CreateReviewInput,
  userId: string
) {
  await connectToDatabase();

  if (!isValidObjectId(input.appointmentId)) {
    return {
      ok: false as const,
      code: "INVALID_APPOINTMENT",
      message: "Invalid appointment.",
    };
  }

  if (!isValidObjectId(userId)) {
    return {
      ok: false as const,
      code: "INVALID_USER",
      message: "Invalid user.",
    };
  }

  const rating = Number(input.rating);
  const comment = input.comment.trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      ok: false as const,
      code: "INVALID_RATING",
      message: "Rating must be between 1 and 5.",
    };
  }

  if (comment.length < 5) {
    return {
      ok: false as const,
      code: "INVALID_COMMENT",
      message: "Review must contain at least 5 characters.",
    };
  }

  if (comment.length > 500) {
    return {
      ok: false as const,
      code: "INVALID_COMMENT",
      message: "Review cannot exceed 500 characters.",
    };
  }

  const appointment = await Appointment.findOne({
    _id: input.appointmentId,
    userId,
  }).lean();

  if (!appointment) {
    return {
      ok: false as const,
      code: "APPOINTMENT_NOT_FOUND",
      message: "Appointment not found.",
    };
  }

  if (appointment.status !== "completed") {
    return {
      ok: false as const,
      code: "APPOINTMENT_NOT_COMPLETED",
      message: "You can review a doctor only after the appointment is completed.",
    };
  }

  const doctor = await Doctor.findById(appointment.doctorId);

  if (!doctor) {
    return {
      ok: false as const,
      code: "DOCTOR_NOT_FOUND",
      message: "Doctor not found.",
    };
  }

  const alreadyReviewed = doctor.reviews.some(
    (review) => review.appointmentId === input.appointmentId
  );

  if (alreadyReviewed) {
    return {
      ok: false as const,
      code: "ALREADY_REVIEWED",
      message: "You have already reviewed this appointment.",
    };
  }

  doctor.reviews.push({
    id: randomUUID(),
    appointmentId: input.appointmentId,
    patientName: appointment.patientName,
    rating,
    comment,
    date: new Date().toISOString(),
  });

  const totalRating = doctor.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  doctor.reviewCount = doctor.reviews.length;
  doctor.rating =
    doctor.reviewCount > 0
      ? Number((totalRating / doctor.reviewCount).toFixed(1))
      : 0;

  await doctor.save();

  return {
    ok: true as const,
    review: doctor.reviews[doctor.reviews.length - 1],
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
  };
}
export async function hasUserReviewedAppointment(
  appointmentId: string,
  userId: string
): Promise<boolean> {
  await connectToDatabase();

  if (!isValidObjectId(appointmentId) || !isValidObjectId(userId)) {
    return false;
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    userId,
  })
    .select("doctorId")
    .lean();

  if (!appointment) {
    return false;
  }

  const doctor = await Doctor.findById(appointment.doctorId)
    .select("reviews")
    .lean();

  if (!doctor) {
    return false;
  }

  return doctor.reviews.some(
    (review) => review.appointmentId === appointmentId
  );
}