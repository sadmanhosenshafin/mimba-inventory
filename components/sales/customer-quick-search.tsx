"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import type { Customer } from "@/lib/customers/types";

export function CustomerQuickSearch({
  customers,
  selectedCustomer,
  onSelect
}: {
  customers: Customer[];
  selectedCustomer?: Customer;
  onSelect: (customer: Customer) => void;
}) {
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    const sorted = [...customers].sort((a, b) => b.recentScore - a.recentScore);

    if (!searchTerm) return sorted.slice(0, 5);

    return sorted.filter((customer) =>
      [customer.shopName, customer.ownerName, customer.mobile]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm)
    );
  }, [customers, query]);

  return (
    <section className="sticky top-16 z-20 -mx-4 min-w-0 space-y-3 overflow-hidden border-b bg-background/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 tablet:top-20 tablet:-mx-6 tablet:px-6 laptop:static laptop:mx-0 laptop:border-0 laptop:bg-transparent laptop:p-0">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="দোকান খুঁজুন"
          className="h-14 w-full rounded-md border bg-card pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {selectedCustomer ? (
        <div className="rounded-lg border bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-semibold">
                {selectedCustomer.shopName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCustomer.mobile} · শেষ ক্রয় {selectedCustomer.lastPurchaseDate}
              </p>
            </div>
            <CustomerStatusBadge status={selectedCustomer.status} />
          </div>
          <p className="mt-3 rounded-md bg-muted/65 p-3 text-sm font-semibold">
            বর্তমান বাকি: ৳ {new Intl.NumberFormat("bn-BD").format(selectedCustomer.currentDue)}
          </p>
        </div>
      ) : null}

      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
        {filteredCustomers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            className="min-h-16 min-w-[220px] rounded-lg border bg-card p-3 text-left shadow-soft transition-colors hover:border-primary/40"
            onClick={() => onSelect(customer)}
          >
            <span className="block truncate font-semibold">{customer.shopName}</span>
            <span className="mt-1 block truncate text-sm text-muted-foreground">
              {customer.ownerName} · {customer.mobile}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
