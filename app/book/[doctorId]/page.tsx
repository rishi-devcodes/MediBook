import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { getDoctorBySlug } from "@/lib/services/doctors";

interface BookPageProps { params: { doctorId: string } }
export const dynamic = "force-dynamic";

export default async function BookPage({ params }: BookPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/book/${params.doctorId}`)}`);
  }

  const doctor = await getDoctorBySlug(params.doctorId);
  if (!doctor) notFound();

  return <main className="py-8 sm:py-12"><Container><BookingFlow doctor={doctor} /></Container></main>;
}
