import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAppointmentById } from "@/lib/services/appointments";
import { RescheduleForm } from "@/components/booking/RescheduleForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { appointmentId: string };
}

export default async function ReschedulePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/appointments/${params.appointmentId}/reschedule`
      )}`
    );
  }

  const appointment = await getAppointmentById(
    params.appointmentId,
    session.user.id
  );

  if (!appointment) notFound();

  if (
    appointment.status === "cancelled" ||
    appointment.status === "completed"
  ) {
    redirect(`/appointments/${params.appointmentId}`);
  }

  const doctor = appointment.doctorId as unknown as {
    _id: string;
    slug: string;
    name: string;
    specialty: string;
    photoUrl?: string;
  };

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
        <RescheduleForm
          appointmentId={appointment._id.toString()}
          doctorId={doctor.slug}
          doctorName={doctor.name}
          specialty={doctor.specialty}
          photoUrl={doctor.photoUrl}
          currentDate={appointment.appointmentDate}
          currentTime={appointment.appointmentTime}
        />
      </div>
    </main>
  );
}
