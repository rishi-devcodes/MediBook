import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Video,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { getAppointmentById } from "@/lib/services/appointments";

interface Props {
  params: {
    appointmentId: string;
  };
}

export const dynamic = "force-dynamic";

interface DoctorInfo {
  name: string;
  specialty: string;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export default async function ConfirmationPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/booking/${params.appointmentId}/confirmation`
      )}`
    );
  }

  const appointment = await getAppointmentById(
    params.appointmentId,
    session.user.id
  );

  if (!appointment) {
    return (
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardBody className="flex flex-col items-center py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="h-7 w-7" />
                </span>

                <h1 className="mt-5 text-2xl font-semibold">
                  Appointment not found
                </h1>

                <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
                  We could not find this appointment in your account.
                </p>

                <Link
                  href="/doctors"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Browse doctors
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardBody>
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  const doctor = appointment.doctorId as unknown as DoctorInfo;

  const appointmentId = params.appointmentId;
  const isConfirmed = appointment.status === "confirmed";
  const isPending = appointment.status === "pending";
  const isCancelled = appointment.status === "cancelled";
  const isCompleted = appointment.status === "completed";

  if (!isConfirmed) {
    return (
      <main className="py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardBody className="py-10 sm:py-12">
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                    <AlertCircle className="h-9 w-9" />
                  </span>

                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    Appointment status
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold text-ink">
                    {isPending
                      ? "Payment is still pending"
                      : isCancelled
                        ? "Appointment cancelled"
                        : "Appointment already completed"}
                  </h1>

                  <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
                    {isPending
                      ? "This appointment has been created, but payment has not been confirmed yet."
                      : isCancelled
                        ? "This appointment has been cancelled and is no longer available."
                        : "This appointment has already been completed."}
                  </p>
                </div>

                <div className="mt-8 rounded-xl border border-border bg-surface p-5 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-ink-faint">Doctor</p>
                      <p className="mt-1 font-medium">{doctor.name}</p>
                      <p className="text-sm text-ink-muted">
                        {doctor.specialty}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-ink-faint">Patient</p>
                      <p className="mt-1 font-medium">
                        {appointment.patientName}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-primary-600" />
                      <div>
                        <p className="text-xs text-ink-faint">Date</p>
                        <p className="mt-1 font-medium">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Clock3 className="mt-0.5 h-4 w-4 text-primary-600" />
                      <div>
                        <p className="text-xs text-ink-faint">Time</p>
                        <p className="mt-1 font-medium">
                          {appointment.appointmentTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 border-t border-border pt-4 text-xs text-ink-faint">
                    Appointment ID:{" "}
                    <span className="font-mono text-ink-muted">
                      {appointmentId}
                    </span>
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  {isPending && (
                    <Link
                      href={`/book/${doctor.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}/payment?appointmentId=${appointmentId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                      Continue to Payment
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  <Link
                    href={`/appointments/${appointmentId}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    View Appointment
                  </Link>

                  <Link
                    href="/appointments"
                    className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    My Appointments
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 sm:py-16">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardBody className="py-10 sm:py-12">
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-9 w-9" />
                </span>

                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-green-600">
                  Payment successful
                </p>

                <h1 className="mt-2 text-3xl font-semibold text-ink">
                  Appointment confirmed
                </h1>

                <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
                  Your consultation with {doctor.name} has been confirmed.
                </p>
              </div>

              <div className="mt-8 grid gap-3 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-ink-faint">Doctor</p>
                  <p className="mt-1 font-medium">{doctor.name}</p>
                  <p className="text-sm text-ink-muted">
                    {doctor.specialty}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-ink-faint">Patient</p>
                  <p className="mt-1 font-medium">
                    {appointment.patientName}
                  </p>
                </div>

                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-primary-600" />
                  <div>
                    <p className="text-xs text-ink-faint">Date</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-primary-600" />
                  <div>
                    <p className="text-xs text-ink-faint">Time</p>
                    <p className="mt-1 text-sm font-medium">
                      {appointment.appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {appointment.consultationType === "Video" ? (
                    <Video className="mt-0.5 h-4 w-4 text-primary-600" />
                  ) : (
                    <Building2 className="mt-0.5 h-4 w-4 text-primary-600" />
                  )}

                  <div>
                    <p className="text-xs text-ink-faint">
                      Consultation
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {appointment.consultationType}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 text-primary-600" />
                  <div>
                    <p className="text-xs text-ink-faint">
                      Amount paid
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      ₹{appointment.consultationFee}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-success-bg px-4 py-3 text-center text-sm text-success">
                Your appointment is confirmed and ready to be managed from
                your account.
              </div>

              <p className="mt-5 text-center text-xs text-ink-faint">
                Appointment ID:{" "}
                <span className="font-mono text-ink-muted">
                  {appointmentId}
                </span>
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={`/appointments/${appointmentId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  View Appointment
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/appointments"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  My Appointments
                </Link>

                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Browse doctors
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </main>
  );
}