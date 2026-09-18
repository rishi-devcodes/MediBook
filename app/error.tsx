"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="py-16">
      <Container className="max-w-lg">
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-bg text-danger">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
            <p className="max-w-xs text-sm text-ink-muted">
              An unexpected error occurred. Please try again, or head back
              to the homepage.
            </p>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface-muted"
              >
                Go home
              </Link>
            </div>
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}