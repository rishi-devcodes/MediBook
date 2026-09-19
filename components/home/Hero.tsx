import Image from "next/image";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="border-b border-border bg-surface-muted">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div className="flex flex-col gap-6">
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Find the right doctor, at the right time.
          </h1>

          <p className="max-w-lg text-lg text-ink-muted">
            Search verified doctors across every specialty, compare fees and
            availability, and book a consultation in minutes — no phone
            calls, no waiting rooms.
          </p>

          <form
            action="/doctors"
            method="GET"
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-card sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 sm:border-r sm:border-border">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" />

              <input
                type="text"
                name="query"
                placeholder="Search doctor or specialty"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>

            <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-ink-faint" />

              <input
                type="text"
                name="location"
                placeholder="City or area"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-primary-500 px-6 text-[15px] font-medium text-white transition-colors hover:bg-primary-600"
            >
              Find a Doctor
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="relative hidden aspect-[4/5] w-full max-w-md justify-self-center overflow-hidden rounded-2xl lg:block">
          <Image
            src="/doctor-hero.png"
            alt="Doctor consulting with a patient"
            fill
            sizes="500px"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}