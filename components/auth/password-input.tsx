"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function PasswordInput({
  label,
  error,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = id || props.name;

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-semibold">{label}</span>
      <div className="relative">
        <input
          id={inputId}
          type={isVisible ? "text" : "password"}
          className={cn(
            "h-12 w-full rounded-md border bg-background px-4 pr-12 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-label={isVisible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </Button>
      </div>
      {error ? <span className="block text-sm text-destructive">{error}</span> : null}
    </label>
  );
}
