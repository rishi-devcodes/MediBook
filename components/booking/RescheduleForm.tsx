"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2 } from "lucide-react";

interface Props {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  photoUrl?: string;
  currentDate: string;
  currentTime: string;
}

export function RescheduleForm({
  appointmentId,
  doctorId,
  doctorName,
  specialty,
  photoUrl,
  currentDate,
  currentTime,
}: Props) {
  const [date, setDate] = useState(currentDate);
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setMessage("");
      setTime("");

      try {
        const response = await fetch(
          `/api/doctors/${encodeURIComponent(doctorId)}/slots?date=${encodeURIComponent(date)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load available slots.");
        }

        if (!ignore) setSlots(data.slots ?? []);
      } catch (error) {
        if (!ignore) {
          setSlots([]);
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load available slots."
          );
        }
      } finally {
        if (!ignore) setLoadingSlots(false);
      }
    }

    if (date) void loadSlots();

    return () => {
      ignore = true;
    };
  }, [date, doctorId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || !time) {
      setMessage("Please select a date and time.");
      return;
    }

    setSaving(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          appointmentDate: date,
          appointmentTime: time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to reschedule the appointment.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/appointments/${appointmentId}`;
      }, 700);
    } catch {
      setMessage("Unable to reschedule the appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link
        href={`/appointments/${appointmentId}`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#1958C1]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to appointment
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={doctorName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#1958C1]">
              <CalendarClock className="h-6 w-6" />
            </div>
          )}

          <div>
            <p className="text-sm text-slate-500">Reschedule with</p>
            <h1 className="text-2xl font-bold text-[#0F172A]">{doctorName}</h1>
            <p className="text-sm text-slate-500">{specialty}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-6">
          <div>
            <label
              htmlFor="reschedule-date"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              New date
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1958C1] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">
              Available time
            </p>

            {loadingSlots ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading available slots...
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                No available slots for this date. Try another date.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      time === slot
                        ? "border-[#1958C1] bg-blue-50 text-[#1958C1]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Current appointment:{" "}
            <span className="font-semibold text-slate-900">
              {currentDate} at {currentTime}
            </span>
          </div>

          {message ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          {success ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Appointment rescheduled successfully.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving || loadingSlots || !time}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1958C1] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#123F8C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarClock className="h-4 w-4" />
            {saving ? "Rescheduling..." : "Confirm new time"}
          </button>
        </form>
      </div>
    </div>
  );
}
