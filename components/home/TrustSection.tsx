import { ShieldCheck, Lock, RefreshCcw, LifeBuoy } from "lucide-react";
import { Container } from "@/components/ui/Container";

const BENEFITS = [
  {
    title: "Doctor information",
    description:
      "Compare specialty, qualifications, experience, consultation options, and availability before booking.",
    icon: ShieldCheck,
  },
  {
    title: "Secure online payments",
    description:
      "Complete appointment payments through Razorpay's secure checkout.",
    icon: Lock,
  },
  {
    title: "Easy rescheduling",
    description:
      "Plans change — reschedule or cancel your appointment when needed.",
    icon: RefreshCcw,
  },
  {
    title: "Appointment management",
    description:
      "Keep track of upcoming and completed appointments from your account.",
    icon: LifeBuoy,
  },
];

export function TrustSection() {
  return (
    <section className="bg-surface-muted py-16 sm:py-20">
      <Container>
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold sm:text-3xl">Built around your trust</h2>
          <p className="text-ink-muted">
            Every part of MediBook is designed to make healthcare feel dependable.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                <benefit.icon className="h-5 w-5" />
              </span>
              <h3 className="mb-1.5 text-base font-semibold text-ink">{benefit.title}</h3>
              <p className="text-sm text-ink-muted">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
