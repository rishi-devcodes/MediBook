"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  Stethoscope,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedCallbackUrl = searchParams.get("callbackUrl");

  const callbackUrl =
    requestedCallbackUrl &&
    requestedCallbackUrl.startsWith("/") &&
    !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(result?.url || callbackUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const signupHref =
    callbackUrl !== "/"
      ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/signup";

  return (
    <main className="py-12 sm:py-20">
      <Container>
        <div className="mx-auto max-w-md">
          <Card>
            <CardBody className="p-7 sm:p-9">
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Stethoscope className="h-6 w-6" />
                </span>

                <h1 className="mt-5 text-2xl font-semibold text-ink">
                  Welcome back
                </h1>

                <p className="mt-1 text-sm text-ink-muted">
                  Log in to manage your MediBook appointments.
                </p>
              </div>

              <form
                onSubmit={submit}
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={!!error}
                    className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-ink outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    aria-describedby={error ? "login-error" : undefined}
                    className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-ink outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Your password"
                  />
                </div>

                {error && (
                  <p
                    id="login-error"
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Logging in…" : "Log in"}

                  {!loading && (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-1 text-sm text-ink-muted">
                <span>New to MediBook?</span>

                <Link
                  href={signupHref}
                  className="font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Create an account
                </Link>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-faint">
                <LockKeyhole className="h-3.5 w-3.5" />
                Passwords are stored as secure hashes.
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="py-12 sm:py-20">
      <Container>
        <div className="mx-auto max-w-md">
          <Card>
            <CardBody className="p-7 sm:p-9">
              <div className="animate-pulse">
                <div className="mx-auto h-12 w-12 rounded-xl bg-surface-muted" />
                <div className="mx-auto mt-5 h-7 w-36 rounded bg-surface-muted" />
                <div className="mx-auto mt-2 h-4 w-60 rounded bg-surface-muted" />

                <div className="mt-7 space-y-5">
                  <div className="h-11 rounded-lg bg-surface-muted" />
                  <div className="h-11 rounded-lg bg-surface-muted" />
                  <div className="h-11 rounded-lg bg-surface-muted" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}