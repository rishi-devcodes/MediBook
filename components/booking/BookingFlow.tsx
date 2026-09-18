"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { ConsultationType, Doctor } from "@/types/doctor";

interface Props {
  doctor: Doctor;
}

type Gender =
  | ""
  | "Male"
  | "Female"
  | "Other"
  | "Prefer not to say";

type Patient = {
  name: string;
  age: string;
  gender: Gender;
  phone: string;
  email: string;
  reason: string;
};

function isoFromLabel(label: string) {
  const m = label.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?$/
  );

  if (!m) return null;

  const year = Number(m[3] ?? new Date().getFullYear());
  const month = new Date(`${m[2]} 1, ${year}`).getMonth();

  if (Number.isNaN(month)) return null;

  return `${year}-${String(month + 1).padStart(2, "0")}-${String(
    Number(m[1])
  ).padStart(2, "0")}`;
}

const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));

const longDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export function BookingFlow({ doctor }: Props) {
  const { data: session } = useSession();

  const dates = useMemo(() => {
    const todayInIndia = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    return doctor.availability
      .map((d) => ({
        ...d,
        iso: isoFromLabel(d.date),
      }))
      .filter(
        (d): d is typeof d & { iso: string } =>
          !!d.iso && d.iso >= todayInIndia
      );
  }, [doctor.availability]);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [type, setType] = useState<ConsultationType>(
    doctor.consultationTypes[0]
  );

  const [date, setDate] = useState(dates[0]?.iso ?? "");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotRetry, setSlotRetry] = useState(0);

  const [dateSlotCounts, setDateSlotCounts] = useState<
    Record<string, number>
  >({});

  const [slotError, setSlotError] = useState<string | null>(null);

  const [patient, setPatient] = useState<Patient>({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    reason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    setPatient((current) => ({
      ...current,
      name: current.name || session?.user?.name || "",
      email: current.email || session?.user?.email || "",
    }));
  }, [session?.user?.name, session?.user?.email]);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }

    const controller = new AbortController();

    setLoadingSlots(true);
    setSlotError(null);
    setTime("");

    fetch(`/api/doctors/${doctor.id}/slots?date=${date}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        const data = await r.json();

        if (!r.ok) {
          throw new Error(data?.error ?? "Unable to load slots.");
        }

        return data;
      })
      .then((data) => {
        if (controller.signal.aborted) return;

        const availableSlots = data.slots ?? [];

        setSlots(availableSlots);

        setDateSlotCounts((current) => ({
          ...current,
          [date]: availableSlots.length,
        }));
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setSlotError(
            e instanceof Error ? e.message : "Unable to load slots."
          );

          setSlots([]);

          setDateSlotCounts((current) => ({
            ...current,
            [date]: 0,
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingSlots(false);
        }
      });

    return () => controller.abort();
  }, [date, doctor.id, slotRetry]);

  const update = <K extends keyof Patient>(
    key: K,
    value: Patient[K]
  ) => {
    setPatient((p) => ({
      ...p,
      [key]: value,
    }));

    setErrors((e) => ({
      ...e,
      [key]: "",
    }));
  };

  function validate() {
    const e: Record<string, string> = {};

    if (patient.name.trim().length < 2) {
      e.name = "Enter the patient's full name.";
    }

    const age = Number(patient.age);

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      e.age = "Enter a valid age.";
    }

    if (!patient.gender) {
      e.gender = "Select a gender.";
    }

    if (!/^[+]?\d[\d\s-]{7,18}$/.test(patient.phone.trim())) {
      e.phone = "Enter a valid phone number.";
    }

    if (!/^\S+@\S+\.\S+$/.test(patient.email.trim())) {
      e.email = "Enter a valid email address.";
    }

    if (patient.reason.trim().length < 3) {
      e.reason = "Tell us the reason for the visit.";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  }

  async function createBooking() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const r = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientName: patient.name.trim(),
          patientAge: Number(patient.age),
          patientGender: patient.gender,
          patientPhone: patient.phone.trim(),
          patientEmail: patient.email.trim(),
          reason: patient.reason.trim(),
          consultationType: type,
          appointmentDate: date,
          appointmentTime: time,
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(
          data?.error ?? "Unable to create your appointment."
        );
      }

      setAppointmentId(data.appointment.id);
    } catch (e) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : "Unable to create your appointment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (appointmentId) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success">
            <Check className="h-7 w-7" />
          </span>

          <h1 className="text-2xl font-semibold">
            Appointment details saved
          </h1>

          <p className="max-w-lg text-sm leading-6 text-ink-muted">
            Your slot has been reserved as a pending appointment. Your
            appointment is ready for secure payment.
          </p>

          <div className="w-full max-w-md rounded-xl border border-border bg-surface-muted p-5 text-left text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-xs text-ink-faint">Doctor</span>
                <p className="font-medium">{doctor.name}</p>
              </div>

              <div>
                <span className="text-xs text-ink-faint">Date</span>
                <p className="font-medium">{longDate(date)}</p>
              </div>

              <div>
                <span className="text-xs text-ink-faint">Time</span>
                <p className="font-medium">{time}</p>
              </div>

              <div>
                <span className="text-xs text-ink-faint">Fee</span>
                <p className="font-medium">₹{doctor.consultationFee}</p>
              </div>
            </div>

            <p className="mt-4 border-t border-border pt-4 text-xs text-ink-faint">
              Appointment ID:{" "}
              <span className="font-mono text-ink">{appointmentId}</span>
            </p>
          </div>

          <Link
            href={`/book/${doctor.id}/payment?appointmentId=${appointmentId}`}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-500 px-5 text-sm font-medium text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Continue to Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/doctors/${doctor.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <span className="text-sm text-ink-muted">
          ₹{doctor.consultationFee} consultation
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {["Schedule", "Patient details", "Summary"].map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
              step === i + 1
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : step > i + 1
                  ? "border-success/30 bg-success-bg text-success"
                  : "border-border text-ink-muted"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold">
              {step > i + 1 ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </span>

            {label}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardBody className="flex flex-col gap-7">
            {step === 1 && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold">
                    Book an appointment
                  </h1>

                  <p className="mt-1 text-sm text-ink-muted">
                    Choose how and when you would like to consult{" "}
                    {doctor.name}.
                  </p>
                </div>

                <section>
                  <h2 className="mb-3 font-semibold">
                    Consultation type
                  </h2>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {doctor.consultationTypes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={type === t}
                        onClick={() => setType(t)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                          type === t
                            ? "border-primary-500 bg-primary-50"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            type === t
                              ? "bg-primary-500 text-white"
                              : "bg-surface-muted text-ink-muted"
                          }`}
                        >
                          {t === "Video" ? (
                            <Video className="h-5 w-5" />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </span>

                        <span>
                          <span className="block font-medium">{t}</span>
                          <span className="text-xs text-ink-muted">
                            {t === "Video"
                              ? "Consult online from home"
                              : "Visit the clinic"}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 font-semibold">Select a date</h2>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {dates.map((d) => (
                      <button
                        key={d.iso}
                        type="button"
                        aria-pressed={date === d.iso}
                        onClick={() => setDate(d.iso)}
                        className={`rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                          date === d.iso
                            ? "border-primary-500 bg-primary-50"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <span className="block text-xs text-ink-muted">
                          {d.day}
                        </span>

                        <span className="mt-1 block font-medium">
                          {shortDate(d.iso)}
                        </span>

                        <span className="mt-1 block text-xs text-success">
                          {dateSlotCounts[d.iso] ?? d.slots.length} slots
                        </span>
                      </button>
                    ))}
                  </div>

                  {dates.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border p-5 text-sm text-ink-muted">
                      No upcoming dates are currently available.
                    </p>
                  )}
                </section>

                <section>
                  <h2 className="mb-3 font-semibold">Select a time</h2>

                  {loadingSlots ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[1, 2, 3, 4].map((x) => (
                        <div
                          key={x}
                          className="h-10 animate-pulse rounded-lg bg-surface-muted"
                        />
                      ))}
                    </div>
                  ) : slotError ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-dashed border-border p-5 text-sm text-danger"
                    >
                      <p>{slotError}</p>

                      <button
                        type="button"
                        onClick={() =>
                          setSlotRetry((value) => value + 1)
                        }
                        className="mt-3 font-medium text-primary-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      >
                        Try again
                      </button>
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border p-5 text-sm text-ink-muted">
                      No slots are available for this date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={time === s}
                          onClick={() => setTime(s)}
                          className={`inline-flex h-10 items-center justify-center rounded-lg border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                            time === s
                              ? "border-primary-500 bg-primary-500 text-white"
                              : "border-border-strong hover:bg-surface-muted"
                          }`}
                        >
                          <Clock3 className="mr-1.5 h-4 w-4" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                <Button
                  size="lg"
                  disabled={!date || !time || loadingSlots}
                  onClick={() => setStep(2)}
                  className="sm:self-end"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold">
                    Patient details
                  </h1>

                  <p className="mt-1 text-sm text-ink-muted">
                    These details help the doctor prepare for your
                    consultation.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    autoComplete="name"
                    value={patient.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Enter full name"
                    error={errors.name}
                  />

                  <Input
                    label="Age"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="120"
                    value={patient.age}
                    onChange={(e) => update("age", e.target.value)}
                    placeholder="Age"
                    error={errors.age}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="gender"
                      className="text-sm font-medium"
                    >
                      Gender
                    </label>

                    <select
                      id="gender"
                      value={patient.gender}
                      onChange={(e) =>
                        update(
                          "gender",
                          e.target.value as Gender
                        )
                      }
                      className={`h-11 rounded-lg border bg-surface px-3.5 text-sm focus:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                        errors.gender
                          ? "border-danger"
                          : "border-border-strong"
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>

                    {errors.gender && (
                      <p className="text-sm text-danger">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Phone number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={patient.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    error={errors.phone}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Email address"
                      type="email"
                      autoComplete="email"
                      value={patient.email}
                      onChange={(e) =>
                        update("email", e.target.value)
                      }
                      placeholder="you@example.com"
                      error={errors.email}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="reason"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Reason for consultation
                    </label>

                    <textarea
                      id="reason"
                      rows={4}
                      maxLength={500}
                      value={patient.reason}
                      onChange={(e) =>
                        update("reason", e.target.value)
                      }
                      placeholder="Briefly describe why you are booking"
                      className={`w-full rounded-lg border bg-surface px-3.5 py-3 text-sm focus:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                        errors.reason
                          ? "border-danger"
                          : "border-border-strong"
                      }`}
                    />

                    {errors.reason && (
                      <p className="mt-1.5 text-sm text-danger">
                        {errors.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    size="lg"
                    onClick={() =>
                      validate() && setStep(3)
                    }
                  >
                    Review appointment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold">
                    Review your appointment
                  </h1>

                  <p className="mt-1 text-sm text-ink-muted">
                    Check everything before continuing to payment.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-muted p-5 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-xs text-ink-faint">
                        Doctor
                      </span>

                      <p className="font-medium">
                        {doctor.name}
                      </p>

                      <p className="text-ink-muted">
                        {doctor.specialty}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-ink-faint">
                        Consultation
                      </span>

                      <p className="font-medium">{type}</p>
                    </div>

                    <div>
                      <span className="text-xs text-ink-faint">
                        Date
                      </span>

                      <p className="font-medium">
                        {longDate(date)}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-ink-faint">
                        Time
                      </span>

                      <p className="font-medium">{time}</p>
                    </div>

                    <div>
                      <span className="text-xs text-ink-faint">
                        Patient
                      </span>

                      <p className="font-medium">
                        {patient.name}
                      </p>

                      <p className="text-ink-muted">
                        Age {patient.age} · {patient.gender}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-ink-faint">
                        Contact
                      </span>

                      <p className="font-medium">
                        {patient.phone}
                      </p>

                      <p className="text-ink-muted">
                        {patient.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <span className="text-xs text-ink-faint">
                      Reason
                    </span>

                    <p className="mt-1 text-ink-muted">
                      {patient.reason}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-ink-muted">
                      Consultation fee
                    </span>

                    <span className="text-lg font-semibold">
                      ₹{doctor.consultationFee}
                    </span>
                  </div>
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"
                  >
                    {submitError}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    disabled={submitting}
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Edit details
                  </Button>

                  <Button
                    size="lg"
                    loading={submitting}
                    onClick={createBooking}
                  >
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={doctor.photoUrl}
                alt={doctor.name}
                className="h-14 w-14 rounded-full object-cover"
              />

              <div>
                <p className="font-semibold">{doctor.name}</p>

                <p className="text-sm text-ink-muted">
                  {doctor.specialty}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 text-sm">
              <div className="flex justify-between py-1.5">
                <span className="text-ink-muted">
                  Consultation
                </span>

                <span>{type}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-ink-muted">
                  Date
                </span>

                <span>
                  {date ? shortDate(date) : "—"}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-ink-muted">
                  Time
                </span>

                <span>{time || "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-ink-muted">
                Fee
              </span>

              <span className="text-xl font-semibold">
                ₹{doctor.consultationFee}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <CalendarDays className="h-3.5 w-3.5" />
              Secure appointment scheduling
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}