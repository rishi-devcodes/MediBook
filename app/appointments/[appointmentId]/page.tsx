import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  UserRound,
  Video,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import {
  getAppointmentById,
  markPastAppointmentsCompleted,
} from "@/lib/services/appointments";
import { AppointmentActions } from "@/components/booking/AppointmentActions";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { hasUserReviewedAppointment } from "@/lib/services/reviews";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    appointmentId: string;
  };
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function statusClasses(status: string) {
  if (status === "confirmed") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "cancelled") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "completed") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmed";
  if (status === "cancelled") return "Cancelled";
  if (status === "completed") return "Completed";
  return "Payment pending";
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 text-[#1958C1]">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function AppointmentDetailsPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/appointments/${params.appointmentId}`
      )}`
    );
  }

  // Keep completion updates scoped to the currently logged-in user.
  await markPastAppointmentsCompleted(session.user.id);

  const appointment = await getAppointmentById(
    params.appointmentId,
    session.user.id
  );

  if (!appointment) {
    notFound();
  }

  const alreadyReviewed =
    appointment.status === "completed"
      ? await hasUserReviewedAppointment(
          appointment._id.toString(),
          session.user.id
        )
      : false;

  const doctor = appointment.doctorId as unknown as {
    _id: string;
    name: string;
    specialty: string;
    photoUrl?: string;
    clinicName?: string;
    clinicLocation?: string;
  };

  return (
    <main className="min-h-screen bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <Link
          href="/appointments"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#1958C1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Appointments
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.7fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {doctor?.photoUrl ? (
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1958C1]">
                    <UserRound className="h-7 w-7" />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Doctor</p>

                  <h1 className="text-2xl font-bold text-[#0F172A]">
                    {doctor.name}
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    {doctor.specialty}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                  appointment.status
                )}`}
              >
                {statusLabel(appointment.status)}
              </span>
            </div>

            <div className="grid gap-6 border-b border-slate-100 py-7 sm:grid-cols-2">
              <Detail
                icon={<CalendarDays className="h-5 w-5" />}
                label="Date"
                value={formatDate(appointment.appointmentDate)}
              />

              <Detail
                icon={<Clock3 className="h-5 w-5" />}
                label="Time"
                value={appointment.appointmentTime}
              />

              <Detail
                icon={
                  appointment.consultationType === "Video" ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )
                }
                label="Consultation"
                value={appointment.consultationType}
              />

              <Detail
                icon={<span className="font-bold">₹</span>}
                label="Fee"
                value={`₹${appointment.consultationFee}`}
              />
            </div>

            <div className="py-7">
              <h2 className="text-lg font-bold text-[#0F172A]">
                Patient details
              </h2>

              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                <Detail
                  icon={<UserRound className="h-5 w-5" />}
                  label="Name"
                  value={appointment.patientName}
                />

                <Detail
                  icon={<UserRound className="h-5 w-5" />}
                  label="Age / Gender"
                  value={`${appointment.patientAge} / ${appointment.patientGender}`}
                />

                <Detail
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone"
                  value={appointment.patientPhone}
                />

                <Detail
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={appointment.patientEmail}
                />
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Reason for consultation
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {appointment.reason}
                </p>
              </div>
            </div>

            {appointment.status === "confirmed" ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

                  <div>
                    <p className="font-semibold text-green-800">
                      Appointment confirmed
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      Your appointment is confirmed.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {appointment.status === "cancelled" ? (
              <div
                role="status"
                className="rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

                  <div>
                    <p className="font-semibold text-red-800">
                      Appointment cancelled
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      This appointment is no longer active.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-[#F6F8FA] p-6 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1958C1]">
              Appointment
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#0F172A]">
              Manage your booking
            </h2>

            <div className="mt-5 rounded-xl bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Appointment ID
              </p>

              <p className="mt-1 break-all font-mono text-sm text-slate-700">
                {appointment._id.toString()}
              </p>
            </div>

            {doctor.clinicName || doctor.clinicLocation ? (
              <div className="mt-4 rounded-xl bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Clinic
                </p>

                {doctor.clinicName ? (
                  <p className="mt-1 font-semibold text-slate-900">
                    {doctor.clinicName}
                  </p>
                ) : null}

                {doctor.clinicLocation ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {doctor.clinicLocation}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6">
              <AppointmentActions
                appointmentId={appointment._id.toString()}
                status={appointment.status}
                doctorId={doctor._id.toString()}
              />

              {appointment.status === "completed" ? (
                <div className="mt-8">
                  {alreadyReviewed ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="h-5 w-5 text-green-700" />
                        </div>

                        <div>
                          <p className="font-semibold text-green-800">
                            Review submitted
                          </p>

                          <p className="mt-1 text-sm text-green-700">
                            Thank you for sharing your experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ReviewForm
                      appointmentId={appointment._id.toString()}
                    />
                  )}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}