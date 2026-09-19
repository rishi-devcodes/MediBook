import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Languages } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { ProfileHeader } from "@/components/doctor-profile/ProfileHeader";
import { SchedulePreview } from "@/components/doctor-profile/SchedulePreview";
import { ReviewsList } from "@/components/doctor-profile/ReviewsList";
import { BookingSidebar } from "@/components/doctor-profile/BookingSidebar";
import { getDoctorBySlug } from "@/lib/services/doctors";

interface DoctorProfilePageProps {
  params: { doctorId: string };
}

// Doctor data now lives in MongoDB and can change at any time, so this
// page is rendered fresh per request rather than statically generated.
export const dynamic = "force-dynamic";

export default async function DoctorProfilePage({
  params,
}: DoctorProfilePageProps) {
  const doctor = await getDoctorBySlug(params.doctorId);

  if (!doctor) {
    notFound();
  }

  return (
    <main className="py-8 sm:py-12">
      <Container>
        <Link
          href="/doctors"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to doctors
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-8">
            {/* Doctor profile */}
            <Card>
              <CardBody>
                <ProfileHeader doctor={doctor} />
              </CardBody>
            </Card>

            {/* About & languages */}
            <Card>
              <CardBody className="flex flex-col gap-6">
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-ink">
                    About
                  </h2>

                  <p className="text-[15px] leading-relaxed text-ink-muted">
                    {doctor.about}
                  </p>
                </div>

                <div>
                  <h2 className="mb-2 flex items-center gap-1.5 text-lg font-semibold text-ink">
                    <Languages className="h-4 w-4 text-ink-faint" />
                    Languages spoken
                  </h2>

                  <p className="text-[15px] text-ink-muted">
                    {doctor.languages.join(", ")}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Weekly availability */}
            <Card>
              <CardBody>
                <h2 className="mb-4 text-lg font-semibold text-ink">
                  Upcoming availability
                </h2>

                <SchedulePreview availability={doctor.availability} />
              </CardBody>
            </Card>

            {/* Reviews */}
            <Card>
              <CardBody>
                <h2 className="mb-1 text-lg font-semibold text-ink">
                  Patient reviews
                </h2>

                <p className="mb-4 text-sm text-ink-muted">
                  {doctor.rating} out of 5 · {doctor.reviewCount} reviews
                </p>

                <ReviewsList reviews={doctor.reviews} />
              </CardBody>
            </Card>
          </div>

          {/* Booking CTA */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BookingSidebar doctor={doctor} />
          </div>
        </div>
      </Container>
    </main>
  );
}