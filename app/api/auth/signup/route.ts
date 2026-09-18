import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const parsed = signupSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check your signup details.", details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    const email = parsed.data.email.toLowerCase().trim();
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({ name: parsed.data.name.trim(), email, passwordHash, role: "patient" });

    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/signup failed:", error);
    return NextResponse.json({ error: "Unable to create your account right now. Please try again." }, { status: 500 });
  }
}
