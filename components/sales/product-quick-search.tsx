"use client";

import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { formatStock } from "@/components/products/stock-badge";
import type { Product } from "@/lib/products/types";

export function ProductQuickSearch({
  products,
  onSelect
}: {
  products: Product[];
  onSelect: (product: Product) => void;
}) {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return products.slice(0, 5);
    return products.filter((product) =>
      [product.productName, product.brand, product.category]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm)
    );
  }, [products, query]);

  return (
    <section className="min-w-0 space-y-3">
      <div className="relative">
        <PackageSearch className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="পণ্য খুঁজুন"
          className="h-14 w-full rounded-md border bg-card pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="grid gap-2 tablet:grid-cols-2">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            type="button"
            className="min-h-16 rounded-lg border bg-card p-3 text-left shadow-soft transition-colors hover:border-primary/40"
            onClick={() => {
              onSelect(product);
              setQuery("");
            }}
          >
            <span className="block font-semibold">{product.productName}</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {product.brand} · স্টক {formatStock(product.stockQuantity)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
