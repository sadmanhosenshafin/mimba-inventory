import { AlertTriangle } from "lucide-react";
import type { Product } from "@/lib/products/types";
import { formatStock } from "@/components/products/stock-badge";

export function LowStockAlert({ product }: { product: Product }) {
  if (product.stockQuantity > product.minimumStockLimit) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-100">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" />
      <p className="text-sm font-medium leading-6">
        স্টক প্রায় শেষ। এখন আছে {formatStock(product.stockQuantity)} বস্তা, কমপক্ষে{" "}
        {formatStock(product.minimumStockLimit)} বস্তা সর্বনিম্ন রাখা ভালো।
      </p>
    </div>
  );
}
