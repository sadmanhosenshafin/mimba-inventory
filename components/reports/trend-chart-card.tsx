import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartPoint = {
  label: string;
  value: number;
};

export function TrendChartCard({
  title,
  data,
  variant = "bar"
}: {
  title: string;
  data: ChartPoint[];
  variant?: "bar" | "line";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end gap-2 rounded-md bg-muted/45 p-4">
          {data.map((point, index) => (
            <div key={`${point.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span
                className={cn(
                  "w-full rounded-sm bg-primary/75",
                  variant === "line" && "rounded-full"
                )}
                style={{ height: `${Math.max(point.value, 8)}%` }}
              />
              <span className="text-xs text-muted-foreground">{point.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
