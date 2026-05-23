import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products/types";

const numberFormatter = new Intl.NumberFormat("bn-BD");

export function isLowStock(product: Product) {
  return product.stockQuantity <= product.minimumStockLimit;
}

export function StockBadge({ product }: { product: Product }) {
  const low = isLowStock(product);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
        low
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : "bg-emerald-50 text-emerald-700 ring-emerald-100"
      )}
    >
      {low ? "স্টক প্রায় শেষ" : "স্টক আছে"}
    </span>
  );
}

export function formatStock(value: number) {
  return numberFormatter.format(value);
}
