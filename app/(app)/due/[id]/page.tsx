"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, CircleDollarSign, StickyNote } from "lucide-react";
import { PaymentHistoryList } from "@/components/due/payment-history-list";
import { RiskBadge } from "@/components/due/risk-badge";
import { useCustomers } from "@/components/customers/customer-provider";
import { useSales } from "@/components/sales/sales-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDueCustomers, getUnpaidSalesForCustomer } from "@/lib/due/utils";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

export default function CustomerDueDetailsPage() {
  const params = useParams<{ id: string }>();
  const { customers } = useCustomers();
  const { sales, payments } = useSales();
  const dueCustomer = getDueCustomers(customers).find(
    (customer) => customer.customerId === params.id
  );

  if (!dueCustomer) notFound();

  const customerPayments = payments.filter(
    (payment) => payment.customerId === dueCustomer.customerId
  );
  const unpaidSales = getUnpaidSalesForCustomer(sales, dueCustomer.customerId);

  return (
    <PageContainer
      title={dueCustomer.shopName}
      description={`${dueCustomer.ownerName} · ${dueCustomer.mobile}`}
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/due/customers">
              <ArrowLeft className="size-5" />
              ফিরে যান
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/sales/payment?customer=${dueCustomer.customerId}`}>
              <CircleDollarSign className="size-5" />
              পেমেন্ট সংগ্রহ করুন
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 laptop:grid-cols-[0.9fr_1.3fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>বাকি সারাংশ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-4xl font-semibold">
                  ৳ {takaFormatter.format(dueCustomer.currentDue)}
                </p>
                <RiskBadge risk={dueCustomer.risk} />
              </div>
              <Info
                label="বাকি আছে"
                value={`${numberFormatter.format(dueCustomer.dueDays)} দিন`}
              />
              <Info label="শেষ পেমেন্ট" value={dueCustomer.lastPaymentDate} />
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
              <p className="leading-7 text-muted-foreground">{dueCustomer.notes}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>অপরিশোধিত বিক্রি</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unpaidSales.length > 0 ? (
                unpaidSales.map((sale) => (
                  <Link key={sale.id} href={`/sales/${sale.id}`}>
                    <div className="rounded-md border p-3 hover:bg-muted/50">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{sale.timestamp}</p>
                        <p className="font-heading text-lg font-semibold">
                          ৳ {takaFormatter.format(sale.dueAmount)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        মোট ৳ {takaFormatter.format(sale.totalAmount)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
                  কোনো অপরিশোধিত বিক্রি নেই
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>পেমেন্ট ইতিহাস</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentHistoryList payments={customerPayments} />
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
      <p className="mt-1 font-heading text-xl font-semibold">{value}</p>
    </div>
  );
}
