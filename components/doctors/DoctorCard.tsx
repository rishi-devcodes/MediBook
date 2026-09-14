import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Video, Building2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Doctor } from "@/types/doctor";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardBody className="flex flex-1 flex-col gap-4">
        <div className="flex items-start gap-4">
          <Image
            src={doctor.photoUrl}
            alt={doctor.name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-ink">
              {doctor.name}
            </h3>
            <p className="text-sm text-ink-muted">{doctor.specialty}</p>
            <p className="mt-0.5 truncate text-xs text-ink-faint">
              {doctor.qualifications.join(", ")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-medium text-ink">{doctor.rating}</span>
            <span className="text-ink-faint">({doctor.reviewCount})</span>
          </span>
          <span>{doctor.experienceYears} yrs exp.</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {doctor.consultationTypes.map((type) => (
            <Badge key={type} tone="neutral">
              {type === "Video" ? (
                <Video className="h-3 w-3" />
              ) : (
                <Building2 className="h-3 w-3" />
              )}
              {type}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 text-success" />
          <span
            className={
              doctor.isAvailableToday ? "font-medium text-success" : "text-ink-muted"
            }
          >
            {doctor.nextAvailableLabel}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-ink-faint">Consultation fee</p>
            <p className="text-base font-semibold text-ink">
              ₹{doctor.consultationFee}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/doctors/${doctor.id}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border-strong px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
            >
              View Profile
            </Link>
            <Link
              href={`/book/${doctor.id}`}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              Book
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
