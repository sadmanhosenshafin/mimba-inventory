"use client";

import Link from "next/link";
import { CircleDollarSign, Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { useSales } from "@/components/sales/sales-provider";
import { MetricCard } from "@/components/shared/metric-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

export default function SalesPage() {
  const { sales, deleteSale } = useSales();
  const totalSales = sales.reduce((total, sale) => total + sale.totalAmount, 0);
  const totalDue = sales.reduce((total, sale) => total + sale.dueAmount, 0);

  return (
    <PageContainer
      title="বিক্রি"
      description="সাম্প্রতিক বিক্রি, পরিশোধ ও বাকি এক নজরে দেখুন।"
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/sales/payment">
              <CircleDollarSign className="size-5" />
              টাকা আদায়
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/sales/quick">
              <Plus className="size-5" />
              দ্রুত বিক্রি
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 tablet:grid-cols-3">
        <MetricCard
          title="মোট বিক্রি"
          value={`৳ ${takaFormatter.format(totalSales)}`}
          hint="লাইভ বিক্রি"
          icon={ReceiptText}
        />
        <MetricCard
          title="মোট বাকি"
          value={`৳ ${takaFormatter.format(totalDue)}`}
          hint="বিক্রি থেকে বাকি"
          icon={CircleDollarSign}
          tone="warning"
        />
        <MetricCard
          title="বিক্রির সংখ্যা"
          value={`${numberFormatter.format(sales.length)}টি`}
          hint="সাম্প্রতিক লেনদেন"
          icon={ReceiptText}
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">সাম্প্রতিক বিক্রি</h2>
        <div className="grid gap-4">
          {sales.map((sale) => {
            const quantity = sale.items.reduce((total, item) => total + item.quantity, 0);
            return (
              <Card key={sale.id} className="transition-colors hover:border-primary/40">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-heading text-lg font-semibold">
                          {sale.customerName}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {numberFormatter.format(quantity)} বস্তা · {sale.timestamp}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <SaleStatusBadge status={sale.status} />
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/sales/${sale.id}/edit`}>
                            <Pencil className="size-4" />
                            এডিট
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("আপনি কি নিশ্চিত?")) void deleteSale(sale.id);
                          }}
                        >
                          <Trash2 className="size-4" />
                          ডিলিট
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 tablet:grid-cols-3">
                      <Info label="মোট" value={`৳ ${takaFormatter.format(sale.totalAmount)}`} />
                      <Info label="পরিশোধ" value={`৳ ${takaFormatter.format(sale.paidAmount)}`} />
                      <Info label="বাকি" value={`৳ ${takaFormatter.format(sale.dueAmount)}`} />
                    </div>
                    <Button asChild variant="ghost" className="mt-3 w-full">
                      <Link href={`/sales/${sale.id}`}>বিস্তারিত দেখুন</Link>
                    </Button>
                  </CardContent>
                </Card>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold">{value}</p>
    </div>
  );
}
