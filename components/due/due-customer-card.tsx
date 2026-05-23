import Link from "next/link";
import { CircleDollarSign, Phone } from "lucide-react";
import { RiskBadge } from "@/components/due/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DueCustomer } from "@/lib/due/types";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

export function DueCustomerCard({ customer }: { customer: DueCustomer }) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/due/${customer.customerId}`} className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold">
              {customer.shopName}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {customer.ownerName} · {customer.mobile}
            </p>
          </Link>
          <RiskBadge risk={customer.risk} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/65 p-3">
            <p className="text-xs text-muted-foreground">বর্তমান বাকি</p>
            <p className="mt-1 font-heading text-2xl font-semibold">
              ৳ {takaFormatter.format(customer.currentDue)}
            </p>
          </div>
          <div className="rounded-md bg-muted/65 p-3">
            <p className="text-xs text-muted-foreground">বাকি আছে</p>
            <p className="mt-1 font-heading text-2xl font-semibold">
              {numberFormatter.format(customer.dueDays)} দিন
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            শেষ পেমেন্ট:{" "}
            <span className="font-semibold text-foreground">
              {customer.lastPaymentDate}
            </span>
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="icon" aria-label="ফোন">
              <a href={`tel:${customer.mobile}`}>
                <Phone className="size-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="icon" aria-label="টাকা আদায়">
              <Link href={`/sales/payment?customer=${customer.customerId}`}>
                <CircleDollarSign className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
