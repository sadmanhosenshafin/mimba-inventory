import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthInput({ label, error, className, id, ...props }: AuthInputProps) {
  const inputId = id || props.name;

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-semibold">{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          className
        )}
        {...props}
      />
      {error ? <span className="block text-sm text-destructive">{error}</span> : null}
    </label>
  );
}
