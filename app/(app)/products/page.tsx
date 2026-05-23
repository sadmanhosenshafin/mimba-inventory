"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Boxes, ClipboardList, PackagePlus, Plus, SearchX } from "lucide-react";
import {
  CategoryFilter,
  type CategoryFilterValue
} from "@/components/products/category-filter";
import { ProductCard } from "@/components/products/product-card";
import { ProductSearch } from "@/components/products/product-search";
import { formatStock, isLowStock } from "@/components/products/stock-badge";
import { useProducts } from "@/components/products/product-provider";
import { EmptyState } from "@/components/customers/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilterValue>("সব");
  const [showLowOnly, setShowLowOnly] = useState(false);

  const lowStockProducts = useMemo(
    () => products.filter((product) => isLowStock(product)),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = searchTerm
        ? [
            product.productName,
            product.brand,
            product.category,
            product.supplier
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm)
        : true;
      const matchesCategory = category === "সব" || product.category === category;
      const matchesStock = showLowOnly ? isLowStock(product) : true;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [category, products, query, showLowOnly]);

  return (
    <PageContainer
      title="স্টক"
      description="পণ্য, মজুদ, কম স্টক ও স্টক চলাচল এক জায়গায় দেখুন।"
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/products/activity">
              <ClipboardList className="size-5" />
              হিসাব
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/products/add">
              <Plus className="size-5" />
              পণ্য যোগ
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 tablet:grid-cols-3">
        <MetricCard
          title="মোট পণ্য"
          value={`${formatStock(products.length)}টি`}
          hint="সব ক্যাটাগরি মিলিয়ে"
          icon={Boxes}
        />
        <MetricCard
          title="গুদাম স্টক"
          value={`${formatStock(
            products.reduce((total, product) => total + product.stockQuantity, 0)
          )} বস্তা`}
          hint="লাইভ মজুদ হিসাব"
          icon={PackagePlus}
        />
        <MetricCard
          title="কম স্টক"
          value={`${formatStock(lowStockProducts.length)} পণ্য`}
          hint="আজ নজর দেওয়া দরকার"
          icon={Boxes}
          tone="warning"
        />
      </div>

      <ProductSearch
        query={query}
        onQueryChange={setQuery}
        suggestions={filteredProducts}
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 laptop:flex-row laptop:items-center laptop:justify-between">
          <CategoryFilter value={category} onChange={setCategory} />
          <Button
            type="button"
            variant={showLowOnly ? "secondary" : "outline"}
            onClick={() => setShowLowOnly((current) => !current)}
          >
            কম স্টক দেখুন
          </Button>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="পণ্য পাওয়া যায়নি"
          description="অন্য নাম, ব্র্যান্ড বা ক্যাটাগরি দিয়ে আবার খুঁজুন।"
          action={
            <Button asChild>
              <Link href="/products/add">
                <Plus className="size-5" />
                নতুন পণ্য যোগ
              </Link>
            </Button>
          }
        />
      )}

      <Button asChild className="fixed bottom-24 right-4 z-40 rounded-full px-5 laptop:bottom-8 laptop:right-8">
        <Link href="/products/stock-entry">
          <PackagePlus className="size-5" />
          স্টক যোগ
        </Link>
      </Button>
    </PageContainer>
  );
}
