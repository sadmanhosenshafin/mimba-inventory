import Link from "next/link";
import { ArrowRight, Phone, ReceiptText } from "lucide-react";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Customer } from "@/lib/customers/types";

const takaFormatter = new Intl.NumberFormat("bn-BD");

export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/customers/${customer.id}`} className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold leading-tight">
              {customer.shopName}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {customer.ownerName}
            </p>
          </Link>
          <CustomerStatusBadge status={customer.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/65 p-3">
            <p className="text-xs text-muted-foreground">মোবাইল</p>
            <p className="mt-1 text-sm font-semibold">{customer.mobile}</p>
          </div>
          <div className="rounded-md bg-muted/65 p-3">
            <p className="text-xs text-muted-foreground">বর্তমান বাকি</p>
            <p className="mt-1 font-heading text-lg font-semibold">
              ৳ {takaFormatter.format(customer.currentDue)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            শেষ ক্রয়: <span className="font-semibold text-foreground">{customer.lastPurchaseDate}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="icon" aria-label="ফোন">
              <a href={`tel:${customer.mobile}`}>
                <Phone className="size-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="icon" aria-label="দ্রুত বিক্রি">
              <Link href={`/sales/quick?customer=${customer.id}`}>
                <ReceiptText className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="বিস্তারিত">
              <Link href={`/customers/${customer.id}`}>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
