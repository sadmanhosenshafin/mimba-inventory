import Link from "next/link";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import type { Customer } from "@/lib/customers/types";

export function RecentCustomerSlider({ customers }: { customers: Customer[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">সাম্প্রতিক দোকান</h2>
        <p className="text-sm text-muted-foreground">দ্রুত ট্যাপ করুন</p>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 tablet:mx-0 tablet:px-0">
        {customers.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="min-w-[240px] rounded-lg border bg-card p-4 shadow-soft transition-colors hover:border-primary/40 tablet:min-w-[270px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold">
                  {customer.shopName}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {customer.mobile}
                </p>
              </div>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              শেষ ক্রয়: <span className="font-semibold text-foreground">{customer.lastPurchaseDate}</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
