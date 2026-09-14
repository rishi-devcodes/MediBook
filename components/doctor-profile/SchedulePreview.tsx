import type { DayAvailability } from "@/types/doctor";

export function SchedulePreview({ availability }: { availability: DayAvailability[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {availability.map((day) => (
        <div
          key={day.day}
          className="rounded-lg border border-border p-3"
        >
          <p className="text-sm font-semibold text-ink">{day.day}</p>
          <p className="mb-2.5 text-xs text-ink-faint">{day.date}</p>
          {day.slots.length === 0 ? (
            <p className="text-xs text-ink-faint">Unavailable</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {day.slots.slice(0, 3).map((slot) => (
                <span
                  key={slot}
                  className="rounded-md bg-surface-muted px-2 py-1 text-xs text-ink-muted"
                >
                  {slot}
                </span>
              ))}
              {day.slots.length > 3 && (
                <span className="rounded-md px-2 py-1 text-xs text-primary-500">
                  +{day.slots.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
