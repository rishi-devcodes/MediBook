"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, Stethoscope, X } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const primaryButtonClass =
  "inline-flex h-9 items-center justify-center rounded-lg bg-primary-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/appointments", label: "My Appointments" },
  { href: "/profile", label: "Profile" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const authenticated = status === "authenticated";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label="MediBook home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Stethoscope className="h-5 w-5" />
          </span>

          <span className="font-display text-lg font-semibold text-ink">
            MediBook
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[15px] font-medium transition-colors",
                  active
                    ? "text-primary-500"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authenticated ? (
            <>
              <span className="max-w-36 truncate text-sm font-medium text-ink-muted">
                Hi, {session?.user?.name?.split(" ")[0]}
              </span>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md text-[15px] font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md text-[15px] font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Log in
              </Link>

              <Link href="/signup" className={primaryButtonClass}>
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </Container>

      {open && (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-surface md:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            <nav aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => {
                const active = isNavActive(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                      active
                        ? "bg-primary-50 text-primary-600"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              {authenticated ? (
                <>
                  <div className="px-3 py-1 text-sm text-ink-faint">
                    Signed in as{" "}
                    <span className="font-medium text-ink-muted">
                      {session?.user?.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/signup"
                    className={cn(primaryButtonClass, "h-11 w-full")}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}