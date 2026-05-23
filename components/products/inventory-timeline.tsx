import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import type { InventoryActivity } from "@/lib/products/types";
import { formatStock } from "@/components/products/stock-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InventoryTimeline({
  activities,
  onDelete
}: {
  activities: InventoryActivity[];
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const isAdded = activity.type === "added";
        const Icon = isAdded ? ArrowUp : ArrowDown;

        return (
          <div key={activity.id} className="flex gap-3 rounded-lg border bg-card p-4 shadow-soft">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-md",
                isAdded ? "bg-secondary text-primary" : "bg-amber-50 text-amber-700"
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 tablet:flex-row tablet:items-start tablet:justify-between">
                <p className="truncate font-semibold">{activity.productName}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/products/stock-entry/${activity.id}/edit`}>
                      <Pencil className="size-4" />
                      এডিট
                    </Link>
                  </Button>
                  {onDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(activity.id)}
                    >
                      <Trash2 className="size-4" />
                      ডিলিট
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{activity.note}</p>
              <p className="mt-2 font-heading text-lg font-semibold">
                {isAdded ? "+" : "-"}
                {formatStock(activity.quantityChange)} {activity.unitType}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
