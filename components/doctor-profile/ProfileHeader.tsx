import Image from "next/image";
import { BadgeCheck, Star, MapPin } from "lucide-react";
import type { Doctor } from "@/types/doctor";

export function ProfileHeader({ doctor }: { doctor: Doctor }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <Image
        src={doctor.photoUrl}
        alt={doctor.name}
        width={96}
        height={96}
        className="h-24 w-24 shrink-0 rounded-2xl object-cover"
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-ink">{doctor.name}</h1>
          {doctor.verified && (
            <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>
        <p className="mt-1 text-[15px] text-ink-muted">
          {doctor.specialty} · {doctor.qualifications.join(", ")}
        </p>
        <p className="text-sm text-ink-faint">{doctor.experienceYears} years of experience</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium text-ink">{doctor.rating}</span>
            <span className="text-ink-faint">({doctor.reviewCount} reviews)</span>
          </span>
          <span className="flex items-center gap-1.5 text-ink-muted">
            <MapPin className="h-4 w-4 text-ink-faint" />
            {doctor.clinicName}, {doctor.clinicLocation}
          </span>
        </div>
      </div>
    </div>
  );
}
