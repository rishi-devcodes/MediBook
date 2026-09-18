import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  UserRound,
  Video,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import {
  getAppointmentsForUser,
  markPastAppointmentsCompleted,
} from "@/lib/services/appointments";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";

export const dynamic = "force-dynamic";

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

function emptyStateTitle(filter: string) {
  if (filter === "upcoming") return "No upcoming appointments";
  if (filter === "completed") return "No completed appointments";
  if (filter === "cancelled") return "No cancelled appointments";

  return "No appointments yet";
}

function emptyStateDescription(filter: string) {
  if (filter === "upcoming") {
    return "You don't have any upcoming appointments.";
  }

  if (filter === "completed") {
    return "Your completed consultations will appear here.";
  }

  if (filter === "cancelled") {
    return "You don't have any cancelled appointments.";
  }

  return "You haven't booked any appointments yet. Find a doctor and book your first consultation.";
}

interface MyAppointmentsPageProps {
  searchParams: {
    filter?: string;
  };
}

export default async function MyAppointmentsPage({
  searchParams,
}: MyAppointmentsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent("/appointments")}`
    );
  }

  await markPastAppointmentsCompleted(session.user.id);

  const appointments = await getAppointmentsForUser(session.user.id);
  const filter = searchParams.filter || "all";

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "upcoming") {
      return (
        appointment.status === "pending" ||
        appointment.status === "confirmed"
      );
    }

    if (filter === "completed") {
      return appointment.status === "completed";
    }

    if (filter === "cancelled") {
      return appointment.status === "cancelled";
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1958C1]">
            MediBook
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0F172A]">
            My Appointments
          </h1>

          <p className="mt-2 text-slate-500">
            View and manage your upcoming and past appointments.
          </p>

          <AppointmentFilters />
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#1958C1]">
              <CalendarDays className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {emptyStateTitle(filter)}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {emptyStateDescription(filter)}
            </p>

            <Link
              href="/doctors"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1958C1] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#12479d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2"
            >
              Find a Doctor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredAppointments.map((appointment) => {
              const doctor = appointment.doctorId as unknown as {
                _id: string;
                name: string;
                specialty: string;
                photoUrl?: string;
              };

              const appointmentId = appointment._id.toString();

              return (
                <article
                  key={appointmentId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      {doctor?.photoUrl ? (
                        <img
                          src={doctor.photoUrl}
                          alt={doctor.name}
                          className="h-14 w-14 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1958C1]">
                          <UserRound className="h-6 w-6" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="break-words text-lg font-bold text-slate-900">
                            {doctor.name}
                          </h2>

                          <span
                            className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              appointment.status
                            )}`}
                          >
                            {statusLabel(appointment.status)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {doctor.specialty}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-[#1958C1]" />
                            {formatDate(appointment.appointmentDate)}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4 shrink-0 text-[#1958C1]" />
                            {appointment.appointmentTime}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            {appointment.consultationType === "Video" ? (
                              <Video className="h-4 w-4 shrink-0 text-[#1958C1]" />
                            ) : (
                              <Building2 className="h-4 w-4 shrink-0 text-[#1958C1]" />
                            )}

                            {appointment.consultationType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:min-w-[250px] lg:border-t-0 lg:pt-0">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Consultation Fee
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          ₹{appointment.consultationFee}
                        </p>
                      </div>

                      <Link
                        href={`/appointments/${appointmentId}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1958C1] hover:text-[#1958C1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2"
                      >
                        View Appointment
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}