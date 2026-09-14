import { Star } from "lucide-react";
import type { DoctorReview } from "@/types/doctor";

export function ReviewsList({ reviews }: { reviews: DoctorReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-ink-muted">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {reviews.map((review) => (
        <div key={review.id} className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">{review.patientName}</p>
            <span className="text-xs text-ink-faint">
              {new Date(review.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < review.rating
                    ? "h-3.5 w-3.5 fill-warning text-warning"
                    : "h-3.5 w-3.5 text-border-strong"
                }
              />
            ))}
          </div>
          <p className="text-sm text-ink-muted">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
