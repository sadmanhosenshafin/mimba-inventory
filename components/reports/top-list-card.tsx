import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopListCard({
  title,
  items
}: {
  title: string;
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-3 rounded-md bg-muted/60 p-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.label}</p>
              {item.hint ? <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p> : null}
            </div>
            <p className="shrink-0 font-heading text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
