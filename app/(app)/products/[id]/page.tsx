"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, PackagePlus, ReceiptText, StickyNote } from "lucide-react";
import { InventoryTimeline } from "@/components/products/inventory-timeline";
import { LowStockAlert } from "@/components/products/low-stock-alert";
import { useProducts } from "@/components/products/product-provider";
import { formatStock, StockBadge } from "@/components/products/stock-badge";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const takaFormatter = new Intl.NumberFormat("bn-BD");

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getProductById, activities } = useProducts();
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  const productActivities = activities.filter(
    (activity) => activity.productId === product.id
  );

  return (
    <PageContainer
      title={product.productName}
      description={`${product.brand} · ${product.category} · ${product.weight}`}
      action={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/products">
              <ArrowLeft className="size-5" />
              ফিরে যান
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/products/stock-entry?product=${product.id}`}>
              <PackagePlus className="size-5" />
              স্টক যোগ
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 laptop:grid-cols-[0.95fr_1.4fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>বর্তমান স্টক</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-4xl font-semibold">
                  {formatStock(product.stockQuantity)} বস্তা
                </p>
                <StockBadge product={product} />
              </div>
              <LowStockAlert product={product} />
              <InfoRow label="সর্বনিম্ন স্টক" value={`${formatStock(product.minimumStockLimit)} বস্তা`} />
              <InfoRow label="শেষ আপডেট" value={product.lastStockUpdate} />
              <InfoRow label="যোগ হয়েছে" value={product.createdDate} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>দর ও সাপ্লায়ার</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <InfoRow label="ক্রয় দর" value={`৳ ${takaFormatter.format(product.buyingPrice)}`} />
              <InfoRow label="বিক্রয় দর" value={`৳ ${takaFormatter.format(product.sellingPrice)}`} />
              <InfoRow label="সাপ্লায়ার" value={product.supplier} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="size-5 text-primary" />
                নোট
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground">{product.notes}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক স্টক চলাচল</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryTimeline activities={productActivities} />
          </CardContent>
        </Card>
      </div>

      <Button asChild className="fixed bottom-24 right-4 z-40 rounded-full px-5 laptop:bottom-8 laptop:right-8">
        <Link href={`/products/stock-entry?product=${product.id}`}>
          <ReceiptText className="size-5" />
          স্টক যোগ করুন
        </Link>
      </Button>
    </PageContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold leading-6">{value}</p>
    </div>
  );
}
