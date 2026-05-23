import type { PaymentCollection } from "@/lib/sales/types";

const takaFormatter = new Intl.NumberFormat("bn-BD");

export function PaymentHistoryList({
  payments
}: {
  payments: PaymentCollection[];
}) {
  if (payments.length === 0) {
    return (
      <p className="rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
        এখনো কোনো পেমেন্ট নেই
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
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
    </div>
  );
}
