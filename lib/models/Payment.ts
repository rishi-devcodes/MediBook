import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const PaymentSchema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: null },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    status: {
      type: String,
      required: true,
      enum: ["created", "paid", "failed", "cancelled"],
      default: "created",
    },
    method: { type: String, default: null },
  },
  { timestamps: true }
);

export type PaymentSchemaType = InferSchemaType<typeof PaymentSchema>;
PaymentSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayPaymentId: { $type: "string" },
    },
  }
);

export const Payment: Model<PaymentSchemaType> =
  (models.Payment as Model<PaymentSchemaType>) ||
  model<PaymentSchemaType>("Payment", PaymentSchema);
