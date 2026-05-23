"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { useCustomers } from "@/components/customers/customer-provider";
import { useProducts } from "@/components/products/product-provider";
import { useSales } from "@/components/sales/sales-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SaleItem } from "@/lib/sales/types";

export default function SaleEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { getSaleById, updateSale } = useSales();
  const sale = getSaleById(params.id);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paidAmount, setPaidAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!sale) return;
    setCustomerId(sale.customerId);
    setItems(sale.items);
    setPaidAmount(String(sale.paidAmount));
    setNote(sale.note || "");
  }, [sale]);

  const totalAmount = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    [items]
  );
  const dueAmount = Math.max(totalAmount - (Number(paidAmount) || 0), 0);

  if (!sale) notFound();
  const currentSale = sale;

  function addItem() {
    const product = products[0];
    if (!product) return;
    setItems((current) => [
      ...current,
      {
        productId: product.id,
        productName: product.productName,
        availableStock: product.stockQuantity,
        quantity: 1,
        unitPrice: product.sellingPrice
      }
    ]);
  }

  function updateItem(index: number, patch: Partial<SaleItem>) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const next = { ...item, ...patch };
        if (patch.productId) {
          const product = products.find((entry) => entry.id === patch.productId);
          if (product) {
            next.productName = product.productName;
            next.availableStock = product.stockQuantity;
            next.unitPrice = product.sellingPrice;
          }
        }
        return next;
      })
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!customerId) {
      setError("কাস্টমার নির্বাচন করুন।");
      return;
    }

    if (items.length === 0) {
      setError("কমপক্ষে একটি পণ্য রাখুন।");
      return;
    }

    for (const item of items) {
      if (item.quantity < 1 || item.unitPrice < 0) {
        setError("পণ্যের পরিমাণ ও বিক্রয় দর ঠিক করুন।");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updated = await updateSale(currentSale.id, {
        customerId,
        customerName: customers.find((customer) => customer.id === customerId)?.shopName || currentSale.customerName,
        customerMobile: customers.find((customer) => customer.id === customerId)?.mobile || currentSale.customerMobile,
        items,
        paidAmount: Number(paidAmount) || 0,
        note
      });
      router.push(`/sales/${updated.id}`);
    } catch {
      setError("বিক্রি আপডেট করা যায়নি। স্টক ও তথ্য ঠিক আছে কিনা দেখুন।");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer
      title="বিক্রি এডিট"
        description={`${currentSale.customerName} · ভুল সংশোধন করলে স্টক ও বাকি স্বয়ংক্রিয়ভাবে আপডেট হবে।`}
    >
      <form className="grid gap-4 laptop:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>কাস্টমার ও পেমেন্ট</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 tablet:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">কাস্টমার</span>
                <select className="h-12 w-full rounded-md border bg-background px-4" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.shopName}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">পরিশোধ</span>
                <input className="h-12 w-full rounded-md border bg-background px-4" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} inputMode="decimal" />
              </label>
              <label className="block space-y-2 tablet:col-span-2">
                <span className="text-sm font-semibold text-muted-foreground">নোট</span>
                <textarea className="min-h-20 w-full rounded-md border bg-background px-4 py-3" value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>পণ্য</CardTitle>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="size-5" />
                পণ্য যোগ
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="grid gap-3 rounded-md border p-3 tablet:grid-cols-[1fr_120px_140px_auto] tablet:items-end">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-muted-foreground">পণ্য</span>
                    <select className="h-12 w-full rounded-md border bg-background px-4" value={item.productId} onChange={(event) => updateItem(index, { productId: event.target.value })}>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.productName}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-muted-foreground">পরিমাণ</span>
                    <input className="h-12 w-full rounded-md border bg-background px-4" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) || 0 })} inputMode="numeric" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-muted-foreground">বিক্রয় দর</span>
                    <input className="h-12 w-full rounded-md border bg-background px-4" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) || 0 })} inputMode="decimal" />
                  </label>
                  <Button type="button" variant="ghost" size="icon" aria-label="মুছুন" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    <Trash2 className="size-5 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>হিসাব</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Info label="মোট" value={`৳ ${totalAmount}`} />
              <Info label="পরিশোধ" value={`৳ ${Number(paidAmount) || 0}`} />
              <Info label="বাকি" value={`৳ ${dueAmount}`} />
              {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                <Save className="size-5" />
                {isSubmitting ? "আপডেট হচ্ছে" : "বিক্রি আপডেট করুন"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-semibold">{value}</p>
    </div>
  );
}
