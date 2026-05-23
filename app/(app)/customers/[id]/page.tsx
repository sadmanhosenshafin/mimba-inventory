"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Edit, Phone, StickyNote } from "lucide-react";
import { CustomerFloatingActionButton } from "@/components/customers/customer-floating-action-button";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import { useCustomers } from "@/components/customers/customer-provider";
import { useSales } from "@/components/sales/sales-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

export default function CustomerDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getCustomerById } = useCustomers();
  const { sales, payments } = useSales();
  const customer = getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const customerSales = sales.filter((sale) => sale.customerId === customer.id);
  const customerPayments = payments.filter((payment) => payment.customerId === customer.id);

  return (
    <PageContainer
      title={customer.shopName}
      description={`${customer.ownerName} · ${customer.mobile}`}
      action={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/customers">
              <ArrowLeft className="size-5" />
              ফিরে যান
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="size-5" />
              এডিট
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 laptop:grid-cols-[0.95fr_1.4fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>দোকানের তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">অবস্থা</span>
                <CustomerStatusBadge status={customer.status} />
              </div>
              <InfoRow label="মালিক" value={customer.ownerName} />
              <InfoRow label="মোবাইল" value={customer.mobile} />
              <InfoRow label="ঠিকানা" value={customer.address} />
              <InfoRow label="যোগ হয়েছে" value={customer.createdDate} />
              <Button asChild variant="outline" className="w-full">
                <a href={`tel:${customer.mobile}`}>
                  <Phone className="size-5" />
                  ফোন করুন
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>মোট বাকি</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-semibold">
                ৳ {takaFormatter.format(customer.currentDue)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                ভবিষ্যৎ বিক্রির সময় এই তথ্য সামনে থাকবে।
              </p>
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
              <p className="leading-7 text-muted-foreground">{customer.notes}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক ক্রয়</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customerSales.slice(0, 6).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/60 p-3"
                >
                  <div>
                    <p className="font-semibold">
                      {purchase.items.map((item) => item.productName).join(", ") || "বিক্রি"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {numberFormatter.format(purchase.items.reduce((total, item) => total + item.quantity, 0))} বস্তা · {purchase.timestamp}
                    </p>
                  </div>
                  <p className="font-heading text-lg font-semibold">৳ {takaFormatter.format(purchase.totalAmount)}</p>
                </div>
              ))}
              {customerSales.length === 0 ? (
                <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">এখনো কোনো ক্রয় নেই</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>পেমেন্ট ইতিহাস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customerPayments.slice(0, 6).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <p className="font-semibold">{payment.note}</p>
                    <p className="text-sm text-muted-foreground">{payment.timestamp}</p>
                  </div>
                  <p className="font-heading text-lg font-semibold text-primary">
                    ৳ {takaFormatter.format(payment.amount)}
                  </p>
                </div>
              ))}
              {customerPayments.length === 0 ? (
                <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">এখনো কোনো পেমেন্ট নেই</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomerFloatingActionButton
        href={`/sales/quick?customer=${customer.id}`}
        label="দ্রুত বিক্রি"
        type="sell"
      />
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
