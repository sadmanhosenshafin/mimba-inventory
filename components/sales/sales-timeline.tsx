import { CircleDollarSign, ReceiptText } from "lucide-react";
import type { PaymentCollection, Sale } from "@/lib/sales/types";

const takaFormatter = new Intl.NumberFormat("bn-BD");

export function SalesTimeline({
  sale,
  payments = []
}: {
  sale?: Sale;
  payments?: PaymentCollection[];
}) {
  const rows = [
    ...(sale
      ? [
          {
            id: `${sale.id}-created`,
            title: "বিক্রি তৈরি হয়েছে",
            text: `${sale.customerName} · ৳ ${takaFormatter.format(sale.totalAmount)}`,
            time: sale.timestamp,
            icon: ReceiptText
          }
        ]
      : []),
    ...payments.map((payment) => ({
      id: payment.id,
      title: "পেমেন্ট আদায়",
      text: `${payment.customerName} · ৳ ${takaFormatter.format(payment.amount)}`,
      time: payment.timestamp,
      icon: CircleDollarSign
    }))
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <div key={row.id} className="flex gap-3 rounded-lg border bg-card p-4 shadow-soft">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{row.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{row.text}</p>
              <p className="mt-2 text-xs text-muted-foreground">{row.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
