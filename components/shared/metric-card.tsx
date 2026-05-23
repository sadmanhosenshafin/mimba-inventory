import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger";
};

const toneClass = {
  default: "bg-secondary text-primary",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700"
};

export function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "default"
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
        <span className={cn("flex size-10 items-center justify-center rounded-md", toneClass[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-semibold leading-tight tablet:text-3xl">
          {value}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
