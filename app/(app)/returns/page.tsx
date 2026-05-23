"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Printer, RotateCcw, Search, Trash2 } from "lucide-react";
import { useProducts } from "@/components/products/product-provider";
import { useSales } from "@/components/sales/sales-provider";
import { MetricCard } from "@/components/shared/metric-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifyBusinessDataChanged, subscribeBusinessDataChanged } from "@/lib/live-data/events";
import { returnsApi } from "@/services/api/returns";

const returnReasons = [
  "ভুল পণ্য",
  "ক্ষতিগ্রস্ত পণ্য",
  "অতিরিক্ত পণ্য",
  "কাস্টমার ফেরত দিয়েছে",
  "অন্যান্য"
];

type ReturnRecord = {
  id: number | string;
  sale_id: number | string;
  customer?: { shop_name?: string; phone?: string };
  product?: { name?: string };
  quantity: number | string;
  reason: string;
  note?: string | null;
  return_date?: string;
};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("bn-BD") : "আজ";
}

export default function ReturnsPage() {
  const { sales, refreshSales } = useSales();
  const { refreshProducts } = useProducts();
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState(returnReasons[0]);
  const [returnDate, setReturnDate] = useState(todayDate());
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<ReturnRecord[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyReason, setHistoryReason] = useState("সব");
  const [historyPage, setHistoryPage] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSale = useMemo(
    () => sales.find((sale) => sale.id === selectedSaleId),
    [sales, selectedSaleId]
  );
  const selectedItem = useMemo(
    () => selectedSale?.items.find((item) => item.productId === selectedProductId),
    [selectedProductId, selectedSale]
  );

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sales;

    return sales.filter((sale) =>
      [sale.id, sale.customerName, sale.customerMobile]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [sales, search]);

  const filteredHistory = useMemo(() => {
    const term = historySearch.trim().toLowerCase();

    return history.filter((item) => {
      const matchesSearch = term
        ? [
            item.id,
            item.customer?.shop_name,
            item.customer?.phone,
            item.product?.name,
            item.reason,
            item.note
          ]
            .join(" ")
            .toLowerCase()
            .includes(term)
        : true;
      const matchesReason = historyReason === "সব" || item.reason === historyReason;
      return matchesSearch && matchesReason;
    });
  }, [history, historyReason, historySearch]);

  const paginatedHistory = useMemo(
    () => filteredHistory.slice((historyPage - 1) * 10, historyPage * 10),
    [filteredHistory, historyPage]
  );
  const totalHistoryPages = Math.max(Math.ceil(filteredHistory.length / 10), 1);

  const loadReturns = useCallback(async () => {
    const response = await returnsApi.list({ per_page: 50 });
    const raw = response.data.data?.data ?? response.data.data ?? [];
    setHistory(raw);
  }, []);

  useEffect(() => {
    void loadReturns();
    return subscribeBusinessDataChanged(() => void loadReturns());
  }, [loadReturns]);

  useEffect(() => {
    if (!selectedSaleId && sales[0]) {
      setSelectedSaleId(sales[0].id);
    }
  }, [sales, selectedSaleId]);

  useEffect(() => {
    if (selectedSale?.items[0]) {
      setSelectedProductId(selectedSale.items[0].productId);
    } else {
      setSelectedProductId("");
    }
  }, [selectedSale]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedSale || !selectedItem) {
      setError("বিক্রয় ও পণ্য নির্বাচন করুন।");
      return;
    }

    const returnQuantity = Number(quantity);
    if (!returnQuantity || returnQuantity < 1) {
      setError("ফেরত পরিমাণ দিন।");
      return;
    }

    if (returnQuantity > selectedItem.quantity) {
      setError("ফেরত পরিমাণ বিক্রি হওয়া পরিমাণের বেশি হতে পারবে না।");
      return;
    }

    setIsSubmitting(true);
    try {
      await returnsApi.create({
        sale_id: Number(selectedSale.id),
        product_id: Number(selectedItem.productId),
        quantity: returnQuantity,
        reason,
        return_date: returnDate,
        note: note.trim() || undefined
      });
      setQuantity("");
      setNote("");
      setHistoryPage(1);
      await Promise.all([refreshSales(), refreshProducts(), loadReturns()]);
      notifyBusinessDataChanged();
    } catch (caught) {
      setError("পণ্য ফেরত সেভ করা যায়নি। তথ্য ঠিক আছে কিনা দেখুন।");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number | string) {
    await returnsApi.delete(id);
    await Promise.all([refreshSales(), refreshProducts(), loadReturns()]);
    notifyBusinessDataChanged();
  }

  return (
    <PageContainer
      title="পণ্য ফেরত"
      description="বিক্রি হওয়া পণ্য ফেরত এলে এখানে সেভ করুন, স্টক স্বয়ংক্রিয়ভাবে যোগ হবে।"
      action={
        <Button variant="outline" size="lg" onClick={() => window.print()} className="print:hidden">
          <Printer className="size-5" />
          প্রিন্ট
        </Button>
      }
    >
      <div className="grid gap-4 tablet:grid-cols-3">
        <MetricCard
          title="মোট ফেরত"
          value={`${new Intl.NumberFormat("bn-BD").format(history.length)}টি`}
          hint="রিটার্ন রেকর্ড"
          icon={RotateCcw}
        />
        <MetricCard
          title="আজ ফেরত"
          value={`${new Intl.NumberFormat("bn-BD").format(
            history.filter((item) => item.return_date === todayDate()).length
          )}টি`}
          hint="আজকের রেকর্ড"
          icon={RotateCcw}
        />
        <MetricCard
          title="বিক্রয় পাওয়া গেছে"
          value={`${new Intl.NumberFormat("bn-BD").format(sales.length)}টি`}
          hint="ফেরতের জন্য নির্বাচনযোগ্য"
          icon={Search}
        />
      </div>

      <div className="grid gap-4 laptop:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>নতুন পণ্য ফেরত</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">বিক্রয় খুঁজুন</span>
                <input
                  className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="কাস্টমার, মোবাইল বা বিক্রয় নম্বর"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">বিক্রয় নির্বাচন</span>
                <select
                  className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={selectedSaleId}
                  onChange={(event) => setSelectedSaleId(event.target.value)}
                >
                  {filteredSales.map((sale) => (
                    <option key={sale.id} value={sale.id}>
                      #{sale.id} · {sale.customerName} · ৳ {sale.totalAmount}
                    </option>
                  ))}
                </select>
              </label>

              {selectedSale ? (
                <div className="rounded-md bg-muted/60 p-4">
                  <p className="font-heading text-lg font-semibold">{selectedSale.customerName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedSale.customerMobile || "মোবাইল নেই"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    বিক্রির তারিখ: {selectedSale.timestamp} · বাকি: ৳ {selectedSale.dueAmount}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-4 tablet:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">পণ্য</span>
                  <select
                    className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={selectedProductId}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                  >
                    {(selectedSale?.items || []).map((item) => (
                      <option key={item.productId} value={item.productId}>
                        {item.productName} · বিক্রি {item.quantity} বস্তা
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">ফেরত পরিমাণ</span>
                  <input
                    className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    inputMode="numeric"
                    placeholder="যেমন ২"
                  />
                  {selectedItem ? (
                    <span className="block text-xs text-muted-foreground">
                      সর্বোচ্চ {selectedItem.quantity} বস্তা ফেরত নেওয়া যাবে
                    </span>
                  ) : null}
                </label>
              </div>

              <div className="grid gap-4 tablet:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">ফেরতের কারণ</span>
                  <select
                    className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  >
                    {returnReasons.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">ফেরতের তারিখ</span>
                  <input
                    className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    type="date"
                    value={returnDate}
                    onChange={(event) => setReturnDate(event.target.value)}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">নোট</span>
                <textarea
                  className="min-h-24 w-full rounded-md border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="প্রয়োজন হলে বিস্তারিত লিখুন"
                />
              </label>

              {error ? (
                <p className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" size="lg" disabled={isSubmitting || !selectedSale || !selectedItem}>
                <RotateCcw className="size-5" />
                {isSubmitting ? "সেভ হচ্ছে" : "পণ্য ফেরত সেভ করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ফেরত নির্দেশনা</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>ফেরত সেভ করলে পণ্যটি স্বয়ংক্রিয়ভাবে স্টকে যোগ হবে।</p>
            <p>ফেরত পরিমাণ কখনো বিক্রি হওয়া পরিমাণের বেশি হতে পারবে না।</p>
            <p>বিক্রির মোট টাকা, বাকি ও লাভ backend থেকে নতুন করে হিসাব হবে।</p>
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>রিটার্ন ইতিহাস</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
          <div className="grid gap-3 print:hidden tablet:grid-cols-[1fr_220px]">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">ইতিহাস খুঁজুন</span>
              <input
                className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={historySearch}
                onChange={(event) => {
                  setHistorySearch(event.target.value);
                  setHistoryPage(1);
                }}
                placeholder="কাস্টমার, পণ্য বা রিটার্ন নম্বর"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">কারণ ফিল্টার</span>
              <select
                className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={historyReason}
                onChange={(event) => {
                  setHistoryReason(event.target.value);
                  setHistoryPage(1);
                }}
              >
                <option value="সব">সব</option>
                {returnReasons.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          {paginatedHistory.length > 0 ? (
            paginatedHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-md border bg-background p-4 tablet:flex-row tablet:items-center tablet:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-heading text-lg font-semibold">
                    #{item.id} · {item.customer?.shop_name || "কাস্টমার"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.product?.name || "পণ্য"} · {item.quantity} বস্তা · {item.reason}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    তারিখ: {formatDate(item.return_date)} {item.note ? `· ${item.note}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="মুছুন"
                  onClick={() => void handleDelete(item.id)}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            ))
          ) : (
            <p className="rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
              কোনো রিটার্ন রেকর্ড পাওয়া যায়নি।
            </p>
          )}

          <div className="flex flex-col gap-3 print:hidden tablet:flex-row tablet:items-center tablet:justify-between">
            <p className="text-sm text-muted-foreground">
              পেজ {new Intl.NumberFormat("bn-BD").format(historyPage)} / {new Intl.NumberFormat("bn-BD").format(totalHistoryPages)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={historyPage <= 1}
                onClick={() => setHistoryPage((page) => Math.max(page - 1, 1))}
              >
                আগের
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={historyPage >= totalHistoryPages}
                onClick={() => setHistoryPage((page) => Math.min(page + 1, totalHistoryPages))}
              >
                পরের
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
