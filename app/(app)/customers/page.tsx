"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, SearchX } from "lucide-react";
import { CustomerCard } from "@/components/customers/customer-card";
import { CustomerFloatingActionButton } from "@/components/customers/customer-floating-action-button";
import { CustomerSearch } from "@/components/customers/customer-search";
import { EmptyState } from "@/components/customers/empty-state";
import { RecentCustomerSlider } from "@/components/customers/recent-customer-slider";
import { useCustomers } from "@/components/customers/customer-provider";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

export default function CustomersPage() {
  const { customers } = useCustomers();
  const [query, setQuery] = useState("");

  const recentCustomers = useMemo(
    () =>
      [...customers]
        .sort((first, second) => second.recentScore - first.recentScore)
        .slice(0, 5),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const searchTerm = normalizeSearchText(query);

    if (!searchTerm) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.shopName,
        customer.ownerName,
        customer.mobile,
        customer.address
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm)
    );
  }, [customers, query]);

  return (
    <PageContainer
      title="দোকান"
      description="একবার দোকান সেভ করুন, পরে দ্রুত খুঁজে বিক্রি শুরু করুন।"
      action={
        <Button asChild size="lg">
          <Link href="/customers/add">
            <Plus className="size-5" />
            দোকান যোগ
          </Link>
        </Button>
      }
    >
      <CustomerSearch
        query={query}
        onQueryChange={setQuery}
        suggestions={filteredCustomers}
      />

      {!query ? <RecentCustomerSlider customers={recentCustomers} /> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">
            {query ? "খোঁজার ফলাফল" : "সব দোকান"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredCustomers.length}টি দোকান
          </p>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="দোকান পাওয়া যায়নি"
            description="অন্য নাম, মালিকের নাম বা মোবাইল নাম্বার দিয়ে আবার খুঁজুন।"
            action={
              <Button asChild>
                <Link href="/customers/add">
                  <Plus className="size-5" />
                  নতুন দোকান যোগ
                </Link>
              </Button>
            }
          />
        )}
      </section>

      <CustomerFloatingActionButton href="/customers/add" label="দোকান যোগ" />
    </PageContainer>
  );
}
