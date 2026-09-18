import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function CTASection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary-500 px-6 py-14 text-center sm:px-16">
          <h2 className="max-w-xl text-2xl font-semibold text-white sm:text-3xl">
            Ready to book your next appointment?
          </h2>

          <p className="max-w-md text-primary-50">
            Browse doctors, compare availability, and book your appointment
            online.
          </p>

          <Link
            href="/doctors"
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-white px-6 text-[15px] font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            Find a Doctor
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}