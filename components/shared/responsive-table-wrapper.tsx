import { cn } from "@/lib/utils";

export function ResponsiveTableWrapper({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border bg-card", className)}>
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  );
}
