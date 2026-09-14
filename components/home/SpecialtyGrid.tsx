import Link from "next/link";
import {
  HeartPulse,
  Sparkles,
  Brain,
  Baby,
  Smile,
  Bone,
  Stethoscope,
} from "lucide-react";
import type { ElementType } from "react";
import { Container } from "@/components/ui/Container";
import type { Specialty } from "@/types/doctor";

const SPECIALTY_ITEMS: { name: Specialty; icon: ElementType }[] = [
  { name: "Cardiology", icon: HeartPulse },
  { name: "Dermatology", icon: Sparkles },
  { name: "Neurology", icon: Brain },
  { name: "Pediatrics", icon: Baby },
  { name: "Dentistry", icon: Smile },
  { name: "Orthopedics", icon: Bone },
  { name: "General Physician", icon: Stethoscope },
  { name: "Gynecology", icon: Sparkles },
];

export function SpecialtyGrid() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold sm:text-3xl">Popular specialties</h2>
          <p className="text-ink-muted">Browse doctors by what you need care for.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SPECIALTY_ITEMS.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              href={`/doctors?specialty=${encodeURIComponent(name)}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center transition-colors hover:border-primary-200 hover:bg-primary-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 group-hover:bg-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-ink">{name}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
