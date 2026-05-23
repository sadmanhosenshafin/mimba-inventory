"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  DueFilterBar,
  type DaysFilterValue,
  type RiskFilterValue
} from "@/components/due/due-filter-bar";
import { DueCustomerCard } from "@/components/due/due-customer-card";
import { EmptyState } from "@/components/customers/empty-state";
import { useCustomers } from "@/components/customers/customer-provider";
import { PageContainer } from "@/components/shared/page-container";
import { getDueCustomers } from "@/lib/due/utils";

export default function DueCustomersPage() {
  const { customers } = useCustomers();
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<RiskFilterValue>("all");
  const [days, setDays] = useState<DaysFilterValue>("all");
  const dueCustomers = getDueCustomers(customers);

  const filteredCustomers = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return dueCustomers.filter((customer) => {
      const matchesSearch = searchTerm
        ? [customer.shopName, customer.ownerName, customer.mobile]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm)
        : true;
      const matchesRisk = risk === "all" || customer.risk === risk;
      const matchesDays =
        days === "all" ? true : customer.dueDays >= Number(days);
      return matchesSearch && matchesRisk && matchesDays;
    });
  }, [days, dueCustomers, query, risk]);

  return (
    <PageContainer
      title="বাকি দোকান"
      description="যেসব দোকানের কাছে বাকি আছে তাদের দ্রুত খুঁজুন ও পেমেন্ট সংগ্রহ করুন।"
    >
      <DueFilterBar
        query={query}
        risk={risk}
        days={days}
        onQueryChange={setQuery}
        onRiskChange={setRisk}
        onDaysChange={setDays}
      />

      {filteredCustomers.length > 0 ? (
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <DueCustomerCard key={customer.customerId} customer={customer} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="কোনো বাকি পাওয়া যায়নি"
          description="ফিল্টার বদলে আবার দেখুন।"
        />
      )}
    </PageContainer>
  );
}
