import Link from "next/link";
import { ArrowRight, PackagePlus } from "lucide-react";
import { LowStockAlert } from "@/components/products/low-stock-alert";
import { formatStock, isLowStock, StockBadge } from "@/components/products/stock-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products/types";

export function ProductCard({ product }: { product: Product }) {
  const low = isLowStock(product);

  return (
    <Card className={cn("transition-colors hover:border-primary/40", low && "border-amber-200 bg-amber-50/25")}>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/products/${product.id}`} className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold leading-tight">
              {product.productName}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {product.brand} · {product.weight}
            </p>
          </Link>
          <StockBadge product={product} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/65 p-3">
            <p className="text-xs text-muted-foreground">বর্তমান স্টক</p>
            <p className="mt-1 font-heading text-2xl font-semibold">
              {formatStock(product.stockQuantity)}
            </p>
          </div>
          <div className="rounded-md bg-muted/65 p-3">
            <p className="text-xs text-muted-foreground">ক্যাটাগরি</p>
            <p className="mt-1 text-sm font-semibold">{product.category}</p>
          </div>
        </div>

        <LowStockAlert product={product} />

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            শেষ আপডেট: <span className="font-semibold text-foreground">{product.lastStockUpdate}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="icon" aria-label="স্টক যোগ">
              <Link href={`/products/stock-entry?product=${product.id}`}>
                <PackagePlus className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="বিস্তারিত">
              <Link href={`/products/${product.id}`}>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
