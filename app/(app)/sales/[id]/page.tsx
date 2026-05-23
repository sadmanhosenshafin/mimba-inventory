"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, CircleDollarSign, Pencil } from "lucide-react";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { SalesTimeline } from "@/components/sales/sales-timeline";
import { useSales } from "@/components/sales/sales-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

export default function SaleDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getSaleById, payments } = useSales();
  const sale = getSaleById(params.id);

  if (!sale) notFound();

  return (
    <PageContainer
      title="বিক্রির বিস্তারিত"
      description={`${sale.customerName} · ${sale.timestamp}`}
      action={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/sales">
              <ArrowLeft className="size-5" />
              ফিরে যান
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/sales/payment?customer=${sale.customerId}`}>
              <CircleDollarSign className="size-5" />
              টাকা আদায়
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/sales/${sale.id}/edit`}>
              <Pencil className="size-5" />
              এডিট
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 laptop:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>দোকান</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-xl font-semibold">{sale.customerName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{sale.customerMobile}</p>
                </div>
                <SaleStatusBadge status={sale.status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>বিক্রি হওয়া পণ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sale.items.map((item) => (
                <div key={item.productId} className="rounded-md bg-muted/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {numberFormatter.format(item.quantity)} বস্তা · ৳{" "}
                        {takaFormatter.format(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-heading text-lg font-semibold">
                      ৳ {takaFormatter.format(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>পেমেন্ট সারাংশ</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Info label="মোট" value={`৳ ${takaFormatter.format(sale.totalAmount)}`} />
              <Info label="পরিশোধ" value={`৳ ${takaFormatter.format(sale.paidAmount)}`} />
              <Info label="বাকি" value={`৳ ${takaFormatter.format(sale.dueAmount)}`} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>টাইমলাইন</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesTimeline
                sale={sale}
                payments={payments.filter((payment) => payment.customerId === sale.customerId)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/65 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
    </div>
  );
}
