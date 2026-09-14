import { Search, CalendarClock, CreditCard } from "lucide-react";
import { Container } from "@/components/ui/Container";

const STEPS = [
  {
    number: "01",
    title: "Find a Doctor",
    description:
      "Search by specialty, name, or location and compare doctors by rating, fee, and availability.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choose a Time",
    description:
      "Pick a consultation type and a date and time slot that works for your schedule.",
    icon: CalendarClock,
  },
  {
    number: "03",
    title: "Book & Pay",
    description:
      "Confirm your details, pay securely online, and get an instant appointment confirmation.",
    icon: CreditCard,
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-12 flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
          <p className="text-ink-muted">Book an appointment in three simple steps.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-primary-500">{step.number}</span>
              <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
              <p className="max-w-[260px] text-sm text-ink-muted">{step.description}</p>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute right-[-16px] top-7 hidden h-px w-8 bg-border sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
