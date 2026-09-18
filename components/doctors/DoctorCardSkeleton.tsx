import { Card, CardBody } from "@/components/ui/Card";

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-surface-muted ${className}`}
    />
  );
}

export function DoctorCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardBody className="flex flex-1 flex-col gap-4">
        {/* Doctor identity */}
        <div className="flex items-start gap-4">
          <SkeletonBlock className="h-16 w-16 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-3 w-1/2" />
            <SkeletonBlock className="h-3 w-1/3" />
          </div>
        </div>

        {/* Rating + experience */}
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-3.5 w-24" />
          <SkeletonBlock className="h-3.5 w-20" />
        </div>

        {/* Consultation types */}
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-md" />
          <SkeletonBlock className="h-6 w-20 rounded-md" />
        </div>

        {/* Availability */}
        <SkeletonBlock className="h-4 w-32" />

        {/* Fee + actions */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-5 w-16" />
          </div>

          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24 rounded-lg" />
            <SkeletonBlock className="h-9 w-14 rounded-lg" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}