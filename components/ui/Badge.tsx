import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneStyles: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  neutral: "bg-surface-muted text-ink-muted",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
