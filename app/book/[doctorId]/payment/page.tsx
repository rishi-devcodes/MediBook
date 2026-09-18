"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  UserRound,
  Video,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";

interface Props {
  params: {
    doctorId: string;
  };
  searchParams: {
    appointmentId?: string;
  };
}

interface AppointmentData {
  _id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  consultationFee: number;
  status: string;
  doctorId: {
    name: string;
    specialty: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const formatAppointmentDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export default function PaymentPage({
  params,
  searchParams,
}: Props) {
  const appointmentId = searchParams.appointmentId;

  const [appointment, setAppointment] =
    useState<AppointmentData | null>(null);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      setError("No appointment was provided.");
      return;
    }

    fetch(`/api/appointments/${appointmentId}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Unable to load appointment."
          );
        }

        return data;
      })
      .then((data) => setAppointment(data.appointment))
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointment."
        )
      )
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const startPayment = async () => {
    if (
      !appointmentId ||
      !appointment ||
      appointment.status !== "pending" ||
      !scriptReady ||
      !window.Razorpay
    ) {
      return;
    }

    setError("");
    setPaying(true);

    try {
      const orderResponse = await fetch(
        "/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error || "Unable to start payment."
        );
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MediBook",
        description: `Doctor consultation with ${appointment.doctorId.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.patientName,
          email: orderData.patientEmail,
          contact: orderData.patientPhone,
        },
        theme: {
          color: "#1958C1",
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              "/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  appointmentId,
                  ...response,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error ||
                  "Payment verification failed."
              );
            }

            window.location.href = `/booking/${appointmentId}/confirmation`;
          } catch (err) {
            setPaying(false);

            setError(
              err instanceof Error
                ? err.message
                : "Payment verification failed."
            );
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      razorpay.open();
    } catch (err) {
      setPaying(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment."
      );
    }
  };

  const isPending = appointment?.status === "pending";
  const isConfirmed = appointment?.status === "confirmed";
  const isCancelled = appointment?.status === "cancelled";
  const isCompleted = appointment?.status === "completed";

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptReady(true);
          setScriptError(false);
        }}
        onError={() => {
          setScriptError(true);
          setError(
            "Payment checkout could not be loaded. Please refresh and try again."
          );
        }}
      />

      <main className="py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Link
              href={`/book/${params.doctorId}`}
              className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to booking
            </Link>

            <Card>
              <CardBody className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <CreditCard className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                      Secure checkout
                    </p>

                    <h1 className="text-2xl font-semibold">
                      Complete your payment
                    </h1>
                  </div>
                </div>

                {loading ? (
                  <div
                    aria-live="polite"
                    className="py-12 text-center text-sm text-ink-muted"
                  >
                    Loading appointment details…
                  </div>
                ) : error && !appointment ? (
                  <div
                    role="alert"
                    className="mt-7 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : appointment ? (
                  <>
                    <div className="mt-7 rounded-xl border border-border bg-surface p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-ink-faint">
                            Doctor
                          </p>

                          <p className="mt-1 font-semibold">
                            {appointment.doctorId.name}
                          </p>

                          <p className="text-sm text-ink-muted">
                            {appointment.doctorId.specialty}
                          </p>
                        </div>

                        {isPending && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Payment pending
                          </span>
                        )}

                        {isConfirmed && (
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            Confirmed
                          </span>
                        )}

                        {isCancelled && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            Cancelled
                          </span>
                        )}

                        {isCompleted && (
                          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="flex gap-3">
                          <CalendarDays className="mt-0.5 h-4 w-4 text-primary-600" />

                          <div>
                            <p className="text-xs text-ink-faint">
                              Appointment
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {formatAppointmentDate(
                                appointment.appointmentDate
                              )}{" "}
                              · {appointment.appointmentTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {appointment.consultationType === "Video" ? (
                            <Video className="mt-0.5 h-4 w-4 text-primary-600" />
                          ) : (
                            <Building2 className="mt-0.5 h-4 w-4 text-primary-600" />
                          )}

                          <div>
                            <p className="text-xs text-ink-faint">
                              Consultation
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {appointment.consultationType}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <UserRound className="mt-0.5 h-4 w-4 text-primary-600" />

                          <div>
                            <p className="text-xs text-ink-faint">
                              Patient
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {appointment.patientName}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm text-ink-muted">
                          Consultation fee
                        </span>

                        <span className="text-xl font-semibold">
                          ₹{appointment.consultationFee}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      </div>
                    )}

                    {isConfirmed && (
                      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <span>
                            This appointment is already confirmed.
                          </span>
                        </div>
                      </div>
                    )}

                    {isCancelled && (
                      <div
                        role="alert"
                        className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                      >
                        This appointment has been cancelled and
                        cannot be paid for.
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-6 rounded-lg border border-border bg-surface-muted p-4 text-sm text-ink-muted">
                        This appointment has already been
                        completed.
                      </div>
                    )}

                    {isPending && (
                      <button
                        type="button"
                        onClick={startPayment}
                        disabled={
                          paying ||
                          !scriptReady ||
                          scriptError
                        }
                        aria-busy={paying}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {paying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing…
                          </>
                        ) : scriptError ? (
                          "Checkout unavailable — refresh"
                        ) : !scriptReady ? (
                          "Loading secure checkout…"
                        ) : (
                          `Pay ₹${appointment.consultationFee}`
                        )}
                      </button>
                    )}

                    <p className="mt-4 text-center text-xs leading-5 text-ink-faint">
                      You’ll be redirected to Razorpay Checkout to
                      complete the payment. This MediBook environment
                      is connected to Razorpay Test Mode.
                    </p>
                  </>
                ) : null}
              </CardBody>
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}