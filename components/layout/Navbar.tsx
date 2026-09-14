"use client";

import Link from "next/link";
import { useState } from "react";
import { Stethoscope, Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const primaryButtonClass =
  "inline-flex h-9 items-center justify-center rounded-lg bg-primary-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-600";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/appointments", label: "My Appointments" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="MediBook home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold text-ink">MediBook</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-[15px] font-medium text-ink-muted hover:text-ink">
            Log in
          </Link>
          <Link href="/signup" className={primaryButtonClass}>
            Sign up
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className={cn(primaryButtonClass, "h-11 w-full")}
              >
                Sign up
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
