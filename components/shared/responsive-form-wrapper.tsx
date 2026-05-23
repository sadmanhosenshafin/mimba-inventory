import { cn } from "@/lib/utils";

export function ResponsiveFormWrapper({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-lg border bg-card p-4 shadow-soft sm:p-5 tablet:grid-cols-2 laptop:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}
