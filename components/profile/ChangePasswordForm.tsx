"use client";

import { useState } from "react";
import {
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess(false);

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation do not match."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to change password."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch {
      setError(
        "Unable to change password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function clearError() {
    if (error) setError("");
    if (success) setSuccess(false);
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1958C1]">
          <KeyRound className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Security
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Change your account password.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <div>
          <label
            htmlFor="current-password"
            className="mb-2 block text-sm font-semibold text-slate-900"
          >
            Current Password
          </label>

          <input
            id="current-password"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              clearError();
            }}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1958C1] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="mb-2 block text-sm font-semibold text-slate-900"
          >
            New Password
          </label>

          <input
            id="new-password"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              clearError();
            }}
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1958C1] focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-2 text-xs text-slate-400">
            Use at least 8 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm font-semibold text-slate-900"
          >
            Confirm New Password
          </label>

          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError();
            }}
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1958C1] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Password changed successfully.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          aria-busy={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1958C1] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#12479d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound className="h-4 w-4" />
          {saving ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}