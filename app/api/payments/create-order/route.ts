import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { Appointment, isValidObjectId } from "@/lib/models/Appointment";
import { Payment } from "@/lib/models/Payment";
import { createRazorpayOrder } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Please log in before making a payment." }, { status: 401 });
    const body = await request.json();
    const appointmentId = typeof body?.appointmentId === "string" ? body.appointmentId : "";
    if (!isValidObjectId(appointmentId)) return NextResponse.json({ error: "A valid appointment id is required." }, { status: 400 });
    await connectToDatabase();
    const appointment = await Appointment.findOne({ _id: appointmentId, userId: session.user.id }).lean();
    if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    if (appointment.status !== "pending") return NextResponse.json({ error: "This appointment is no longer awaiting payment." }, { status: 409 });
    const existingPayment = await Payment.findOne({ appointmentId }).lean();
    if (existingPayment?.status === "paid") return NextResponse.json({ error: "This appointment has already been paid for." }, { status: 409 });

    const amountInPaise = Math.round(appointment.consultationFee * 100);
    const order = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: `medibook_${appointmentId}`.slice(0, 40),
      notes: { appointmentId },
    });

    await Payment.findOneAndUpdate(
      { appointmentId },
      { appointmentId: appointment._id, razorpayOrderId: order.id, amount: amountInPaise, currency: "INR", status: "created" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appointmentId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
    });
  } catch (error) {
    console.error("POST /api/payments/create-order failed:", error);
    return NextResponse.json({ error: "Unable to start payment right now. Please try again." }, { status: 500 });
  }
}
