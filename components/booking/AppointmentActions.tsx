"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, XCircle } from "lucide-react";

interface AppointmentActionsProps {
  appointmentId: string;
  status: string;
  doctorId: string;
}

export function AppointmentActions({
  appointmentId,
  status,
  doctorId,
}: AppointmentActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status !== "pending" && status !== "confirmed") {
    return null;
  }

  async function cancel() {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to cancel the appointment.");
        return;
      }

      window.location.reload();
    } catch {
      setError("Unable to cancel the appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/appointments/${appointmentId}/reschedule`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          <CalendarClock className="h-4 w-4" />
          Reschedule
        </Link>

        <button
          type="button"
          onClick={cancel}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <XCircle className="h-4 w-4" />
          {loading ? "Cancelling..." : "Cancel appointment"}
        </button>
      </div>
    </div>
  );
}
