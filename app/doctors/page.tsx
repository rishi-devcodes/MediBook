import { Container } from "@/components/ui/Container";
import { DoctorsListClient } from "@/components/doctors/DoctorsListClient";
import { SPECIALTIES } from "@/lib/constants";
import type { Specialty } from "@/types/doctor";

interface DoctorsPageProps {
  searchParams: { query?: string; specialty?: string };
}

export default function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const initialQuery = searchParams.query ?? "";
  const initialSpecialty = SPECIALTIES.includes(searchParams.specialty as Specialty)
    ? (searchParams.specialty as Specialty)
    : null;

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Find a doctor</h1>
          <p className="text-ink-muted">
            Search and filter doctors by specialty, availability, and consultation fee.
          </p>
        </div>

        <DoctorsListClient
          initialQuery={initialQuery}
          initialSpecialty={initialSpecialty}
        />
      </Container>
    </main>
  );
}
