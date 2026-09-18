import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { getFeaturedDoctors } from "@/lib/services/doctors";
import type { Doctor } from "@/types/doctor";

export async function FeaturedDoctors() {
  let doctors: Doctor[] = [];
  let loadError = false;

  try {
    doctors = await getFeaturedDoctors(4);
  } catch (error) {
    console.error("Failed to load featured doctors:", error);
    loadError = true;
  }

  return (
    <section className="bg-surface-muted py-16 sm:py-20">
      <Container>
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold sm:text-3xl">Featured doctors</h2>
            <p className="text-ink-muted">Highly rated doctors trusted by patients.</p>
          </div>
          <Link
            href="/doctors"
            className="flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            View all doctors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loadError ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
            <AlertCircle className="h-6 w-6 text-ink-faint" />
            <p className="text-sm text-ink-muted">
              We couldn&apos;t load featured doctors right now. Please refresh the page.
            </p>
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-sm text-ink-muted">No doctors are available yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}