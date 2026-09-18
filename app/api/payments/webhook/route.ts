import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Appointment } from "@/lib/models/Appointment";
import { Payment } from "@/lib/models/Payment";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers.get("x-razorpay-signature");
    const rawBody = await request.text();
    if (!secret || !signature) return NextResponse.json({ error: "Invalid webhook request." }, { status: 400 });

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const actual = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actual.length !== expectedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actual)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    if (event.event === "payment.captured") {
      const entity = event.payload?.payment?.entity;
      const paymentId = entity?.id;
      const orderId = entity?.order_id;
      if (paymentId && orderId) {
        await connectToDatabase();
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment) {
          payment.razorpayPaymentId = paymentId;
          payment.status = "paid";
          payment.method = entity.method ?? null;
          await payment.save();
          await Appointment.updateOne({ _id: payment.appointmentId, status: "pending" }, { $set: { status: "confirmed" } });
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("POST /api/payments/webhook failed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
