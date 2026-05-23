"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StockEntryForm } from "@/components/products/stock-entry-form";
import { useProducts } from "@/components/products/product-provider";
import { PageContainer } from "@/components/shared/page-container";
import type { StockEntryValues } from "@/lib/products/types";

export default function StockEntryPage() {
  const { products, addStockEntry } = useProducts();
  const router = useRouter();
  const [initialProductId, setInitialProductId] = useState<string | undefined>();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setInitialProductId(searchParams.get("product") || undefined);
  }, []);

  const handleSubmit = async (values: StockEntryValues) => {
    await addStockEntry(values);
    router.push(`/products/${values.productId}`);
  };

  return (
    <PageContainer
      title="স্টক এন্ট্রি"
      description="পণ্য নির্বাচন করুন, স্টক পরিমাণ ও দর লিখুন, তারপর স্টক সেভ করুন।"
    >
      <StockEntryForm
        products={products}
        initialProductId={initialProductId}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
