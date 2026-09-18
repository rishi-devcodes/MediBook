import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export const dynamic = "force-dynamic";

function formatJoinedDate(value: Date | string | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent("/profile")}`
    );
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id)
    .select("name email role createdAt")
    .lean();

  if (!user) {
    redirect("/login");
  }

  const joinedDate = formatJoinedDate(user.createdAt);

  return (
    <main className="min-h-screen bg-slate-50 py-10 sm:py-12">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1958C1]">
            MediBook
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0F172A]">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500">
            View and manage your account information.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-blue-50/60 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1958C1] text-white">
                <UserRound className="h-8 w-8" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="break-words text-2xl font-bold text-slate-900">
                  {user.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  MediBook patient
                </p>
              </div>

              <EditProfileForm
                currentName={user.name}
                currentEmail={user.email}
              />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Account Information
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1958C1]">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Full Name
                  </p>

                  <p className="mt-1 break-words font-semibold text-slate-900">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1958C1]">
                  <Mail className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email Address
                  </p>

                  <p className="mt-1 break-words font-semibold text-slate-900">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1958C1]">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Account Type
                  </p>

                  <p className="mt-1 font-semibold capitalize text-slate-900">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Member Since
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {joinedDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ChangePasswordForm />
      </div>
    </main>
  );
}