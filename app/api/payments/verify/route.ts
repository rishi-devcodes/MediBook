import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { Appointment, isValidObjectId } from "@/lib/models/Appointment";
import { Payment } from "@/lib/models/Payment";
import { getRazorpayOrder, getRazorpayPayment } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in before verifying a payment." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body ?? {};

    if (
      ![
        appointmentId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      ].every((value) => typeof value === "string" && value.length > 0)
    ) {
      return NextResponse.json(
        { error: "Incomplete payment verification data." },
        { status: 400 }
      );
    }

    if (!isValidObjectId(appointmentId)) {
      return NextResponse.json(
        { error: "Invalid appointment id." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const actual = Buffer.from(razorpay_signature);
    const expected = Buffer.from(expectedSignature);

    if (
      actual.length !== expected.length ||
      !crypto.timingSafeEqual(expected, actual)
    ) {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Make sure this appointment belongs to the logged-in user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: session.user.id,
    }).lean();

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    const paymentRecord = await Payment.findOne({
      appointmentId,
    }).lean();

    if (
      !paymentRecord ||
      paymentRecord.razorpayOrderId !== razorpay_order_id
    ) {
      return NextResponse.json(
        { error: "Payment order does not match this appointment." },
        { status: 400 }
      );
    }

    // Idempotency: if this payment was already processed,
    // don't process it again.
    if (paymentRecord.status === "paid") {
      return NextResponse.json({
        success: true,
        appointmentId,
        paymentId: paymentRecord.razorpayPaymentId,
        alreadyProcessed: true,
      });
    }

    // The appointment must still be awaiting payment.
    if (appointment.status !== "pending") {
      return NextResponse.json(
        { error: "This appointment is no longer awaiting payment." },
        { status: 409 }
      );
    }

    // Verify the order directly with Razorpay
    const order = await getRazorpayOrder(razorpay_order_id);

    // Verify the payment directly with Razorpay
    const payment = await getRazorpayPayment(razorpay_payment_id);

    const expectedAmount = Math.round(appointment.consultationFee * 100);

    // Verify Razorpay order details
    if (
      order.id !== razorpay_order_id ||
      order.amount !== expectedAmount ||
      order.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "Payment amount or order details could not be verified." },
        { status: 400 }
      );
    }

    // Verify Razorpay payment details
    if (
      payment.id !== razorpay_payment_id ||
      payment.order_id !== razorpay_order_id ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "Payment details could not be verified." },
        { status: 400 }
      );
    }

    // Payment must be captured
    if (payment.status !== "captured") {
      await Payment.updateOne(
        {
          _id: paymentRecord._id,
          status: { $ne: "paid" },
        },
        {
          $set: {
            razorpayPaymentId: payment.id,
            status: "failed",
            method: payment.method ?? null,
          },
        }
      );

      return NextResponse.json(
        { error: "Payment has not been captured." },
        { status: 400 }
      );
    }

    // Atomically mark payment as paid.
    // This prevents two simultaneous verification requests
    // from processing the same payment twice.
    const updatedPayment = await Payment.findOneAndUpdate(
      {
        _id: paymentRecord._id,
        status: { $ne: "paid" },
      },
      {
        $set: {
          razorpayPaymentId: payment.id,
          status: "paid",
          method: payment.method ?? null,
        },
      },
      {
        new: true,
      }
    ).lean();

    if (!updatedPayment) {
      return NextResponse.json({
        success: true,
        appointmentId,
        paymentId: payment.id,
        alreadyProcessed: true,
      });
    }

    // Confirm the appointment only if it is still pending.
    await Appointment.updateOne(
      {
        _id: appointmentId,
        userId: session.user.id,
        status: "pending",
      },
      {
        $set: {
          status: "confirmed",
        },
      }
    );

    return NextResponse.json({
      success: true,
      appointmentId,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("POST /api/payments/verify failed:", error);

    return NextResponse.json(
      { error: "Unable to verify this payment right now." },
      { status: 500 }
    );
  }
}