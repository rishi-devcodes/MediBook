"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react";

interface EditProfileFormProps {
  currentName: string;
  currentEmail: string;
}

export function EditProfileForm({
  currentName,
  currentEmail,
}: EditProfileFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function openForm() {
    setName(currentName);
    setEmail(currentEmail);
    setError("");
    setSuccess(false);
    setOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setOpen(false);
    setError("");
    setSuccess(false);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Name must be between 2 and 100 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to update profile.");
        return;
      }

      setSuccess(true);

      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      setError("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openForm}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1958C1] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#12479d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2"
      >
        <Pencil className="h-4 w-4" />
        Edit Profile
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="min-w-0">
                <h2
                  id="edit-profile-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your account information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close edit profile dialog"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-slate-900"
                >
                  Full Name
                </label>

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  maxLength={100}
                  autoComplete="name"
                  autoCapitalize="words"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1958C1] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-slate-900"
                >
                  Email Address
                </label>

                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  maxLength={160}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
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
                  Profile updated successfully.
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  aria-busy={saving}
                  className="rounded-xl bg-[#1958C1] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#12479d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1958C1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}