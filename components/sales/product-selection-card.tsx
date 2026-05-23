import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/sales/quantity-selector";
import { Button } from "@/components/ui/button";
import type { SaleItem } from "@/lib/sales/types";

const takaFormatter = new Intl.NumberFormat("bn-BD");

export function ProductSelectionCard({
  item,
  onQuantityChange,
  onRemove
}: {
  item: SaleItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold">{item.productName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            স্টক আছে {takaFormatter.format(item.availableStock)} বস্তা · দর ৳{" "}
            {takaFormatter.format(item.unitPrice)}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="মুছুন" onClick={onRemove}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
      <div className="mt-4">
        <QuantitySelector value={item.quantity} onChange={onQuantityChange} />
      </div>
      <div className="mt-4 rounded-md bg-muted/65 p-3">
        <p className="text-sm text-muted-foreground">সাবটোটাল</p>
        <p className="font-heading text-2xl font-semibold">
          ৳ {takaFormatter.format(item.quantity * item.unitPrice)}
        </p>
      </div>
    </div>
  );
}
