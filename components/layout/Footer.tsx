import Link from "next/link";
import { Stethoscope } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SPECIALTIES } from "@/lib/constants";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/appointments", label: "My Appointments" },
  { href: "/profile", label: "Profile" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label="MediBook home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Stethoscope className="h-4 w-4" />
            </span>

            <span className="font-display text-base font-semibold text-ink">
              MediBook
            </span>
          </Link>

          <p className="max-w-xs text-sm leading-6 text-ink-muted">
            Healthcare, simplified. Find the right doctor and book an
            appointment in minutes.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">
            Quick Links
          </h3>

          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">
            Specialties
          </h3>

          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
            {SPECIALTIES.slice(0, 4).map((specialty) => (
              <li key={specialty}>
                <Link
                  href={`/doctors?specialty=${encodeURIComponent(
                    specialty
                  )}`}
                  className="rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {specialty}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">
            Account
          </h3>

          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
            <li>
              <Link
                href="/login"
                className="rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Log in
              </Link>
            </li>

            <li>
              <Link
                href="/signup"
                className="rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Create an account
              </Link>
            </li>

            <li>
              <Link
                href="/appointments"
                className="rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Manage appointments
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-center text-sm text-ink-faint sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} MediBook. All rights reserved.</p>
          <p>Made for better healthcare access.</p>
        </Container>
      </div>
    </footer>
  );
}