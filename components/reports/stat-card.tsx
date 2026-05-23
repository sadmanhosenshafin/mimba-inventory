import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  onClick
}: {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  onClick?: () => void;
}) {
  const content = (
    <Card className={cn(onClick && "cursor-pointer transition-colors hover:border-primary/50")}>
      <CardContent className="flex items-center gap-3 p-4 text-left sm:p-5">
        <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate font-heading text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <button type="button" className="block w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    content
  );
}
