import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

export function MimbaLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-soft",
        className
      )}
      aria-hidden="true"
    >
      <Boxes className="size-5" />
    </span>
  );
}
