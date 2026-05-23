"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/customers/types";

type CustomerSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  suggestions: Customer[];
};

export function CustomerSearch({
  query,
  onQueryChange,
  suggestions
}: CustomerSearchProps) {
  return (
    <div className="sticky top-16 z-20 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 tablet:top-20 tablet:-mx-6 tablet:px-6 laptop:static laptop:mx-0 laptop:border-0 laptop:bg-transparent laptop:p-0">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="দোকান, মালিক বা মোবাইল খুঁজুন"
          className="h-14 w-full rounded-md border bg-card pl-12 pr-12 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            aria-label="খোঁজা মুছুন"
            onClick={() => onQueryChange("")}
          >
            <X className="size-5" />
          </Button>
        ) : null}
      </div>

      {query ? (
        <div className="mt-2 overflow-hidden rounded-lg border bg-card shadow-soft">
          {suggestions.length > 0 ? (
            suggestions.slice(0, 5).map((customer) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="flex min-h-14 items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/70"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{customer.shopName}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {customer.ownerName} · {customer.mobile}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-primary">নিন</span>
              </Link>
            ))
          ) : (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              কোনো দোকান পাওয়া যায়নি
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
