import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 rounded-lg border border-border-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-faint",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100",
            error && "border-danger focus:border-danger focus:ring-red-100",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : hint ? (
          <p className="text-sm text-ink-faint">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
