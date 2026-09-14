import { Card, CardBody } from "@/components/ui/Card";

export function DoctorCardSkeleton() {
  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-surface-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-surface-muted" />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <div className="h-6 w-16 animate-pulse rounded bg-surface-muted" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-muted" />
        </div>
      </CardBody>
    </Card>
  );
}
