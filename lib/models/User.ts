import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 160 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient", required: true },
  },
  { timestamps: true }
);

export type UserSchemaType = InferSchemaType<typeof UserSchema>;

export const User: Model<UserSchemaType> =
  (models.User as Model<UserSchemaType>) || model<UserSchemaType>("User", UserSchema);
