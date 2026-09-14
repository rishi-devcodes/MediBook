import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SPECIALTIES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Stethoscope className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold text-ink">MediBook</span>
          </Link>
          <p className="max-w-xs text-sm text-ink-muted">
            Healthcare, simplified. Find the right doctor and book an
            appointment in minutes.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Company</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
            <li><Link href="/" className="hover:text-ink">About us</Link></li>
            <li><Link href="/" className="hover:text-ink">How it works</Link></li>
            <li><Link href="/" className="hover:text-ink">Contact</Link></li>
            <li><Link href="/" className="hover:text-ink">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Specialties</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
            {SPECIALTIES.slice(0, 4).map((specialty) => (
              <li key={specialty}>
                <Link
                  href={`/doctors?specialty=${encodeURIComponent(specialty)}`}
                  className="hover:text-ink"
                >
                  {specialty}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Legal</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
            <li><Link href="/" className="hover:text-ink">Privacy policy</Link></li>
            <li><Link href="/" className="hover:text-ink">Terms of service</Link></li>
            <li><Link href="/" className="hover:text-ink">Refund policy</Link></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-sm text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} MediBook. All rights reserved.</p>
          <p>Made for better healthcare access.</p>
        </Container>
      </div>
    </footer>
  );
}
