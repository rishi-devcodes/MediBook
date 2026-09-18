import Link from "next/link";
import { Video, Building2, Clock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import type { Doctor } from "@/types/doctor";

export function BookingSidebar({ doctor }: { doctor: Doctor }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-ink-faint">Consultation fee</p>
          <p className="text-2xl font-semibold text-ink">
            ₹{doctor.consultationFee}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {doctor.consultationTypes.map((type) => (
            <span
              key={type}
              className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted"
            >
              {type === "Video" ? (
                <Video className="h-3 w-3" />
              ) : (
                <Building2 className="h-3 w-3" />
              )}
              {type}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-success-bg px-3 py-2 text-sm text-success">
          <Clock className="h-4 w-4" />
          Next available: {doctor.nextAvailableLabel}
        </div>

        <Link
          href={`/book/${doctor.id}`}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 text-[15px] font-medium text-white transition-colors hover:bg-primary-600"
        >
          Book Appointment
        </Link>
      </CardBody>
    </Card>
  );
}