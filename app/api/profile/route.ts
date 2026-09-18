import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/models/User";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({
      email,
      _id: { $ne: session.user.id },
    })
      .select("_id")
      .lean();

    if (existingUser) {
      return NextResponse.json(
        { error: "This email address is already in use." },
        { status: 409 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          name,
          email,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("name email role createdAt")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("PATCH /api/profile failed:", error);

    return NextResponse.json(
      {
        error:
          "Unable to update profile right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}