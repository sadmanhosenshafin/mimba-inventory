"use client";

import Link from "next/link";
import { CircleDollarSign, ShieldAlert, UsersRound } from "lucide-react";
import { DueSummaryCard } from "@/components/due/due-summary-card";
import { DueCustomerCard } from "@/components/due/due-customer-card";
import { NotificationPanel } from "@/components/due/notification-panel";
import { useCustomers } from "@/components/customers/customer-provider";
import { useProducts } from "@/components/products/product-provider";
import { useSales } from "@/components/sales/sales-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { getDueCustomers, getDueNotifications } from "@/lib/due/utils";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

export default function DueOverviewPage() {
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { payments } = useSales();
  const dueCustomers = getDueCustomers(customers);
  const notifications = getDueNotifications({ dueCustomers, products, payments });
  const totalDue = dueCustomers.reduce((total, customer) => total + customer.currentDue, 0);
  const todayCollected = payments
    .filter((payment) => payment.timestamp.includes("আজ") || payment.timestamp === "এইমাত্র")
    .reduce((total, payment) => total + payment.amount, 0);
  const overdueCount = dueCustomers.filter((customer) => customer.dueDays >= 3).length;
  const riskyCount = dueCustomers.filter((customer) => customer.risk === "risky").length;

  return (
    <PageContainer
      title="বাকি টাকা"
      description="কার কাছে কত বাকি, কত দিন ধরে আছে এবং কারা ঝুঁকিপূর্ণ তা এক নজরে দেখুন।"
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/notifications">নোটিফিকেশন</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/sales/payment">পেমেন্ট সংগ্রহ</Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <DueSummaryCard
          title="মোট বাকি"
          value={`৳ ${takaFormatter.format(totalDue)}`}
          hint="সব দোকান মিলিয়ে"
          icon={CircleDollarSign}
        />
        <DueSummaryCard
          title="আজ আদায়"
          value={`৳ ${takaFormatter.format(todayCollected)}`}
          hint="লাইভ পেমেন্ট"
          icon={CircleDollarSign}
        />
        <DueSummaryCard
          title="ওভারডিউ"
          value={`${numberFormatter.format(overdueCount)} জন`}
          hint="৩ দিনের বেশি"
          icon={UsersRound}
        />
        <DueSummaryCard
          title="ঝুঁকিপূর্ণ"
          value={`${numberFormatter.format(riskyCount)} জন`}
          hint="৭ দিন বা বড় বাকি"
          icon={ShieldAlert}
        />
      </div>

      <div className="grid gap-4 laptop:grid-cols-[1.2fr_0.9fr]">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">বড় বাকি</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/due/customers">সব দেখুন</Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {dueCustomers.slice(0, 3).map((customer) => (
              <DueCustomerCard key={customer.customerId} customer={customer} />
            ))}
          </div>
        </section>

        <NotificationPanel notifications={notifications} compact />
      </div>
    </PageContainer>
  );
}
