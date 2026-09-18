"use client";

import Link from "next/link";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";

export default function DoctorProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="py-16">
      <Container className="max-w-lg">
        <Link
          href="/doctors"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to doctors
        </Link>

        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-bg text-danger">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
            <p className="max-w-xs text-sm text-ink-muted">
              We couldn&apos;t load this doctor&apos;s profile. This is usually
              temporary — please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600"
            >
              Try again
            </button>
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}