import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarClock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { getDoctorById } from "@/lib/mock/doctors";

interface BookPageProps {
  params: { doctorId: string };
}

export default function BookPage({ params }: BookPageProps) {
  const doctor = getDoctorById(params.doctorId);

  if (!doctor) {
    notFound();
  }

  return (
    <main className="py-16">
      <Container className="max-w-lg">
        <Link
          href={`/doctors/${doctor.id}`}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {doctor.name}&apos;s profile
        </Link>

        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <CalendarClock className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-semibold text-ink">
              Booking {doctor.name}
            </h1>
            <p className="max-w-xs text-sm text-ink-muted">
              The full date, time, and payment booking flow is coming in a
              later development phase. This route confirms navigation from
              the doctor profile works correctly.
            </p>
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
