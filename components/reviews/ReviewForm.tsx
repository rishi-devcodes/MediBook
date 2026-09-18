"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";

interface ReviewFormProps {
  appointmentId: string;
}

export function ReviewForm({ appointmentId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (comment.trim().length < 5) {
      setError("Review must contain at least 5 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to submit review.");
        return;
      }

      setSuccess(true);
      setComment("");
      setRating(0);
    } catch {
      setError("Unable to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />

          <div>
            <p className="font-semibold text-green-800">
              Review submitted successfully!
            </p>
            <p className="mt-1 text-sm text-green-700">
              Thank you for sharing your experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayedRating = hoveredRating || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Rate your experience
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Share your experience with this doctor.
        </p>
      </div>

      {/* Rating */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-slate-900">
          Your rating
        </p>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Rate ${star} out of 5`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="rounded-md p-1 transition hover:scale-105"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= displayedRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}

          {rating > 0 ? (
            <span className="ml-2 text-sm font-medium text-slate-600">
              {rating}/5
            </span>
          ) : null}
        </div>
      </div>

      {/* Comment */}
      <div className="mt-6">
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-semibold text-slate-900"
        >
          Your review
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell us about your experience..."
          rows={5}
          maxLength={500}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1958C1] focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-1 text-right text-xs text-slate-400">
          {comment.length}/500
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1958C1] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#123F8C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting review..." : "Submit Review"}
      </button>
    </form>
  );
}