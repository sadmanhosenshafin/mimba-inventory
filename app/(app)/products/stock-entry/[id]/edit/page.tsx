"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useProducts } from "@/components/products/product-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifyBusinessDataChanged } from "@/lib/live-data/events";
import { stockApi } from "@/services/api/stock";

export default function StockEntryEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { products, refreshProducts } = useProducts();
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadEntry() {
      const response = await stockApi.show(params.id);
      const entry = response.data.data.stock_entry;
      setProductId(String(entry.product_id));
      setType(entry.type || "in");
      setQuantity(String(entry.quantity || ""));
      setBuyingPrice(String(entry.buy_price || entry.product?.buy_price || ""));
      setSellingPrice(String(entry.sell_price || entry.product?.sell_price || ""));
      setSupplier(entry.supplier || entry.product?.supplier || "");
      setDate((entry.date || new Date().toISOString()).slice(0, 10));
      setNote(entry.note || "");
    }

    void loadEntry();
  }, [params.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!productId || !quantity) {
      setError("পণ্য ও স্টক পরিমাণ দিন।");
      return;
    }

    setIsSubmitting(true);
    try {
      await stockApi.update(params.id, {
        product_id: Number(productId),
        quantity: Number(quantity) || 0,
        type,
        buy_price: Number(buyingPrice) || 0,
        sell_price: Number(sellingPrice) || 0,
        supplier,
        date,
        note
      });
      await refreshProducts();
      notifyBusinessDataChanged();
      router.push("/products/activity");
    } catch {
      setError("স্টক এন্ট্রি আপডেট করা যায়নি। স্টক যথেষ্ট আছে কিনা দেখুন।");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer
      title="স্টক এন্ট্রি এডিট"
      description="ভুল স্টক এন্ট্রি সংশোধন করলে inventory স্বয়ংক্রিয়ভাবে adjust হবে।"
    >
      <Card>
        <CardHeader>
          <CardTitle>স্টক তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 tablet:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">পণ্য নির্বাচন</span>
              <select className="h-12 w-full rounded-md border bg-background px-4" value={productId} onChange={(event) => setProductId(event.target.value)}>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.productName}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">ধরন</span>
              <select className="h-12 w-full rounded-md border bg-background px-4" value={type} onChange={(event) => setType(event.target.value as "in" | "out")}>
                <option value="in">স্টক যোগ</option>
                <option value="out">স্টক কমানো</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">স্টক পরিমাণ</span>
              <input className="h-12 w-full rounded-md border bg-background px-4" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="numeric" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">ক্রয় দর</span>
              <input className="h-12 w-full rounded-md border bg-background px-4" value={buyingPrice} onChange={(event) => setBuyingPrice(event.target.value)} inputMode="decimal" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">বিক্রয় দর</span>
              <input className="h-12 w-full rounded-md border bg-background px-4" value={sellingPrice} onChange={(event) => setSellingPrice(event.target.value)} inputMode="decimal" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">সাপ্লায়ার</span>
              <input className="h-12 w-full rounded-md border bg-background px-4" value={supplier} onChange={(event) => setSupplier(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">তারিখ</span>
              <input className="h-12 w-full rounded-md border bg-background px-4" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label className="block space-y-2 tablet:col-span-2">
              <span className="text-sm font-semibold text-muted-foreground">নোট</span>
              <textarea className="min-h-24 w-full rounded-md border bg-background px-4 py-3" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive tablet:col-span-2">{error}</p> : null}
            <Button type="submit" size="lg" className="tablet:col-span-2" disabled={isSubmitting}>
              <Save className="size-5" />
              {isSubmitting ? "আপডেট হচ্ছে" : "স্টক এন্ট্রি আপডেট করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
