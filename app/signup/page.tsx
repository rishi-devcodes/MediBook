"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedCallbackUrl = searchParams.get("callbackUrl");

  const callbackUrl =
    requestedCallbackUrl &&
    requestedCallbackUrl.startsWith("/") &&
    !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (normalizedName.length < 2) {
        throw new Error("Please enter your full name.");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create your account."
        );
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error(
          "Account created, but automatic login failed. Please log in."
        );
      }

      router.push(result?.url || callbackUrl);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  const loginHref =
    callbackUrl !== "/"
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";

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
                  Create your account
                </h1>

                <p className="mt-1 text-sm text-ink-muted">
                  Book and manage your healthcare appointments.
                </p>
              </div>

              <form
                onSubmit={submit}
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    autoCapitalize="words"
                    className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-ink outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Your full name"
                  />
                </div>

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
                    minLength={8}
                    autoComplete="new-password"
                    aria-describedby="password-help"
                    className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-ink outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="At least 8 characters"
                  />

                  <p
                    id="password-help"
                    className="mt-1.5 text-xs text-ink-faint"
                  >
                    Use at least 8 characters.
                  </p>
                </div>

                {error && (
                  <p
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
                  {loading
                    ? "Creating account…"
                    : "Create account"}

                  {!loading && (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-1 text-sm text-ink-muted">
                <span>Already have an account?</span>

                <Link
                  href={loginHref}
                  className="font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Log in
                </Link>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-ink-faint">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />

                <span>
                  Your password is stored as a secure hash, not plain text.
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </main>
  );
}

function SignupFallback() {
  return (
    <main className="py-12 sm:py-20">
      <Container>
        <div className="mx-auto max-w-md">
          <Card>
            <CardBody className="p-7 sm:p-9">
              <div className="animate-pulse">
                <div className="mx-auto h-12 w-12 rounded-xl bg-surface-muted" />
                <div className="mx-auto mt-5 h-7 w-44 rounded bg-surface-muted" />
                <div className="mx-auto mt-2 h-4 w-64 rounded bg-surface-muted" />

                <div className="mt-7 space-y-5">
                  <div className="h-11 rounded-lg bg-surface-muted" />
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

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}